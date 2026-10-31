const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
  appId: env.VITE_FIREBASE_APP_ID?.trim() ?? '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || undefined,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
export const missingFirebaseConfig = requiredKeys.filter((key) => !firebaseConfig[key]);
export const firebaseConfigured = missingFirebaseConfig.length === 0;

export function assertFirebaseConfigured(): void {
  if (!firebaseConfigured) {
    throw new Error(
      `Firebase web configuration is incomplete. Missing: ${missingFirebaseConfig
        .map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`)
        .join(', ')}`,
    );
  }
}
