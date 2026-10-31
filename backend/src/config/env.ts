import 'dotenv/config';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const demoMode = (process.env.DEMO_MODE ?? 'false').toLowerCase() === 'true';
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
const defaultCredentialsPaths = [
  process.env.APPDATA ? join(process.env.APPDATA, 'gcloud', 'application_default_credentials.json') : '',
  join(homedir(), '.config', 'gcloud', 'application_default_credentials.json'),
].filter(Boolean);
const hasApplicationDefaultCredentials =
  (!!credentialsPath && existsSync(credentialsPath)) ||
  defaultCredentialsPaths.some((path) => existsSync(path)) ||
  !!(process.env.K_SERVICE || process.env.FUNCTION_TARGET || process.env.GAE_ENV || process.env.GCE_METADATA_HOST);
const hasServiceAccountCredentials =
  !!process.env.FIREBASE_CLIENT_EMAIL?.trim() && !!process.env.FIREBASE_PRIVATE_KEY?.trim();

export const env = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  demoMode,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  },
};

export const firebaseConfigured =
  !!env.firebase.projectId.trim() &&
  (hasServiceAccountCredentials || hasApplicationDefaultCredentials);
export const firebaseAdminCredentialSource = hasServiceAccountCredentials
  ? 'service-account'
  : hasApplicationDefaultCredentials
    ? 'application-default'
    : null;
export const geminiConfigured = !!env.gemini.apiKey;

export const isDemo = env.demoMode;

export function validateProductionConfiguration() {
  if (isDemo) return;
  const missing: string[] = [];
  if (!env.firebase.projectId.trim()) missing.push('FIREBASE_PROJECT_ID');

  const hasPartialServiceAccount =
    !!env.firebase.clientEmail.trim() !== !!env.firebase.privateKey.trim();
  if (hasPartialServiceAccount) {
    missing.push('both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY, or remove the partial pair to use ADC');
  } else if (!hasServiceAccountCredentials && !hasApplicationDefaultCredentials) {
    missing.push('Firebase Admin service-account credentials or Application Default Credentials');
  }

  if (missing.length) {
    throw new Error(
      `DEMO_MODE=false requires Firebase Admin credentials. Missing: ${missing.join(', ')}`,
    );
  }
}
