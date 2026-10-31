import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { isDemo } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';
import { checklistFor, guide, MILESTONES } from '../services/navigator.js';
import { adminAuth, store } from '../services/store.js';
import { notFound } from '../utils/errors.js';
import {
  bookmarkSchema,
  checklistUpdateSchema,
  navigatorSchema,
  noteSchema,
  noteUpdateSchema,
  profileSchema,
  progressSchema,
  reminderSchema,
  reminderUpdateSchema,
} from '../validators/index.js';

export const userRouter = Router();
userRouter.use(requireAuth);

const PRIVATE_ROOTS = ['users', 'journeys', 'checklists', 'reminders', 'bookmarks', 'userNotes'];

async function ensureUserProfile(uid: string, email?: string, displayName?: string, photoURL?: string) {
  const now = new Date().toISOString();
  const path = `users/${uid}`;
  const defaults = {
    ...(displayName ? { displayName } : {}),
    ...(email ? { email } : {}),
    ...(photoURL ? { photoURL } : {}),
  };
  const created = await store.createIfMissing(path, {
    ...defaults,
    createdAt: now,
    updatedAt: now,
  });
  if (!created) {
    const existing = await store.get(path);
    const missingFields = Object.fromEntries(
      Object.entries(defaults).filter(([field]) => !existing?.[field]),
    );
    if (Object.keys(missingFields).length) {
      await store.set(path, { ...missingFields, updatedAt: now }, true);
    }
  }
  return store.get(path);
}

async function ensureDefaultRole(uid: string) {
  if (isDemo) return;
  const auth = adminAuth();
  const account = await auth.getUser(uid);
  const role = account.customClaims?.role;
  if (role === 'admin' || role === 'editor' || role === 'family' || role === 'user') return;
  await auth.setCustomUserClaims(uid, { ...account.customClaims, role: 'family' });
}

// ---------- Profile ----------
userRouter.get('/me', wrap(async (req, res) => {
  const { uid, email, displayName, photoURL, role } = req.user!;
  await ensureDefaultRole(uid);
  const profile = await ensureUserProfile(uid, email, displayName, photoURL);
  res.json({ uid, email, role, profile });
}));

