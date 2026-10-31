import { AlertTriangle, ChevronDown, ExternalLink, Info, Loader2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useLang } from '../context/LangContext';
import type { SourceItem } from '../types';
import { formatDisplayDate, localDateKey } from '../utils/date';

export function Spinner({ label }: { label?: string }) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-2 py-8 text-ink-soft" role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLang();
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-beige-200 bg-ivory-100 p-6 text-center text-sm text-ink-soft">{children}</div>;
}

export function Disclaimer({ kind = 'independent' }: { kind?: 'independent' | 'prelim' }) {
  const { t } = useLang();
  return (
    <p className="flex items-start gap-2 rounded-xl bg-peach-100 p-3 text-sm text-ink">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-peach-500" aria-hidden />
      <span>{t(kind === 'prelim' ? 'disclaimer.prelim' : 'disclaimer.independent')}</span>
    </p>
  );
}

export function Accordion({ title, children, defaultOpen = false }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-beige-200 bg-white">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium text-forest-900"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && <div className="border-t border-beige-200 px-4 py-3 text-sm leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
}

const TYPE_LABEL: Record<string, string> = {
  official: 'Government / official source',
  professional: 'Professional resource',
  educational: 'General educational resource',
};
export const typeLabel = (sourceType: string, verificationStatus: string) => {
  const label = TYPE_LABEL[sourceType] ?? sourceType;
  return sourceType === 'professional' && verificationStatus === 'verified'
    ? `Verified ${label.toLowerCase()}`
    : label;
};

export function SourceCard({ s, action }: { s: SourceItem; action?: ReactNode }) {
  const { t, lang } = useLang();
  const currentVerified = s.verificationStatus === 'verified' && s.nextReview > localDateKey();
  return (
    <article className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={s.sourceType === 'official' ? 'chip' : 'chip !bg-beige-100 !text-ink'}>{typeLabel(s.sourceType, currentVerified ? 'verified' : 'needs-review')}</span>
        {!currentVerified && (
          <span className="chip !bg-peach-100 !text-ink">
            {s.verificationStatus === 'verified' ? 'Due for review' : 'Pending verification'}
          </span>
        )}
      </div>
      <h3 className="text-lg">{s.title}</h3>
      <p className="text-sm text-ink-soft">{s.organisation}</p>
      <p className="text-sm">{s.summary}</p>
      <p className="text-xs text-ink-soft">
        {currentVerified
          ? `Last verified: ${formatDisplayDate(s.lastVerified, lang)} · next review: ${formatDisplayDate(s.nextReview, lang)}`
          : `Verification pending · date recorded: ${formatDisplayDate(s.lastVerified, lang)}`}
        {s.state ? ` · ${s.state}` : ''}
        {s.district ? ` · ${s.district}` : ''}
      </p>
      <div className="mt-1 flex flex-wrap gap-2">
        <a className="btn-secondary" href={s.url} target="_blank" rel="noopener noreferrer">
          {s.sourceType === 'official' ? t('common.official') : 'Open resource'} <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        {action}
      </div>
    </article>
  );
}

/** Small data loader hook with loading / error / reload. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fn()
      .then((d) => alive && setData(d))
      .catch((e: any) => alive && setError(e?.message ?? 'Something went wrong'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, setData, error, loading, reload: () => setTick((n) => n + 1) };
}
