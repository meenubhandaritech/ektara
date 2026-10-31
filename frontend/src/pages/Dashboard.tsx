import { CheckCircle2, Circle, ExternalLink, MessageCircle, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclaimer, Empty, ErrorBox, Spinner, useLoad } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../services/api';
import { hasAnalyticsConsent, setAnalyticsConsent } from '../lib/firebase/analytics';
import type { ChecklistItem, Journey, MilestoneDef, MilestoneStatus, Note, Reminder, SourceItem } from '../types';
import { formatDisplayDate, localDateKey } from '../utils/date';

const TABS = ['overview', 'checklist', 'progress', 'reminders', 'saved', 'account'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  overview: 'Overview',
  checklist: 'Checklist',
  progress: 'Progress',
  reminders: 'Reminders',
  saved: 'Saved & notes',
  account: 'Account',
};

const ROUTE_LABEL: Record<string, string> = {
  'in-country-resident': 'In-country adoption of an unrelated child',
  nri: 'NRI applicant',
  oci: 'OCI cardholder',
  foreign: 'Foreign national',
  relative: 'Relative adoption',
  'step-parent': 'Step-parent adoption',
  hama: 'HAMA-related question',
  unsure: 'General information',
};

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <div className="container-page space-y-5 py-6 sm:py-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-700">Your preparation space</p>
        <Disclaimer />
      </header>
      <p className="rounded-xl border border-beige-200 bg-white/70 px-4 py-3 text-xs text-ink-soft">
        Your EKTARA dashboard tracks personal preparation. It does not display official CARINGS case status.
      </p>
      <div role="tablist" aria-label="Dashboard sections" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`${tab === t ? 'btn-primary' : 'btn-secondary'} shrink-0 !px-3 !py-2 text-sm`}
            onClick={() => setTab(t)}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      {tab === 'overview' && <Overview go={setTab} />}
      {tab === 'checklist' && <Checklist />}
      {tab === 'progress' && <Progress />}
      {tab === 'reminders' && <Reminders />}
      {tab === 'saved' && <Saved />}
      {tab === 'account' && <Account />}
    </div>
  );
}

