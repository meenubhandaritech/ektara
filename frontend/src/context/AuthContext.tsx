import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  configureAuthPersistence,
  getAuthErrorMessage,
  getGoogleRedirectResult,
  firebaseConfigured,
  getCurrentUserIdToken,
  observeAuthState,
  resetPassword as resetFirebasePassword,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
} from '../lib/firebase';
import { ApiError, api, setTokenGetter } from '../services/api';
import type { Me, PlatformStatus } from '../types';

interface AuthState {
  status: PlatformStatus | null;
  statusError: string | null;
  authError: string | null;
  me: Me | null;
  loading: boolean;
  firebaseMissing: boolean;
  demoLogin: (kind: 'user' | 'admin') => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);
const DEMO_KEY = 'ektara-demo-session';

function readDemo(): string | null {
  try {
    return localStorage.getItem(DEMO_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    setMe(await api<Me>('/me'));
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      let s: PlatformStatus;
      try {
        s = await api<PlatformStatus>('/status', { auth: false });
      } catch (e: any) {
        if (!cancelled) {
          setStatusError(e.message);
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;
      setStatus(s);

      if (s.demoMode) {
        const token = readDemo();
        setTokenGetter(async () => readDemo());
        if (token) {
          try {
            await refreshMe();
          } catch (error) {
            setMe(null);
            setStatusError(
              error instanceof Error ? error.message : 'Unable to load the demo account from the EKTARA server.',
            );
          }
        }
        setLoading(false);
        return;
      }

      if (!firebaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        await configureAuthPersistence();
        if (cancelled) return;
        setTokenGetter(getCurrentUserIdToken);
        try {
          await getGoogleRedirectResult();
        } catch (error) {
          setAuthError(getAuthErrorMessage(error));
        }
        if (cancelled) return;
        unsub = observeAuthState((user) => {
          if (!user) {
            setMe(null);
            setLoading(false);
            return;
          }
          void refreshMe()
            .then(() => setStatusError(null))
            .catch(async (error: unknown) => {
              setMe(null);
              if (error instanceof ApiError && error.status === 401) {
                try {
                  await signOut();
                } catch (signOutError) {
                  setStatusError(
                    signOutError instanceof Error
                      ? signOutError.message
                      : 'The invalid Firebase session could not be cleared.',
                  );
                }
              } else {
                setStatusError(
                  error instanceof Error ? error.message : 'Unable to verify this account with the EKTARA server.',
                );
              }
            })
            .finally(() => setLoading(false));
        });
      } catch (error) {
        setStatusError(error instanceof Error ? error.message : 'Firebase authentication could not be initialized.');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [refreshMe]);

  const demoLogin = useCallback(
    async (kind: 'user' | 'admin') => {
      try {
        localStorage.setItem(DEMO_KEY, kind === 'admin' ? 'demo-admin' : 'demo-user');
      } catch {
        throw new Error('Browser storage is unavailable, so the demo session cannot be kept.');
      }
      await refreshMe();
    },
    [refreshMe],
  );

  const login = useCallback(async (email: string, password: string) => {
    await signIn(email, password);
  }, []);

  const googleLogin = useCallback(async () => {
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      if (!user) return false;
      await refreshMe();
      return true;
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, [refreshMe]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await signUp(email, password, name);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetFirebasePassword(email);
  }, []);

  const logout = useCallback(async () => {
    if (status?.demoMode) {
      try {
        localStorage.removeItem(DEMO_KEY);
      } catch {
        /* ignore */
      }
    } else if (firebaseConfigured) {
      await signOut();
    }
    setMe(null);
  }, [status]);

  const value = useMemo<AuthState>(
    () => ({
      status,
      statusError,
      authError,
      me,
      loading,
      firebaseMissing:
        !firebaseConfigured &&
        (status?.demoMode === false || import.meta.env.VITE_DEMO_MODE?.toLowerCase() === 'false'),
      demoLogin,
      login,
      googleLogin,
      register,
      resetPassword,
      logout,
      refreshMe,
    }),
    [status, statusError, authError, me, loading, demoLogin, login, googleLogin, register, resetPassword, logout, refreshMe],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
