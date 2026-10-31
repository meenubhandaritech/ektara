import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './app';

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function configureAuthPersistence(): Promise<void> {
  await setPersistence(getFirebaseAuth(), browserLocalPersistence);
}

export async function signUp(email: string, password: string, name: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const mobile = typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  if (mobile) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function getGoogleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(getFirebaseAuth());
  return result?.user ?? null;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in was cancelled.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with this email. Sign in with its original method first.';
  }
  if (code === 'auth/popup-blocked') return 'The sign-in popup was blocked. Please allow popups or try again.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Email or password is incorrect.';
  }
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists.';
  if (code === 'auth/weak-password') return 'Please choose a stronger password (at least 8 characters).';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
  if (code === 'auth/network-request-failed') return 'Could not reach Firebase. Check your internet connection and try again.';
  if (code === 'auth/operation-not-allowed') return 'This sign-in method is not enabled for this Firebase project.';
  if (error instanceof Error && !code) return error.message;
  return 'Authentication could not be completed. Please try again.';
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

export function getCurrentUserIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  return user ? user.getIdToken() : Promise.resolve(null);
}

export function observeAuthState(
  listener: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(getFirebaseAuth(), listener);
}
