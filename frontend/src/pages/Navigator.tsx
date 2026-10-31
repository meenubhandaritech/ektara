import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Disclaimer, ErrorBox, SourceCard, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Guidance, NavigatorAnswers, SourceItem } from '../types';

type Key = keyof NavigatorAnswers;
const QUESTIONS: { key: Key; title: string; options: [string, string][] }[] = [
  { key: 'residence', title: 'Where do you currently live?', options: [['india', 'In India'], ['abroad', 'Outside India'], ['unsure', "I'm not sure"]] },
  {
    key: 'status',
    title: 'What is your citizenship or residency status?',
    options: [['resident-indian', 'Resident Indian'], ['nri', 'NRI'], ['oci', 'OCI cardholder'], ['foreign', 'Foreign national'], ['unsure', "I'm not sure"]],
  },
  {
    key: 'relationship',
    title: 'Are you considering adopting an unrelated child, a relative, or a stepchild?',
    options: [['unrelated', 'An unrelated child'], ['relative', 'A relative’s child'], ['stepchild', 'My spouse’s child'], ['unsure', "I'm not sure"]],
  },
  {
    key: 'focus',
    title: 'Are you exploring the general process, or a particular legal route?',
    options: [['general', 'The general process'], ['hama', 'HAMA (Hindu Adoptions and Maintenance Act)'], ['unsure', "I'm not sure"]],
  },
  { key: 'knowsCaraCarings', title: 'Do you already know about CARA and CARINGS?', options: [['yes', 'Yes'], ['no', 'No'], ['unsure', 'A little']] },
];

