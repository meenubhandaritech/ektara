import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';

/** Frontend convenience only. The API independently enforces authentication and roles. */
export function RequireAuth({ children, role }: { children: ReactNode; role?: 'admin' }) {
  const { me, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (role === 'admin' && me.role !== 'admin' && me.role !== 'editor') return <Navigate to="/dashboard" replace />;
  if (!me.profile?.onboarded && loc.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

/** For the onboarding page: needs a session but not a completed profile. */
export function RequireSession({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
