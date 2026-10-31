import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env, isDemo, validateProductionConfiguration } from './config/env.js';
import { initializeFirebaseAdmin } from './config/firebase-admin.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { adminRouter } from './routes/admin.js';
import { publicRouter } from './routes/public.js';
import { userRouter } from './routes/user.js';
import { seedPublicContent } from './services/seed.js';
import { logger } from './utils/logger.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.corsOrigin.split(','), credentials: false }));
app.use(express.json({ limit: '50kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => logger.info('req', { method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start }));
  next();
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);
app.use('/api', userRouter);
app.use(notFoundHandler);
app.use(errorHandler);

async function main() {
  validateProductionConfiguration();
  initializeFirebaseAdmin();

  // Seed only the in-memory demo store. Real Firestore content is managed by admins.
  if (isDemo) {
    await seedPublicContent();
    logger.warn('DEMO MODE active: in-memory synthetic data, no Firebase.');
  }
  app.listen(env.port, () => logger.info('EKTARA API listening', { port: env.port, demo: isDemo }));
}

main().catch((e) => {
  logger.error('startup failed', { message: e?.message });
  process.exit(1);
});