export default function Navigator() {
  const { me } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<NavigatorAnswers>>({});
  const [result, setResult] = useState<{ g: Guidance; sources: SourceItem[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const q = QUESTIONS[step];

  async function compute(final: NavigatorAnswers) {
    setBusy(true);
    setError(null);
    try {
      const [{ guidance }, { items }] = await Promise.all([
        api<{ guidance: Guidance }>('/navigator', { method: 'POST', body: final, auth: false }),
        api<{ items: SourceItem[] }>('/sources', { auth: false }),
      ]);
      setResult({ g: guidance, sources: items.filter((s) => guidance.sourceIds.includes(s.id)) });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function choose(value: string) {
    const next = { ...answers, [q.key]: value } as Partial<NavigatorAnswers>;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else compute(next as NavigatorAnswers);
  }

  function changeAnswer(index: number) {
    setResult(null);
    setError(null);
    setStep(index);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api('/journey/guide', { method: 'POST', body: answers });
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setSaved(false);
    setError(null);
  }

  return (
    <div className="container-page max-w-4xl space-y-7 py-8 sm:py-12">
      <header className="rounded-3xl bg-gradient-to-br from-sage-100 via-ivory to-peach-100 p-6 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">A calm first orientation</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Adoption Route Navigator</h1>
          <p className="leading-relaxed text-ink-soft">
          A few questions to show which official information may be relevant. It never decides eligibility. Choose “I’m not sure” whenever you like.
          </p>
          <div className="max-w-3xl pt-1"><Disclaimer kind="prelim" /></div>
        </div>
      </header>

      {error && <ErrorBox message={error} />}
      {busy && <Spinner />}

      {!result && !busy && (
        <section className="overflow-hidden rounded-3xl border border-beige-200 bg-white shadow-sm" aria-live="polite">
          <div className="space-y-4 bg-ivory-100 p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peach-500">A few steps, at your pace</p>
                <p className="mt-1 text-sm font-medium text-forest-900">Question {step + 1} <span className="font-normal text-ink-soft">of {QUESTIONS.length}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-ink-soft">Your answers are only used to find relevant information.</p>
                {step > 0 && (
                  <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={restart}>
                    Start over
                  </button>
                )}
              </div>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-sage-100"
              role="progressbar"
              aria-label="Question progress"
              aria-valuemin={1}
              aria-valuemax={QUESTIONS.length}
              aria-valuenow={step + 1}
            >
              <div
                className="h-full rounded-full bg-forest-600 transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <ol className="grid grid-cols-5 gap-2" aria-label="Navigator steps">
              {QUESTIONS.map((question, i) => (
                <li key={question.key}>
                  <div
                    className={`h-1.5 rounded-full transition-colors duration-200 motion-reduce:transition-none ${
                      i <= step ? 'bg-forest-600' : 'bg-beige-200'
                    }`}
                    aria-current={i === step ? 'step' : undefined}
                  />
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-5 p-5 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">Tell us what fits best</p>
              <h2 className="mt-2 text-2xl font-semibold leading-snug text-forest-900 sm:text-3xl">{q.title}</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={q.title}>
              {q.options.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={answers[q.key] === value}
                  className={`group flex min-h-14 items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left text-sm font-medium text-forest-900 transition-colors duration-150 hover:border-forest-600 hover:bg-sage-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 motion-reduce:transition-none ${
                    answers[q.key] === value ? 'border-forest-600 bg-sage-100' : 'border-beige-200 bg-white'
                  }`}
                  onClick={() => choose(value)}
                >
                  <span>{label}</span>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-beige-200 text-xs text-forest-700 transition-colors group-hover:border-forest-700 motion-reduce:transition-none" aria-hidden>→</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-beige-200 pt-4">
              {step > 0 ? (
                <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              ) : <span />}
              <p className="text-right text-xs text-ink-soft">You can choose “I’m not sure” whenever you like.</p>
            </div>
          </div>
        </section>
      )}

      {result && (
        <section className="space-y-5">
          <div className="card space-y-4 !rounded-3xl !p-6 sm:!p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">Your information guide</p>
            <h2 className="text-2xl font-semibold text-forest-900 sm:text-3xl">{result.g.routeTitle}</h2>
            <h3 className="text-sm font-semibold text-forest-900">Why this information may be relevant</h3>
            <p className="leading-relaxed text-ink-soft">{result.g.summary}</p>
            <Disclaimer kind="prelim" />
            <div className="rounded-2xl border border-beige-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-forest-900">Your answers</h3>
              <dl className="mt-3 space-y-2">
                {QUESTIONS.map((question, index) => {
                  const value = answers[question.key];
                  const answerLabel = question.options.find(([option]) => option === value)?.[1] ?? 'Not answered';
                  return (
                    <div key={question.key} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div>
                        <dt className="font-medium text-forest-900">{question.title}</dt>
                        <dd className="text-ink-soft">{answerLabel}</dd>
                      </div>
                      <button type="button" className="btn-ghost !px-3 !py-1.5" onClick={() => changeAnswer(index)}>
                        Change
                      </button>
                    </div>
                  );
                })}
              </dl>
            </div>
            {result.g.seekProfessionalHelp && (
              <p className="rounded-2xl border border-peach-500/30 bg-peach-100 p-4 text-sm leading-relaxed">
                Because your situation may involve special provisions or uncertain answers, please confirm with CARA or a qualified lawyer or professional before relying on this.
              </p>
            )}
          </div>

          {[
            ['Legal framework to explore', result.g.frameworks],
            ['Important considerations', result.g.considerations],
            ['Relevant authorities and organisations', result.g.authorities],
            ['Suggested next steps', result.g.nextSteps],
          ].map(([title, items]) => (
            <div key={title as string} className="card !rounded-2xl !p-5 sm:!p-6">
              <h3 className="mb-3 text-xl font-semibold text-forest-900">{title as string}</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {(items as string[]).map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-forest-900">Official sources</h3>
            {result.sources.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {result.sources.map((s) => (
                  <SourceCard key={s.id} s={s} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-beige-200 bg-white p-4 text-sm text-ink-soft">
                No verified source matched this preliminary result. Start with the official CARA guidance and confirm your situation directly.
              </p>
            )}
          </div>

          <div className="card space-y-3 !rounded-2xl !p-5 sm:!p-6">
            <h3 className="text-xl font-semibold text-forest-900">Your preparation checklist</h3>
            {me ? (
              saved ? (
                <p role="status" className="text-sm text-forest-800">
                  Saved. Your route and route-specific checklist are on your <Link className="underline" to="/dashboard">dashboard</Link>.
                </p>
              ) : (
                <>
                  <p className="text-sm text-ink-soft">Save this to create a route-specific preparation checklist on your dashboard.</p>
                  <button className="btn-primary" onClick={save} disabled={busy}>
                    Save to my dashboard
                  </button>
                </>
              )
            ) : (
              <p className="text-sm text-ink-soft">
                <Link className="underline" to="/register">Create a free account</Link> to save this route and get a matching checklist.
              </p>
            )}
          </div>

          <button className="btn-secondary" onClick={restart}>
            Start again
          </button>
        </section>
      )}
    </div>
  );
}
