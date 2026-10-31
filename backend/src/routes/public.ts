import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env, geminiConfigured, isDemo } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';
import { answer } from '../services/assistant.js';
import { guide } from '../services/navigator.js';
import { store } from '../services/store.js';
import { notFound } from '../utils/errors.js';
import { chatSchema, feedbackSchema, navigatorSchema } from '../validators/index.js';
import { randomUUID } from 'node:crypto';

export const publicRouter = Router();

const chatLimiter = rateLimit({ windowMs: 60_000, limit: 15, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many questions. Please wait a minute.' } });

// Honest availability status for the UI.
publicRouter.get('/status', (_req, res) => {
  res.json({
    demoMode: isDemo,
    auth: isDemo ? 'demo' : 'firebase',
    assistant: geminiConfigured ? 'gemini-grounded' : 'faq-fallback',
    environment: env.nodeEnv,
  });
});

publicRouter.post('/navigator', wrap(async (req, res) => {
  res.json({ guidance: guide(navigatorSchema.parse(req.body)) });
}));

publicRouter.get('/sources', wrap(async (req, res) => {
  const { q, type, state, district, category } = req.query as Record<string, string | undefined>;
  let items = await store.list('officialSources');
  if (!isDemo) {
    const today = new Date().toISOString().slice(0, 10);
    items = items.filter((source) => source.verificationStatus === 'verified' && source.nextReview > today);
  }
  if (type) items = items.filter((s) => s.sourceType === type);
  if (state) items = items.filter((s) => (s.state ?? '').toLowerCase() === state.toLowerCase());
  if (district) items = items.filter((s) => (s.district ?? '').toLowerCase() === district.toLowerCase());
  if (category) items = items.filter((s) => (s.category ?? '').toLowerCase() === category.toLowerCase());
  if (q) {
    const n = q.toLowerCase();
    items = items.filter((s) => `${s.title} ${s.organisation} ${s.summary}`.toLowerCase().includes(n));
  }
  res.json({ items });
}));

// Resources = published knowledge articles joined with their source.
publicRouter.get('/resources', wrap(async (_req, res) => {
  const [articles, sources] = await Promise.all([store.list('knowledgeArticles'), store.list('officialSources')]);
  const items = articles
    .filter((article) => article.status === 'published')
    .map((article) => ({ article, source: sources.find((source) => source.id === article.sourceId) }))
    .filter(({ source }) => isDemo || (source?.verificationStatus === 'verified' && source.nextReview > new Date().toISOString().slice(0, 10)))
    .map(({ article, source }) => ({ ...article, source: source ?? null }));
  res.json({ items });
}));

publicRouter.get('/resources/:id', wrap(async (req, res) => {
  const a = await store.get(`knowledgeArticles/${req.params.id}`);
  if (!a || a.status !== 'published') throw notFound('Resource not found');
  const source = await store.get(`officialSources/${a.sourceId}`);
  if (!isDemo && (source?.verificationStatus !== 'verified' || source.nextReview <= new Date().toISOString().slice(0, 10))) {
    throw notFound('Resource not found');
  }
  res.json({ item: { ...a, source } });
}));

publicRouter.get('/faqs', wrap(async (_req, res) => {
  const items = await store.list('faqs');
  res.json({ items: isDemo ? items : items.filter((faq) => faq.status === 'published') });
}));

publicRouter.post('/assistant/chat', chatLimiter, wrap(async (req, res) => {
  const { message, language, route } = chatSchema.parse(req.body);
  res.json(await answer(message, language, route));
}));

publicRouter.post('/feedback', requireAuth, wrap(async (req, res) => {
  const body = feedbackSchema.parse(req.body);
  const id = randomUUID();
  await store.set(`feedback/${id}`, { uid: req.user!.uid, ...body, createdAt: new Date().toISOString() });
  res.status(201).json({ ok: true });
}));
