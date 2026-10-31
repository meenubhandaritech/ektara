import { ArrowDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Disclaimer } from '../components/ui';
import { JOURNEY_STAGES } from '../data/education';

export default function Journey() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = JOURNEY_STAGES[activeStage];
  const progress = ((activeStage + 1) / JOURNEY_STAGES.length) * 100;

  return (
    <div className="container-page space-y-8 py-8 sm:space-y-10 sm:py-12">
      <header className="rounded-3xl bg-gradient-to-br from-sage-100 via-ivory to-peach-100 p-6 sm:p-10">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">A steady step-by-step overview</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">The adoption journey</h1>
          <p className="leading-relaxed text-ink-soft">
            A general overview of the stages. Procedures can differ by route (for example inter-country, relative or step-parent), and EKTARA never states waiting times or promises outcomes. Confirm each step with the official sources.
          </p>
          <div className="max-w-3xl"><Disclaimer /></div>
          <Link to="/navigator" className="btn-secondary">
            Check which information may apply to you
          </Link>
        </div>
      </header>

      <section className="space-y-5" aria-label="Adoption journey timeline">
        <div className="card space-y-4 !rounded-2xl !p-5 sm:!p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-peach-500">Your place in the overview</p>
              <h2 className="mt-1 text-xl font-semibold text-forest-900">Stage {activeStage + 1} <span className="font-normal text-ink-soft">of {JOURNEY_STAGES.length}</span></h2>
            </div>
            <p className="text-sm text-ink-soft">{Math.round(progress)}% of stages explored</p>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-sage-100"
            role="progressbar"
            aria-label="Journey stage"
            aria-valuemin={1}
            aria-valuemax={JOURNEY_STAGES.length}
            aria-valuenow={activeStage + 1}
          >
            <div
              className="h-full rounded-full bg-forest-600 transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {JOURNEY_STAGES.map((s, i) => {
              const isActive = i === activeStage;
              const isComplete = i < activeStage;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`flex h-full w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors duration-150 motion-reduce:transition-none ${
                      isActive
                        ? 'border-forest-600 bg-sage-100 text-forest-900'
                        : 'border-beige-200 bg-white text-ink-soft hover:border-forest-600 hover:bg-ivory-100'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => setActiveStage(i)}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive || isComplete ? 'bg-forest-700 text-white' : 'bg-beige-100 text-ink-soft'
                    }`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="pt-1 text-sm font-medium leading-snug">{s.name.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <article className="overflow-hidden rounded-3xl border border-beige-200 bg-white shadow-sm" aria-live="polite">
          <header className="border-b border-beige-200 bg-ivory-100 px-5 py-5 sm:px-8 sm:py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-500">Stage {String(activeStage + 1).padStart(2, '0')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-forest-900 sm:text-3xl">{stage.name.replace(/^\d+\.\s*/, '')}</h2>
          </header>
          <div className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-8">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">What happens</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{stage.what}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">Who is responsible</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{stage.who}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">What to understand</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{stage.understand}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">Preparation</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{stage.prepare}</p>
            </div>
            {stage.routeNote && (
              <div className="space-y-2 rounded-xl bg-peach-100 p-4 sm:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">Route differences</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{stage.routeNote}</p>
              </div>
            )}
            <div className="space-y-2 sm:col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">Official resource</h3>
              <a className="inline-flex items-center gap-1 text-sm font-medium text-forest-800 underline underline-offset-2" href={stage.resourceUrl} target="_blank" rel="noopener noreferrer">
                {stage.resourceLabel} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-beige-200 bg-ivory-100 px-5 py-4 sm:px-8">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setActiveStage((current) => Math.max(0, current - 1))}
              disabled={activeStage === 0}
            >
              Previous stage
            </button>
            {activeStage < JOURNEY_STAGES.length - 1 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveStage((current) => Math.min(JOURNEY_STAGES.length - 1, current + 1))}
              >
                <span>Next: {JOURNEY_STAGES[activeStage + 1].name.replace(/^\d+\.\s*/, '')}</span>
                <ArrowDown className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <p className="text-sm font-medium text-forest-800">End of the overview</p>
            )}
          </footer>
        </article>
      </section>
    </div>
  );
}
