import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBox, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getAuthErrorMessage } from '../lib/firebase';

function friendly(error: unknown): string {
  return getAuthErrorMessage(error);
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-page max-w-md py-8 sm:py-12">
      <div className="card space-y-5 border border-beige-200 bg-white/90">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">EKTARA · private account</p>
          <h1 className="text-3xl">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

function Unavailable() {
  const { statusError, firebaseMissing } = useAuth();
  if (firebaseMissing)
    return <ErrorBox message="Sign-in is not configured on this deployment (Firebase settings are missing), and demo mode is off." />;
  if (statusError) return <ErrorBox message={`The EKTARA server is not reachable: ${statusError}`} />;
  return null;
}

function DemoLogin() {
  const { status, demoLogin } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  if (!status?.demoMode) return null;
  async function go(kind: 'user' | 'admin') {
    try {
      await demoLogin(kind);
      nav(kind === 'admin' ? '/admin' : '/dashboard');
    } catch (e: any) {
      setErr(e.message);
    }
  }
  return (
    <div className="space-y-3 rounded-2xl border border-peach-200 bg-peach-100 p-4 text-sm">
      <p className="font-semibold uppercase tracking-wide text-forest-900">Demo mode</p>
      <p>Use a synthetic sample account. Data lives only in the demo server’s memory and resets when it restarts.</p>
      {err && <p role="alert" className="text-red-800">{err}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => go('user')}>Continue as demo user</button>
        <button className="btn-secondary" onClick={() => go('admin')}>Continue as demo admin</button>
      </div>
    </div>
  );
}

function GoogleSignInButton({ onSignedIn }: { onSignedIn: () => void }) {
  const { googleLogin, status } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!status || status.demoMode) return null;

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      if (await googleLogin()) onSignedIn();
    } catch (error) {
      setErr(friendly(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
      <button type="button" className="btn-secondary w-full" disabled={busy} onClick={submit}>
        {busy ? 'Connecting to Google…' : 'Continue with Google'}
      </button>
    </div>
  );
}

export function LoginPage() {
  const { me, login, status, loading, authError } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useLang();

  if (loading) return <Spinner />;
  if (me) return <Navigate to={loc.state?.from ?? '/dashboard'} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      nav(loc.state?.from ?? '/dashboard');
    } catch (e2) {
      setErr(friendly(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title={t('nav.login')}>
      <Unavailable />
      <DemoLogin />
      {authError && <p role="alert" className="text-sm text-red-800">{authError}</p>}
      <GoogleSignInButton onSignedIn={() => nav(loc.state?.from ?? '/dashboard')} />
      {status && !status.demoMode && (
        <form className="space-y-4 border-t border-beige-200 pt-4" onSubmit={submit} noValidate>
          <div>
            <label className="label" htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pw">{t('auth.password')}</label>
            <input id="pw" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || !email || !password}>{t('nav.login')}</button>
          <p className="text-sm">
            <Link className="underline" to="/forgot-password">{t('auth.forgot')}</Link> · <Link className="underline" to="/register">{t('nav.register')}</Link>
          </p>
        </form>
      )}
    </Shell>
  );
}

export function RegisterPage() {
  const { me, register, status, loading, authError } = useAuth();
  const nav = useNavigate();
  const { t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (me) return <Navigate to="/dashboard" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (name.trim().length < 1) return setErr('Please enter your name.');
    if (password.length < 8) return setErr('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setErr('Passwords do not match.');
    if (!consent) return setErr('Please agree to the Privacy Policy to continue.');
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim());
      nav('/onboarding');
    } catch (e2) {
      setErr(friendly(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title={t('nav.register')}>
      <Unavailable />
      <DemoLogin />
      {authError && <p role="alert" className="text-sm text-red-800">{authError}</p>}
      <GoogleSignInButton onSignedIn={() => nav('/dashboard')} />
      {status && !status.demoMode && (
        <form className="space-y-4 border-t border-beige-200 pt-4" onSubmit={submit} noValidate>
          <div>
            <label className="label" htmlFor="name">{t('auth.name')}</label>
            <input id="name" autoComplete="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div>
            <label className="label" htmlFor="email">{t('auth.email')}</label>
            <input id="email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pw">{t('auth.password')}</label>
            <input id="pw" type="password" autoComplete="new-password" required minLength={8} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="confirm-pw">Confirm password</label>
            <input id="confirm-pw" type="password" autoComplete="new-password" required minLength={8} className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              {t('auth.consent')} <Link className="underline" to="/privacy">Privacy Policy</Link>
            </span>
          </label>
          <p className="text-xs text-ink-soft">We never ask for Aadhaar numbers, passport scans or medical records.</p>
          {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>{t('nav.register')}</button>
          <p className="text-sm">Already have an account? <Link className="underline" to="/login">Log in</Link></p>
        </form>
      )}
    </Shell>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword, status } = useAuth();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setDone(true);
    } catch (e2) {
      setErr(friendly(e2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Reset password">
      {status?.demoMode ? (
        <p className="text-sm">Password reset is not available in demo mode, because demo accounts have no passwords.</p>
      ) : done ? (
        <p role="status" className="text-sm">If an account exists for that email, a reset link has been sent.</p>
      ) : (
        <form className="space-y-4 border-t border-beige-200 pt-4" onSubmit={submit} noValidate>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || !email}>Send reset link</button>
        </form>
      )}
      <p className="text-sm"><Link className="underline" to="/login">Back to log in</Link></p>
    </Shell>
  );
}
