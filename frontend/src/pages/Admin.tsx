import { useState, type FormEvent } from 'react';
import { Empty, ErrorBox, Spinner, useLoad } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Article, SourceItem } from '../types';
import { formatDisplayDate, localDateKey } from '../utils/date';

interface Dash {
  accounts: number;
  articles: { total: number; published: number; draft: number };
  sources: { total: number; needingReview: number };
  feedbackCount: number;
}

const TABS = ['dashboard', 'articles', 'sources', 'feedback', 'roles'] as const;
type Tab = (typeof TABS)[number];
const today = localDateKey;

export default function Admin() {
  const { me } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  return (
    <div className="container-page space-y-5 py-6 sm:py-8">
      <header className="space-y-3 rounded-2xl border border-beige-200 bg-gradient-to-br from-peach-100 via-ivory-100 to-white p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">Editorial workspace</p>
        <h1 className="text-3xl">Content administration</h1>
        <p className="max-w-3xl text-sm text-ink-soft">
          You are signed in as <strong>{me?.role}</strong>. This panel manages public information only. It has no access to users’ notes, checklists, reminders or any adoption case.
        </p>
      </header>
      <div role="tablist" aria-label="Administration sections" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.filter((t) => t !== 'roles' || me?.role === 'admin').map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`${tab === t ? 'btn-primary' : 'btn-secondary'} shrink-0 !px-3 !py-2 text-sm`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'articles' && <ArticlesTab />}
      {tab === 'sources' && <SourcesTab />}
      {tab === 'feedback' && <FeedbackTab />}
      {tab === 'roles' && me?.role === 'admin' && <RolesTab />}
    </div>
  );
}

function DashboardTab() {
  const { data, loading, error, reload } = useLoad(() => api<Dash>('/admin/dashboard'));
  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Failed to load'} onRetry={reload} />;
  const stats: [string, number][] = [
    ['Accounts', data.accounts],
    ['Published articles', data.articles.published],
    ['Draft articles', data.articles.draft],
    ['Sources', data.sources.total],
    ['Sources needing review', data.sources.needingReview],
    ['Feedback messages', data.feedbackCount],
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map(([k, v]) => (
        <div key={k} className="card !p-4 border border-beige-200">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{k}</p>
          <p className="mt-1 font-serif text-3xl leading-none text-forest-900">{v}</p>
        </div>
      ))}
    </div>
  );
}

