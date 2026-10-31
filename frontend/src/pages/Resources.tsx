import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, ErrorBox, SourceCard, Spinner, useLoad } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { SourceItem } from '../types';

function SourceBrowser({ geo }: { geo: boolean }) {
  const { me } = useAuth();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (type) params.set('type', type);
  if (state) params.set('state', state);
  if (district) params.set('district', district);
  if (category) params.set('category', category);

  const { data, loading, error, reload } = useLoad(
    () => api<{ items: SourceItem[] }>(`/sources?${params.toString()}`, { auth: false }),
    [q, type, state, district, category],
  );

  async function save(id: string) {
    setMsg(null);
    setErrorMessage(null);
    try {
      await api('/bookmarks', { method: 'POST', body: { resourceId: id } });
      setMsg('Saved to your dashboard.');
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  }

  async function report(s: SourceItem) {
    setMsg(null);
    setErrorMessage(null);
    try {
      await api('/feedback', {
        method: 'POST',
        body: { category: 'content', message: `Please review this source for outdated information: ${s.title} — ${s.url}` },
      });
      setMsg(`Thank you. The review team was notified about “${s.title}”.`);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <form
        className="card grid gap-3 border border-beige-200 bg-white/90 sm:grid-cols-2 lg:grid-cols-4"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(search.trim());
        }}
      >
        <div className="lg:col-span-2">
          <label className="label" htmlFor="q">Search</label>
          <input id="q" className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. CARA, regulations" />
        </div>
        <div>
          <label className="label" htmlFor="type">Source type</label>
          <select id="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            <option value="official">Government / official</option>
            <option value="professional">Professional</option>
            <option value="educational">General educational</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="cat">Category</label>
          <input id="cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Portal" />
        </div>
        {geo && (
          <>
            <div>
              <label className="label" htmlFor="state">State</label>
              <input id="state" className="input" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="district">District</label>
              <input id="district" className="input" value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>
          </>
        )}
        <button
          type="button"
          className="btn-ghost justify-self-start sm:col-span-2 lg:col-span-4"
          onClick={() => {
            setSearch('');
            setQ('');
            setType('');
            setState('');
            setDistrict('');
            setCategory('');
          }}
        >
          Clear filters
        </button>
      </form>

      {msg && <p role="status" className="rounded-xl border border-beige-200 bg-sage-100 px-4 py-3 text-sm text-forest-800">{msg}</p>}
      {errorMessage && <ErrorBox message={errorMessage} />}
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && data.items.length === 0 && (
        <Empty>
          No matching entries. {geo && 'State and district listings are added only after an administrator verifies them against an official source, so some areas may be empty.'}
        </Empty>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {data?.items.map((s) => (
          <SourceCard
            key={s.id}
            s={s}
            action={
              me ? (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-ghost" onClick={() => save(s.id)}>
                    <Bookmark className="h-4 w-4" aria-hidden /> Save
                  </button>
                  <button className="btn-ghost" onClick={() => report(s)}>Report outdated information</button>
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
      {!me && (
        <p className="text-sm text-ink-soft">
          <Link className="underline" to="/login">Log in</Link> to save resources or report outdated information.
        </p>
      )}
    </div>
  );
}

export function ResourcesPage() {
  return (
    <div className="container-page space-y-5 py-6 sm:py-10">
      <header className="space-y-3 rounded-2xl border border-beige-200 bg-gradient-to-br from-peach-100 via-ivory-100 to-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">Research & reference</p>
        <h1 className="text-3xl sm:text-4xl">Resources and references</h1>
        <p className="max-w-3xl text-sm text-ink-soft">
          Every entry shows its source type and when it was last verified. Government sources are kept separate from NGO and educational material, and NGO content is never presented as law.
        </p>
      </header>
      <SourceBrowser geo={false} />
    </div>
  );
}

export function DirectoryPage() {
  return (
    <div className="container-page space-y-5 py-6 sm:py-10">
      <header className="space-y-3 rounded-2xl border border-beige-200 bg-gradient-to-br from-peach-100 via-ivory-100 to-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">Authorities and support</p>
        <h1 className="text-3xl sm:text-4xl">Support directory</h1>
        <p className="max-w-3xl text-sm text-ink-soft">
          Official authorities and support resources, with their verification status shown on each entry. Only independently verified organisations receive a verified designation. Sign in to report outdated information.
        </p>
      </header>
      <SourceBrowser geo />
    </div>
  );
}
