import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { assertFirebaseConfigured, firebaseConfig } from './config';

export function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfigured();
  const existingApp = getApps().find((app) => app.name === '[DEFAULT]');
  return existingApp ?? initializeApp(firebaseConfig);
}
