import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { isDemo } from '../config/env.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';
import { adminAuth, store } from '../services/store.js';
import { badRequest, notFound } from '../utils/errors.js';
import { articleSchema, roleSchema, sourceSchema } from '../validators/index.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin', 'editor'));

async function audit(actor: string, action: string, targetId: string) {
  await store.set(`adminAuditLogs/${randomUUID()}`, { actor, action, targetId, at: new Date().toISOString() });
}

// Aggregate counts only. No user notes, checklists, reminders or profiles are exposed.
adminRouter.get('/dashboard', wrap(async (_req, res) => {
  const [users, articles, sources, feedback] = await Promise.all([
    store.list('users'),
    store.list('knowledgeArticles'),
    store.list('officialSources'),
    store.list('feedback'),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  res.json({
    accounts: users.length,
    articles: { total: articles.length, published: articles.filter((a) => a.status === 'published').length, draft: articles.filter((a) => a.status === 'draft').length },
    sources: {
      total: sources.length,
      needingReview: sources.filter((s) => s.verificationStatus !== 'verified' || s.nextReview <= today).length,
    },
    feedbackCount: feedback.length,
  });
}));

adminRouter.get('/articles', wrap(async (_req, res) => {
  res.json({ items: await store.list('knowledgeArticles') });
}));

adminRouter.post('/articles', wrap(async (req, res) => {
  const body = articleSchema.parse(req.body);
  const source = await store.get(`officialSources/${body.sourceId}`);
  if (!source) throw badRequest('sourceId does not match an official source');
  if (!isDemo && body.status === 'published' && source.verificationStatus !== 'verified') {
    throw badRequest('Verify the official source before publishing this article');
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  await store.set(`knowledgeArticles/${id}`, {
    ...body,
    version: 1,
    createdAt: now,
    updatedAt: now,
  });
  await audit(req.user!.uid, 'article.create', id);
  res.status(201).json({ item: await store.get(`knowledgeArticles/${id}`) });
}));

adminRouter.put('/articles/:id', wrap(async (req, res) => {
  const body = articleSchema.parse(req.body);
  const path = `knowledgeArticles/${req.params.id}`;
  const prev = await store.get(path);
  if (!prev) throw notFound('Article not found');
  const source = await store.get(`officialSources/${body.sourceId}`);
  if (!source) throw badRequest('sourceId does not match an official source');
  if (!isDemo && body.status === 'published' && source.verificationStatus !== 'verified') {
    throw badRequest('Verify the official source before publishing this article');
  }
  const now = new Date().toISOString();
  // Keep the previous version for history.
  await store.set(`${path}/versions/${prev.version ?? 1}`, prev);
  await store.set(path, {
    ...body,
    version: (prev.version ?? 1) + 1,
    createdAt: prev.createdAt ?? now,
    updatedAt: now,
  });
  await audit(req.user!.uid, 'article.update', req.params.id);
  res.json({ item: await store.get(path) });
}));

adminRouter.get('/sources', wrap(async (_req, res) => {
  res.json({ items: await store.list('officialSources') });
}));

adminRouter.post('/sources', wrap(async (req, res) => {
  const body = sourceSchema.parse(req.body);
  const id = randomUUID();
  const now = new Date().toISOString();
  await store.set(`officialSources/${id}`, { ...body, createdAt: now, updatedAt: now });
  await audit(req.user!.uid, 'source.create', id);
  res.status(201).json({ item: await store.get(`officialSources/${id}`) });
}));

adminRouter.put('/sources/:id', wrap(async (req, res) => {
  const body = sourceSchema.parse(req.body);
  const path = `officialSources/${req.params.id}`;
  const previous = await store.get(path);
  if (!previous) throw notFound('Source not found');
  await store.set(path, {
    ...body,
    createdAt: previous.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await audit(req.user!.uid, 'source.update', req.params.id);
  res.json({ item: await store.get(path) });
}));

adminRouter.get('/feedback', wrap(async (_req, res) => {
  const items = await store.list('feedback');
  // Strip uid so reviewers see the message, not the person.
  res.json({ items: items.map(({ uid: _u, ...rest }) => rest) });
}));

// Role management is admin-only (editors cannot promote anyone).
adminRouter.put('/users/:uid/role', requireRole('admin'), wrap(async (req, res) => {
  const { role } = roleSchema.parse(req.body);
  if (isDemo) throw badRequest('Role management is unavailable in demo mode');
  await adminAuth().setCustomUserClaims(req.params.uid, { role });
  await audit(req.user!.uid, `role.set:${role}`, req.params.uid);
  res.json({ ok: true });
}));