// ---------------- Overview ----------------
function Overview({ go }: { go: (t: Tab) => void }) {
  const { me } = useAuth();
  const { t, lang } = useLang();
  const { data, loading, error, reload } = useLoad(async () => {
    const [j, c, r, b, s] = await Promise.all([
      api<{ journey: Journey; milestoneDefs: MilestoneDef[] }>('/journey'),
      api<{ items: ChecklistItem[]; completion: number }>('/checklist'),
      api<{ items: Reminder[] }>('/reminders'),
      api<{ items: { id: string }[] }>('/bookmarks'),
      api<{ items: SourceItem[] }>('/sources', { auth: false }),
    ]);
    return { j, c, r, b, s };
  });
  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Could not load your dashboard'} onRetry={reload} />;

  const { j, c, r, b, s } = data;
  const doneCount = j.milestoneDefs.filter((m) => j.journey.milestones[m.id] === 'done').length;
  const currentMs = j.milestoneDefs.find((m) => j.journey.milestones[m.id] === 'current') ?? j.milestoneDefs.find((m) => j.journey.milestones[m.id] !== 'done');
  const pending = c.items.filter((i) => !i.completed);
  const today = localDateKey();
  const upcoming = r.items.filter((x) => !x.completed).slice(0, 3);
  const saved = s.items.filter((x) => b.items.some((bb) => bb.id === x.id));

  let next = 'Understand which official information may apply to you with the Route Navigator.';
  let nextLink = '/navigator';
  if (j.journey.route) {
    if (pending.length) {
      next = `Review your checklist: ${pending.length} item${pending.length === 1 ? '' : 's'} still to check against official instructions.`;
      nextLink = '';
    } else if (currentMs) {
      next = `Continue with: ${currentMs.title}.`;
      nextLink = '';
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="card md:col-span-2 border border-beige-200 bg-gradient-to-br from-peach-100 via-ivory-100 to-white">
        <h1 className="text-3xl">
          {t('dash.welcome')}
          {me?.profile?.displayName ? `, ${me.profile.displayName}` : ''}
        </h1>
        <p className="mt-2 text-ink-soft">
          <strong>{t('dash.next')}:</strong> {next}{' '}
          {nextLink ? <Link className="underline" to={nextLink}>Open</Link> : null}
        </p>
      </section>

      <section className="card space-y-3 border border-beige-200">
        <h2 className="text-xl">Your saved route</h2>
        {j.journey.route ? (
          <>
            <p className="font-medium">{ROUTE_LABEL[j.journey.route] ?? j.journey.route}</p>
            <p className="text-xs text-ink-soft">Preliminary informational guidance only.</p>
            <Link to="/navigator" className="btn-secondary">Update route</Link>
          </>
        ) : (
          <>
            <Empty>No route saved yet.</Empty>
            <Link to="/navigator" className="btn-primary">Open Route Navigator</Link>
          </>
        )}
      </section>

      <section className="card space-y-3 border border-beige-200">
        <h2 className="text-xl">Journey overview</h2>
        <p className="text-sm text-ink-soft">{doneCount} of {j.milestoneDefs.length} milestones marked done by you.</p>
        {currentMs && <p className="text-sm">Current focus: <strong>{currentMs.title}</strong></p>}
        <button className="btn-secondary" onClick={() => go('progress')}>Update progress</button>
      </section>

      <section className="card space-y-3 border border-beige-200">
        <h2 className="text-xl">Preparation progress</h2>
        <div className="h-2.5 rounded-full bg-sage-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.completion}>
          <div className="h-2.5 rounded-full bg-forest-600" style={{ width: `${c.completion}%` }} />
        </div>
        <p className="text-sm text-ink-soft">{c.completion}% of checklist items marked complete · {pending.length} pending</p>
        <button className="btn-secondary" onClick={() => go('checklist')}>Open checklist</button>
      </section>

      <section className="card space-y-3 border border-beige-200">
        <h2 className="text-xl">Upcoming reminders</h2>
        {upcoming.length === 0 ? (
          <Empty>No upcoming reminders.</Empty>
        ) : (
          <ul className="space-y-1 text-sm">
            {upcoming.map((x) => (
              <li key={x.id} className={x.dueDate < today ? 'text-red-800' : ''}>
                {formatDisplayDate(x.dueDate, lang)} — {x.title} {x.dueDate < today && '(overdue)'}
              </li>
            ))}
          </ul>
        )}
        <button className="btn-secondary" onClick={() => go('reminders')}>Manage reminders</button>
        <p className="text-xs text-ink-soft">Reminders appear in the app only. EKTARA does not send emails or SMS.</p>
      </section>

      <section className="card space-y-3 border border-beige-200">
        <h2 className="text-xl">Saved resources</h2>
        {saved.length === 0 ? (
          <Empty>Nothing saved. Bookmark resources from the Resources page.</Empty>
        ) : (
          <ul className="space-y-1 text-sm">
            {saved.map((x) => (
              <li key={x.id}>
                <a className="inline-flex items-center gap-1 underline" href={x.url} target="_blank" rel="noopener noreferrer">
                  {x.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3 border border-beige-200">
        <h2 className="text-xl">Ask the assistant</h2>
        <p className="text-sm text-ink-soft">Get source-backed explanations in simple language.</p>
        <Link to="/assistant" className="btn-primary">
          <MessageCircle className="h-4 w-4" aria-hidden /> {t('assistant.title')}
        </Link>
      </section>
    </div>
  );
}

// ---------------- Checklist ----------------
function Checklist() {
  const { data, setData, loading, error, reload } = useLoad(async () => {
    const [c, s] = await Promise.all([
      api<{ items: ChecklistItem[]; completion: number }>('/checklist'),
      api<{ items: SourceItem[] }>('/sources', { auth: false }),
    ]);
    return { items: c.items, sources: s.items };
  });
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Could not load checklist'} onRetry={reload} />;
  if (data.items.length === 0)
    return (
      <Empty>
        Your checklist is created from your saved route. <Link className="underline" to="/navigator">Use the Route Navigator</Link> and choose “Save to my dashboard”.
      </Empty>
    );

  async function patch(id: string, body: { completed?: boolean; notes?: string }) {
    setErr(null);
    try {
      const { item } = await api<{ item: ChecklistItem }>(`/checklist/${id}`, { method: 'PUT', body });
      setData((d) => (d ? { ...d, items: d.items.map((i) => (i.id === id ? item : i)) } : d));
    } catch (e: any) {
      setErr(e.message);
    }
  }

  const done = data.items.filter((i) => i.completed).length;
  const pct = Math.round((done / data.items.length) * 100);
  const cats = [...new Set(data.items.map((i) => i.category))];

  return (
    <div className="space-y-5">
      <div className="card space-y-2">
        <p className="font-medium">{pct}% complete ({done} of {data.items.length})</p>
        <div className="h-3 rounded-full bg-sage-100"><div className="h-3 rounded-full bg-forest-600" style={{ width: `${pct}%` }} /></div>
        <p className="text-sm text-ink-soft">
          This is a preparation aid, not a government form, and you do not upload documents here. Requirements can change, so confirm each item against current official instructions.
        </p>
      </div>
      {err && <ErrorBox message={err} />}
      {cats.map((cat) => (
        <section key={cat} className="space-y-2">
          <h2 className="text-xl">{cat}</h2>
          {data.items
            .filter((i) => i.category === cat)
            .map((i) => {
              const src = data.sources.find((s) => s.id === i.sourceId);
              const isOpen = open === i.id;
              return (
                <div key={i.id} className="card !p-4">
                  <div className="flex items-start gap-3">
                    <button
                      aria-label={i.completed ? `Mark "${i.title}" pending` : `Mark "${i.title}" complete`}
                      aria-pressed={i.completed}
                      onClick={() => patch(i.id, { completed: !i.completed })}
                      className="mt-0.5 text-forest-700"
                    >
                      {i.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </button>
                    <div className="flex-1">
                      <button className={`text-left font-medium ${i.completed ? 'line-through text-ink-soft' : ''}`} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i.id)}>
                        {i.title}
                      </button>
                      {isOpen && (
                        <div className="mt-2 space-y-2 text-sm text-ink-soft">
                          <p>{i.description}</p>
                          {src && (
                            <a className="inline-flex items-center gap-1 underline" href={src.url} target="_blank" rel="noopener noreferrer">
                              Official source: {src.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            </a>
                          )}
                          <label className="label" htmlFor={`n-${i.id}`}>Your notes</label>
                          <textarea
                            id={`n-${i.id}`}
                            className="input"
                            rows={2}
                            maxLength={1000}
                            value={draft[i.id] ?? i.notes}
                            onChange={(e) => setDraft({ ...draft, [i.id]: e.target.value })}
                          />
                          <button className="btn-secondary" onClick={() => patch(i.id, { notes: draft[i.id] ?? i.notes })}>
                            Save note
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      ))}
    </div>
  );
}

// ---------------- Progress ----------------
function Progress() {
  const { data, setData, loading, error, reload } = useLoad(() => api<{ journey: Journey; milestoneDefs: MilestoneDef[] }>('/journey'));
  const [err, setErr] = useState<string | null>(null);
  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Could not load progress'} onRetry={reload} />;

  async function set(id: string, status: MilestoneStatus) {
    setErr(null);
    try {
      const r = await api<{ journey: Journey }>('/journey/progress', { method: 'PUT', body: { milestoneId: id, status } });
      setData((d) => (d ? { ...d, journey: r.journey } : d));
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">You update these yourself. They show your own preparation, <strong>not</strong> any official application status.</p>
      {err && <ErrorBox message={err} />}
      <ol className="space-y-2">
        {data.milestoneDefs.map((m, idx) => {
          const st = data.journey.milestones[m.id] ?? 'not_started';
          return (
            <li key={m.id} className="card !p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${st === 'done' ? 'bg-forest-700 text-white' : st === 'current' ? 'bg-peach-200 text-ink' : 'bg-sage-100 text-ink-soft'}`}>
                  {st === 'done' ? '✓' : idx + 1}
                </span>
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-xs text-ink-soft">{st === 'done' ? 'Completed' : st === 'current' ? 'Current' : 'Upcoming'}</p>
                </div>
              </div>
              <div>
                <label className="sr-only" htmlFor={`m-${m.id}`}>Status for {m.title}</label>
                <select id={`m-${m.id}`} className="input !w-auto" value={st} onChange={(e) => set(m.id, e.target.value as MilestoneStatus)}>
                  <option value="not_started">Upcoming</option>
                  <option value="current">Current</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------- Reminders ----------------
function Reminders() {
  const { lang } = useLang();
  const { data, setData, loading, error, reload } = useLoad(() => api<{ items: Reminder[] }>('/reminders'));
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorBox message={error ?? 'Could not load reminders'} onRetry={reload} />;

  function startEdit(r: Reminder | null) {
    setEditing(r);
    setTitle(r?.title ?? '');
    setDescription(r?.description ?? '');
    setDueDate(r?.dueDate ?? '');
    setErr(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!title.trim()) return setErr('Please add a title.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return setErr('Please choose a date.');
    setBusy(true);
    try {
      const body = { title: title.trim(), description: description.trim(), dueDate };
      if (editing) {
        const { item } = await api<{ item: Reminder }>(`/reminders/${editing.id}`, { method: 'PUT', body });
        setData({ items: data!.items.map((x) => (x.id === item.id ? item : x)) });
      } else {
        const { item } = await api<{ item: Reminder }>('/reminders', { method: 'POST', body });
        setData({ items: [...data!.items, item] });
      }
      startEdit(null);
    } catch (e2: any) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(r: Reminder) {
    try {
      const { item } = await api<{ item: Reminder }>(`/reminders/${r.id}`, { method: 'PUT', body: { completed: !r.completed } });
      setData({ items: data!.items.map((x) => (x.id === r.id ? item : x)) });
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function remove(r: Reminder) {
    if (!window.confirm(`Delete reminder "${r.title}"?`)) return;
    try {
      await api(`/reminders/${r.id}`, { method: 'DELETE' });
      setData({ items: data!.items.filter((x) => x.id !== r.id) });
    } catch (e: any) {
      setErr(e.message);
    }
  }

  const sorted = [...data.items].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = sorted.filter((r) => !r.completed);
  const completed = sorted.filter((r) => r.completed);
  const today = localDateKey();

  const row = (r: Reminder) => (
    <li key={r.id} className="card !p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className={`font-medium ${r.completed ? 'line-through text-ink-soft' : ''}`}>{r.title}</p>
        <p className={`text-xs ${!r.completed && r.dueDate < today ? 'text-red-800' : 'text-ink-soft'}`}>
          Due {formatDisplayDate(r.dueDate, lang)}
          {!r.completed && r.dueDate < today ? ' (overdue)' : ''}
        </p>
        {r.description && <p className="text-sm text-ink-soft">{r.description}</p>}
      </div>
      <div className="flex gap-2">
        <button className="btn-secondary" onClick={() => toggle(r)}>{r.completed ? 'Reopen' : 'Mark complete'}</button>
        <button className="btn-ghost" onClick={() => startEdit(r)}>Edit</button>
        <button className="btn-ghost" aria-label={`Delete ${r.title}`} onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></button>
      </div>
    </li>
  );

  return (
    <div className="space-y-6">
      <form className="card grid gap-3 sm:grid-cols-2" onSubmit={submit} noValidate>
        <h2 className="text-xl sm:col-span-2">{editing ? 'Edit reminder' : 'Add a reminder'}</h2>
        <div>
          <label className="label" htmlFor="rt">Title</label>
          <input id="rt" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="rd">Date</label>
          <input id="rd" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="rn">Description (optional)</label>
          <input id="rn" className="input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
        </div>
        {err && <p role="alert" className="text-sm text-red-800 sm:col-span-2">{err}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary" disabled={busy}>{editing ? 'Save changes' : 'Add reminder'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => startEdit(null)}>Cancel</button>}
        </div>
        <p className="text-xs text-ink-soft sm:col-span-2">Reminders appear in the app only. EKTARA does not send emails or SMS.</p>
      </form>

      <section className="space-y-2">
        <h2 className="text-xl">Upcoming</h2>
        {upcoming.length ? <ul className="space-y-2">{upcoming.map(row)}</ul> : <Empty>No upcoming reminders.</Empty>}
      </section>
      <section className="space-y-2">
        <h2 className="text-xl">Completed</h2>
        {completed.length ? <ul className="space-y-2">{completed.map(row)}</ul> : <Empty>Nothing completed yet.</Empty>}
      </section>
    </div>
  );
}

// ---------------- Saved resources & notes ----------------
function Saved() {
  const { lang } = useLang();
  const res = useLoad(async () => {
    const [b, s] = await Promise.all([api<{ items: { id: string }[] }>('/bookmarks'), api<{ items: SourceItem[] }>('/sources', { auth: false })]);
    return s.items.filter((x) => b.items.some((bb) => bb.id === x.id));
  });
  const notes = useLoad(() => api<{ items: Note[] }>('/notes'));
  const [text, setText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function unsave(id: string) {
    if (!window.confirm('Remove this saved resource from your dashboard?')) return;
    try {
      await api(`/bookmarks/${id}`, { method: 'DELETE' });
      res.setData((d) => (d ? d.filter((x) => x.id !== id) : d));
    } catch (e: any) {
      setErr(e.message);
    }
  }
  async function addNote(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!text.trim()) return setErr('Please write a note first.');
    try {
      if (editingNoteId) {
        const { item } = await api<{ item: Note }>(`/notes/${editingNoteId}`, { method: 'PUT', body: { text: text.trim() } });
        notes.setData((d) => d ? { items: d.items.map((note) => note.id === item.id ? item : note) } : d);
      } else {
        const { item } = await api<{ item: Note }>('/notes', { method: 'POST', body: { text: text.trim() } });
        notes.setData((d) => ({ items: [item, ...(d?.items ?? [])] }));
      }
      setText('');
      setEditingNoteId(null);
    } catch (e2: any) {
      setErr(e2.message);
    }
  }
  function editNote(note: Note) {
    setText(note.text);
    setEditingNoteId(note.id);
  }
  async function delNote(id: string) {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      notes.setData((d) => (d ? { items: d.items.filter((n) => n.id !== id) } : d));
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {err && <div className="md:col-span-2"><ErrorBox message={err} /></div>}
      <section className="space-y-3">
        <h2 className="text-xl">Saved resources</h2>
        {res.loading && <Spinner />}
        {res.error && <ErrorBox message={res.error} onRetry={res.reload} />}
        {res.data && res.data.length === 0 && <Empty>No saved resources. <Link className="underline" to="/resources">Browse resources</Link>.</Empty>}
        <ul className="space-y-2">
          {res.data?.map((s) => (
            <li key={s.id} className="card !p-4 flex items-center justify-between gap-3">
              <a className="inline-flex items-center gap-1 underline" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <button className="btn-ghost" onClick={() => unsave(s.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl">My notes</h2>
        <p className="text-xs text-ink-soft">Only you can read these. Please avoid entering sensitive identity numbers.</p>
        <form onSubmit={addNote} className="space-y-2">
          <label className="label" htmlFor="note">{editingNoteId ? 'Edit note' : 'New note'}</label>
          <textarea id="note" className="input" rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex gap-2">
            <button className="btn-primary">{editingNoteId ? 'Save note' : 'Add note'}</button>
            {editingNoteId && <button type="button" className="btn-ghost" onClick={() => { setEditingNoteId(null); setText(''); }}>Cancel</button>}
          </div>
        </form>
        {notes.loading && <Spinner />}
        {notes.error && <ErrorBox message={notes.error} onRetry={notes.reload} />}
        {notes.data && notes.data.items.length === 0 && <Empty>No notes yet.</Empty>}
        <ul className="space-y-2">
          {notes.data?.items.map((n) => (
            <li key={n.id} className="card !p-4 flex items-start justify-between gap-3">
              <div>
                <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                <p className="text-xs text-ink-soft">{formatDisplayDate(n.createdAt, lang)}</p>
              </div>
              <button className="btn-ghost" aria-label="Edit note" onClick={() => editNote(n)}>Edit</button>
              <button className="btn-ghost" aria-label="Delete note" onClick={() => delNote(n.id)}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ---------------- Account ----------------
function Account() {
  const { me, refreshMe, logout } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState(me?.profile?.displayName ?? '');
  const [state, setState] = useState(me?.profile?.state ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fb, setFb] = useState('');
  const [analyticsConsent, setAnalyticsConsentState] = useState(hasAnalyticsConsent);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!name.trim()) return setErr('Name cannot be empty.');
    try {
      await api('/me', { method: 'PUT', body: { displayName: name.trim(), state } });
      await refreshMe();
      setMsg('Profile updated.');
    } catch (e2: any) {
      setErr(e2.message);
    }
  }

  async function sendFeedback(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (fb.trim().length < 3) return setErr('Please write a little more.');
    try {
      await api('/feedback', { method: 'POST', body: { message: fb.trim(), category: 'other' } });
      setFb('');
      setMsg('Thank you. Your feedback was recorded.');
    } catch (e2: any) {
      setErr(e2.message);
    }
  }

  async function updateAnalyticsConsent(consented: boolean) {
    setErr(null);
    try {
      const updated = await setAnalyticsConsent(consented);
      if (!updated) {
        setErr('Firebase Analytics is not supported in this browser or is not configured.');
        return;
      }
      setAnalyticsConsentState(consented);
      setMsg(consented ? 'Optional, non-personal analytics enabled.' : 'Optional analytics disabled.');
    } catch {
      setErr('Analytics preferences could not be saved. The rest of EKTARA is unaffected.');
    }
  }

  async function del() {
    if (!window.confirm('Delete your account and all your saved checklist, reminders, bookmarks and notes? This cannot be undone.')) return;
    try {
      await api('/me', { method: 'DELETE' });
      await logout();
      nav('/');
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="grid max-w-3xl gap-6">
      {err && <ErrorBox message={err} />}
      {msg && <p role="status" className="text-sm text-forest-800">{msg}</p>}
      <form className="card space-y-3" onSubmit={saveProfile}>
        <h2 className="text-xl">Your details</h2>
        <p className="text-sm text-ink-soft">Email: {me?.email}</p>
        <div>
          <label className="label" htmlFor="an">Name</label>
          <input id="an" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="as">State (optional)</label>
          <input id="as" className="input" value={state} onChange={(e) => setState(e.target.value)} maxLength={60} />
        </div>
        <button className="btn-primary">Save</button>
      </form>
      <form className="card space-y-3" onSubmit={sendFeedback}>
        <h2 className="text-xl">Send feedback</h2>
        <label className="label" htmlFor="fb">Tell us what to improve or correct</label>
        <textarea id="fb" className="input" rows={3} maxLength={2000} value={fb} onChange={(e) => setFb(e.target.value)} />
        <button className="btn-secondary">Send</button>
      </form>
      <section className="card space-y-3">
        <h2 className="text-xl">Privacy preferences</h2>
        <p className="text-sm text-ink-soft">
          Optional Firebase Analytics records only a generic app-open event after you opt in. It does not send your
          name, email, route answers, questions, messages, or dashboard content.
        </p>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 accent-forest-800"
            checked={analyticsConsent}
            onChange={(event) => void updateAnalyticsConsent(event.target.checked)}
          />
          <span>Allow optional, non-personal analytics on this browser</span>
        </label>
      </section>
      <section className="card space-y-3">
        <h2 className="text-xl">Delete account</h2>
        <p className="text-sm text-ink-soft">Removes your account and all private records.</p>
        <button className="btn-danger" onClick={del}>Delete my account</button>
      </section>
    </div>
  );
}