// ---------- Articles ----------
function ArticlesTab() {
  const { data, setData, loading, error, reload } = useLoad(async () => {
    const [a, s] = await Promise.all([api<{ items: Article[] }>('/admin/articles'), api<{ items: SourceItem[] }>('/admin/sources')]);
    return { articles: a.items, sources: s.items };
  });
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Failed to load'} onRetry={reload} />;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setErr(null);
    const body = {
      title: editing.title ?? '',
      content: editing.content ?? '',
      keywords: (editing.keywords ?? []).filter(Boolean),
      sourceId: editing.sourceId ?? '',
      documentName: editing.documentName ?? '',
      section: editing.section ?? '',
      effectiveDate: editing.effectiveDate ?? '',
      lastReviewed: editing.lastReviewed ?? today(),
      reviewer: editing.reviewer ?? '',
      status: editing.status ?? 'draft',
      language: editing.language ?? 'en',
    };
    try {
      const r = editing.id
        ? await api<{ item: Article }>(`/admin/articles/${editing.id}`, { method: 'PUT', body })
        : await api<{ item: Article }>('/admin/articles', { method: 'POST', body });
      setData((d) =>
        d ? { ...d, articles: editing.id ? d.articles.map((a) => (a.id === r.item.id ? r.item : a)) : [...d.articles, r.item] } : d,
      );
      setEditing(null);
    } catch (e2: any) {
      setErr(e2.message);
    }
  }

  const set = (k: keyof Article, v: unknown) => setEditing((x) => ({ ...x, [k]: v }));

  return (
    <div className="space-y-3">
      {!editing && (
        <button className="btn-primary" onClick={() => setEditing({ status: 'draft', language: 'en', lastReviewed: today(), keywords: [], sourceId: data.sources[0]?.id })}>
          New article
        </button>
      )}
      {editing && (
        <form className="card grid gap-3 border border-beige-200 sm:grid-cols-2" onSubmit={save}>
          <h2 className="text-xl sm:col-span-2">{editing.id ? 'Edit article (a new version is recorded)' : 'New article'}</h2>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="at">Title</label>
            <input id="at" className="input" value={editing.title ?? ''} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ac">Content (plain language; do not invent legal provisions)</label>
            <textarea id="ac" className="input" rows={6} value={editing.content ?? ''} onChange={(e) => set('content', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ak">Keywords (comma separated)</label>
            <input id="ak" className="input" value={(editing.keywords ?? []).join(', ')} onChange={(e) => set('keywords', e.target.value.split(',').map((s) => s.trim()))} />
          </div>
          <div>
            <label className="label" htmlFor="as">Official source</label>
            <select id="as" className="input" value={editing.sourceId ?? ''} onChange={(e) => set('sourceId', e.target.value)}>
              {data.sources.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ad">Document name</label>
            <input id="ad" className="input" value={editing.documentName ?? ''} onChange={(e) => set('documentName', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="asec">Section / page (leave blank if unknown)</label>
            <input id="asec" className="input" value={editing.section ?? ''} onChange={(e) => set('section', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ae">Effective date (if known)</label>
            <input id="ae" className="input" value={editing.effectiveDate ?? ''} onChange={(e) => set('effectiveDate', e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div>
            <label className="label" htmlFor="al">Last reviewed</label>
            <input id="al" type="date" className="input" value={editing.lastReviewed ?? ''} onChange={(e) => set('lastReviewed', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ar">Reviewer</label>
            <input id="ar" className="input" value={editing.reviewer ?? ''} onChange={(e) => set('reviewer', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="ast">Status</label>
            <select id="ast" className="input" value={editing.status ?? 'draft'} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          {err && <p role="alert" className="text-sm text-red-800 sm:col-span-2">{err}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary">Save</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}
      {data.articles.length === 0 && <Empty>No articles yet.</Empty>}
      <ul className="space-y-2">
        {data.articles.map((a) => (
          <li key={a.id} className="card !p-3 flex flex-wrap items-center justify-between gap-3 border border-beige-200 sm:!p-4">
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-xs text-ink-soft">
                {a.status} · v{a.version ?? 1} · reviewed {a.lastReviewed} by {a.reviewer}
              </p>
            </div>
            <button className="btn-secondary" onClick={() => setEditing(a)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Sources ----------
function SourcesTab() {
  const { data, setData, loading, error, reload } = useLoad(() => api<{ items: SourceItem[] }>('/admin/sources'));
  const [editing, setEditing] = useState<Partial<SourceItem> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Failed to load'} onRetry={reload} />;

  const set = (k: keyof SourceItem, v: unknown) => setEditing((x) => ({ ...x, [k]: v }));

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setErr(null);
    const body = {
      title: editing.title ?? '',
      organisation: editing.organisation ?? '',
      sourceType: editing.sourceType ?? 'official',
      category: editing.category ?? 'General',
      url: editing.url ?? '',
      summary: editing.summary ?? '',
      state: editing.state || undefined,
      district: editing.district || undefined,
      lastVerified: editing.lastVerified ?? today(),
      nextReview: editing.nextReview ?? today(),
      verificationStatus: editing.verificationStatus ?? 'needs-review',
    };
    try {
      const r = editing.id
        ? await api<{ item: SourceItem }>(`/admin/sources/${editing.id}`, { method: 'PUT', body })
        : await api<{ item: SourceItem }>('/admin/sources', { method: 'POST', body });
      setData((d) => ({ items: editing.id ? d!.items.map((s) => (s.id === r.item.id ? r.item : s)) : [...(d?.items ?? []), r.item] }));
      setEditing(null);
    } catch (e2: any) {
      setErr(e2.message);
    }
  }

  return (
    <div className="space-y-3">
      {!editing && (
        <button className="btn-primary" onClick={() => setEditing({ sourceType: 'official', verificationStatus: 'needs-review', lastVerified: today(), nextReview: today() })}>
          New source
        </button>
      )}
      {editing && (
        <form className="card grid gap-3 border border-beige-200 sm:grid-cols-2" onSubmit={save}>
          <h2 className="text-xl sm:col-span-2">{editing.id ? 'Edit source' : 'New source'}</h2>
          <p className="text-xs text-ink-soft sm:col-span-2">Only add an entry after checking it against the live official source. Never invent addresses, phone numbers or accreditation.</p>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="st">Title</label>
            <input id="st" className="input" value={editing.title ?? ''} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="so">Organisation</label>
            <input id="so" className="input" value={editing.organisation ?? ''} onChange={(e) => set('organisation', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="sty">Source type</label>
            <select id="sty" className="input" value={editing.sourceType ?? 'official'} onChange={(e) => set('sourceType', e.target.value)}>
              <option value="official">Government / official</option>
              <option value="professional">Verified professional</option>
              <option value="educational">General educational</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="su">Official URL (https)</label>
            <input id="su" type="url" className="input" value={editing.url ?? ''} onChange={(e) => set('url', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="ss">Short explanation</label>
            <textarea id="ss" className="input" rows={2} value={editing.summary ?? ''} onChange={(e) => set('summary', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="sc">Category</label>
            <input id="sc" className="input" value={editing.category ?? ''} onChange={(e) => set('category', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="sv">Verification status</label>
            <select id="sv" className="input" value={editing.verificationStatus ?? 'needs-review'} onChange={(e) => set('verificationStatus', e.target.value)}>
              <option value="verified">Verified</option>
              <option value="needs-review">Needs review</option>
              <option value="seeded-needs-admin-verification">Seeded, needs admin verification</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sst">State (optional)</label>
            <input id="sst" className="input" value={editing.state ?? ''} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="sd">District (optional)</label>
            <input id="sd" className="input" value={editing.district ?? ''} onChange={(e) => set('district', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="slv">Last verified</label>
            <input id="slv" type="date" className="input" value={editing.lastVerified ?? ''} onChange={(e) => set('lastVerified', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="snr">Next review</label>
            <input id="snr" type="date" className="input" value={editing.nextReview ?? ''} onChange={(e) => set('nextReview', e.target.value)} />
          </div>
          {err && <p role="alert" className="text-sm text-red-800 sm:col-span-2">{err}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary">Save</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}
      <ul className="space-y-2">
        {data.items.map((s) => (
          <li key={s.id} className="card !p-3 flex flex-wrap items-center justify-between gap-3 border border-beige-200 sm:!p-4">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-ink-soft">
                {s.sourceType} · {s.verificationStatus} · {s.verificationStatus === 'verified' ? 'last verified' : 'date recorded'} {formatDisplayDate(s.lastVerified)} · next review {formatDisplayDate(s.nextReview)}
              </p>
              {(s.verificationStatus !== 'verified' || s.nextReview <= localDateKey()) && (
                <p className="mt-1 text-xs font-semibold text-forest-800">
                  {s.verificationStatus === 'verified' ? 'Due for review' : 'Pending verification'}
                </p>
              )}
            </div>
            <button className="btn-secondary" onClick={() => setEditing(s)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeedbackTab() {
  const { data, loading, error, reload } = useLoad(() => api<{ items: { id: string; message: string; category: string; createdAt: string }[] }>('/admin/feedback'));
  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Failed to load'} onRetry={reload} />;
  if (!data.items.length) return <Empty>No feedback yet.</Empty>;
  return (
    <ul className="space-y-2">
      {data.items.map((f) => (
        <li key={f.id} className="card !p-3 border border-beige-200 sm:!p-4">
          <p className="text-sm">{f.message}</p>
          <p className="text-xs text-ink-soft">{f.category} · {f.createdAt.slice(0, 10)}</p>
        </li>
      ))}
    </ul>
  );
}

function RolesTab() {
  const [uid, setUid] = useState('');
  const [role, setRole] = useState<'user' | 'editor' | 'admin'>('editor');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!uid.trim()) return setErr('Enter the account UID.');
    try {
      await api(`/admin/users/${encodeURIComponent(uid.trim())}/role`, { method: 'PUT', body: { role } });
      setMsg('Role updated. The person must sign in again for it to take effect.');
    } catch (e2: any) {
      setErr(e2.message);
    }
  }
  return (
    <form className="card max-w-md space-y-3 border border-beige-200" onSubmit={submit}>
      <h2 className="text-xl">Manage platform roles</h2>
      <p className="text-xs text-ink-soft">Only admins can change roles. Not available in demo mode.</p>
      <div>
        <label className="label" htmlFor="ru">Account UID</label>
        <input id="ru" className="input" value={uid} onChange={(e) => setUid(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="rr">Role</label>
        <select id="rr" className="input" value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {err && <p role="alert" className="text-sm text-red-800">{err}</p>}
      {msg && <p role="status" className="text-sm text-forest-800">{msg}</p>}
      <button className="btn-primary">Set role</button>
    </form>
  );
}
