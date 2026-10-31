import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '../../config/firebase-admin.js';

export function firebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export async function verifyFirebaseIdToken(token: string) {
  return firebaseAdminAuth().verifyIdToken(token);
}
