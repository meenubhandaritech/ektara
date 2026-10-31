import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { env, firebaseAdminCredentialSource, isDemo } from './env.js';

let firebaseApp: App | undefined;

export function initializeFirebaseAdmin(): App | null {
  if (isDemo) return null;

  firebaseApp ??=
    getApps().find((app) => app.name === '[DEFAULT]') ??
    initializeApp({
      projectId: env.firebase.projectId,
      credential:
        firebaseAdminCredentialSource === 'service-account'
          ? cert({
              projectId: env.firebase.projectId,
              clientEmail: env.firebase.clientEmail,
              privateKey: env.firebase.privateKey,
            })
          : applicationDefault(),
    });

  return firebaseApp;
}

export function getFirebaseAdminApp(): App {
  const app = initializeFirebaseAdmin();
  if (!app) throw new Error('Firebase Admin is unavailable while DEMO_MODE=true.');
  return app;
}