userRouter.put('/me', wrap(async (req, res) => {
  const body = profileSchema.parse(req.body);
  const { uid, email } = req.user!;
  const now = new Date().toISOString();
  const previous = await ensureUserProfile(uid, email, req.user!.displayName, req.user!.photoURL);
  const data: Record<string, unknown> = {
    ...body,
    email,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  if (body.consent) data.consentAt = now;
  delete data.consent;
  await store.set(`users/${uid}`, data, true);
  res.json({ profile: await store.get(`users/${uid}`) });
}));

// Account deletion: removes all of the user's private records, then the auth account.
userRouter.delete('/me', wrap(async (req, res) => {
  const { uid } = req.user!;
  for (const root of PRIVATE_ROOTS) await store.removeTree(`${root}/${uid}`);
  if (!isDemo) await adminAuth().deleteUser(uid);
  res.status(204).end();
}));

// ---------- Journey ----------
async function readJourney(uid: string) {
  const journey = await store.get(`journeys/${uid}`);
  const milestones = Object.fromEntries(MILESTONES.map((m) => [m.id, 'not_started']));
  return { route: null, ...journey, milestones: { ...milestones, ...(journey?.milestones ?? {}) } };
}

userRouter.get('/journey', wrap(async (req, res) => {
  res.json({ journey: await readJourney(req.user!.uid), milestoneDefs: MILESTONES });
}));

userRouter.post('/journey/guide', wrap(async (req, res) => {
  const answers = navigatorSchema.parse(req.body);
  const { uid } = req.user!;
  const g = guide(answers);
  const previousJourney = await store.get(`journeys/${uid}`);
  const now = new Date().toISOString();
  await store.set(
    `journeys/${uid}`,
    { route: g.route, answers, createdAt: previousJourney?.createdAt ?? now, updatedAt: now },
    true,
  );

  // (Re)build the route-specific checklist; keep progress on items that still apply.
  const existing = await store.list(`checklists/${uid}/items`);
  const keep = new Map(existing.map((i) => [i.id, i]));
  const wanted = checklistFor(g.route);
  for (const item of wanted) {
    const prev = keep.get(item.id);
    await store.set(`checklists/${uid}/items/${item.id}`, {
      ...item,
      completed: prev?.completed ?? false,
      notes: prev?.notes ?? '',
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    });
  }
  const wantedIds = new Set(wanted.map((i) => i.id));
  for (const old of existing) if (!wantedIds.has(old.id)) await store.remove(`checklists/${uid}/items/${old.id}`);

  res.json({ guidance: g, journey: await readJourney(uid) });
}));

userRouter.put('/journey/progress', wrap(async (req, res) => {
  const { milestoneId, status } = progressSchema.parse(req.body);
  if (!MILESTONES.some((m) => m.id === milestoneId)) throw notFound('Unknown milestone');
  const { uid } = req.user!;
  const j = await readJourney(uid);
  const existingJourney = await store.get(`journeys/${uid}`);
  const now = new Date().toISOString();
  await store.set(
    `journeys/${uid}`,
    {
      milestones: { ...j.milestones, [milestoneId]: status },
      createdAt: existingJourney?.createdAt ?? now,
      updatedAt: now,
    },
    true,
  );
  res.json({ journey: await readJourney(uid) });
}));

// ---------- Checklist ----------
userRouter.get('/checklist', wrap(async (req, res) => {
  const items = await store.list(`checklists/${req.user!.uid}/items`);
  const done = items.filter((i) => i.completed).length;
  res.json({ items, completion: items.length ? Math.round((done / items.length) * 100) : 0 });
}));

userRouter.put('/checklist/:id', wrap(async (req, res) => {
  const body = checklistUpdateSchema.parse(req.body);
  const path = `checklists/${req.user!.uid}/items/${req.params.id}`;
  if (!(await store.get(path))) throw notFound('Checklist item not found');
  await store.set(path, { ...body, updatedAt: new Date().toISOString() }, true);
  res.json({ item: await store.get(path) });
}));

// ---------- Reminders ----------
userRouter.get('/reminders', wrap(async (req, res) => {
  const items = await store.list(`reminders/${req.user!.uid}/items`);
  items.sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  res.json({ items });
}));

userRouter.post('/reminders', wrap(async (req, res) => {
  const body = reminderSchema.parse(req.body);
  const id = randomUUID();
  const now = new Date().toISOString();
  await store.set(`reminders/${req.user!.uid}/items/${id}`, {
    ...body,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });
  res.status(201).json({ item: await store.get(`reminders/${req.user!.uid}/items/${id}`) });
}));

userRouter.put('/reminders/:id', wrap(async (req, res) => {
  const body = reminderUpdateSchema.parse(req.body);
  const path = `reminders/${req.user!.uid}/items/${req.params.id}`;
  if (!(await store.get(path))) throw notFound('Reminder not found');
  await store.set(path, { ...body, updatedAt: new Date().toISOString() }, true);
  res.json({ item: await store.get(path) });
}));

userRouter.delete('/reminders/:id', wrap(async (req, res) => {
  const path = `reminders/${req.user!.uid}/items/${req.params.id}`;
  if (!(await store.get(path))) throw notFound('Reminder not found');
  await store.remove(path);
  res.status(204).end();
}));

// ---------- Bookmarks ----------
userRouter.get('/bookmarks', wrap(async (req, res) => {
  res.json({ items: await store.list(`bookmarks/${req.user!.uid}/resources`) });
}));

userRouter.post('/bookmarks', wrap(async (req, res) => {
  const { resourceId } = bookmarkSchema.parse(req.body);
  if (!(await store.get(`officialSources/${resourceId}`))) throw notFound('Resource not found');
  await store.set(`bookmarks/${req.user!.uid}/resources/${resourceId}`, { savedAt: new Date().toISOString() });
  res.status(201).json({ ok: true });
}));

userRouter.delete('/bookmarks/:id', wrap(async (req, res) => {
  await store.remove(`bookmarks/${req.user!.uid}/resources/${req.params.id}`);
  res.status(204).end();
}));

// ---------- Personal notes (owner only; no admin access path exists) ----------
userRouter.get('/notes', wrap(async (req, res) => {
  const items = await store.list(`userNotes/${req.user!.uid}/notes`);
  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ items });
}));

userRouter.post('/notes', wrap(async (req, res) => {
  const { text } = noteSchema.parse(req.body);
  const id = randomUUID();
  const now = new Date().toISOString();
  await store.set(`userNotes/${req.user!.uid}/notes/${id}`, { text, createdAt: now, updatedAt: now });
  res.status(201).json({ item: await store.get(`userNotes/${req.user!.uid}/notes/${id}`) });
}));

userRouter.put('/notes/:id', wrap(async (req, res) => {
  const { text } = noteUpdateSchema.parse(req.body);
  const path = `userNotes/${req.user!.uid}/notes/${req.params.id}`;
  if (!(await store.get(path))) throw notFound('Note not found');
  await store.set(path, { text, updatedAt: new Date().toISOString() }, true);
  res.json({ item: await store.get(path) });
}));

userRouter.delete('/notes/:id', wrap(async (req, res) => {
  await store.remove(`userNotes/${req.user!.uid}/notes/${req.params.id}`);
  res.status(204).end();
}));
