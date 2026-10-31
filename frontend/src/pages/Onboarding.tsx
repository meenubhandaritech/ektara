import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import type { Profile } from '../types';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

export default function Onboarding() {
  const { me, refreshMe, status } = useAuth();
  const { lang } = useLang();
  const nav = useNavigate();
  const [displayName, setName] = useState(me?.profile?.displayName ?? '');
  const [state, setState] = useState(me?.profile?.state ?? '');
  const [residency, setResidency] = useState<Profile['residency']>(me?.profile?.residency ?? 'unsure');
  const [consent, setConsent] = useState(!!me?.profile?.consentAt || !!status?.demoMode);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!displayName.trim()) return setErr('Please enter a name to personalise your dashboard.');
    if (!consent) return setErr('Please consent to store this information.');
    setBusy(true);
    try {
      await api('/me', { method: 'PUT', body: { displayName: displayName.trim(), state: state || undefined, residency, language: lang, consent: true, onboarded: true } });
      await refreshMe();
      nav('/navigator');
    } catch (e2: any) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page max-w-6xl py-10 sm:py-16">
      <div className="grid items-stretch gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <section className="flex flex-col justify-between rounded-[2rem] bg-forest-900 p-7 text-white sm:p-10">
          <div>
            <p className="eyebrow text-sage-200">A thoughtful first step</p>
            <h1 className="mt-6 max-w-md text-4xl leading-tight text-white sm:text-5xl">Let’s make your next steps feel more personal.</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
              A few details help us tailor your preparation dashboard to you. Share only what feels comfortable.
            </p>
          </div>
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-sm font-semibold text-sage-200">Your information stays yours</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              These details are used only to personalise your experience. You can update them later in your dashboard.
            </p>
          </div>
        </section>

        <form className="card space-y-6 p-6 sm:p-9" onSubmit={submit} noValidate>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sm font-bold text-forest-900">01</span>
            <div>
              <p className="eyebrow">Your profile</p>
              <p className="mt-1 text-sm text-ink-soft">A few quick details to get started</p>
            </div>
          </div>

          <div className="space-y-5 border-t border-beige-200 pt-6">
            <div>
              <label className="label" htmlFor="n">What should we call you?</label>
              <input id="n" autoComplete="name" className="input" value={displayName} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <div>
              <label className="label" htmlFor="s">State or union territory (optional)</label>
              <select id="s" className="input" value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">Prefer not to say</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="r">Citizenship or residency status</label>
              <select id="r" className="input" value={residency} onChange={(e) => setResidency(e.target.value as Profile['residency'])}>
                <option value="resident-indian">Resident Indian</option>
                <option value="nri">NRI</option>
                <option value="oci">OCI cardholder</option>
                <option value="foreign">Foreign national</option>
                <option value="unsure">I’m not sure</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-beige-200 bg-beige-50 p-4 text-sm leading-relaxed text-ink-soft">
            <input type="checkbox" className="mt-1 shrink-0 accent-forest-800" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I consent to EKTARA storing these details only to personalise my preparation dashboard.</span>
          </label>
          {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving your details…' : 'Continue to your next step'}</button>
        </form>
      </div>
    </div>
  );
}
