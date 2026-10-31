import { Timestamp, getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '../../config/firebase-admin.js';

export function firebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

const timestampFields = new Set(['createdAt', 'updatedAt', 'consentAt', 'savedAt', 'at']);

function toFirestoreValue(value: unknown, field?: string): unknown {
  if (value instanceof Timestamp || value instanceof Date) return value;
  if (field && timestampFields.has(field) && typeof value === 'string') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error(`Invalid timestamp value for "${field}".`);
    return Timestamp.fromDate(date);
  }
  if (Array.isArray(value)) return value.map((item) => toFirestoreValue(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .map(([key, child]) => [key, toFirestoreValue(child, key)]),
    );
  }
  return value;
}

function fromFirestoreValue(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(fromFirestoreValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, fromFirestoreValue(child)]),
    );
  }
  return value;
}

export function serializeFirestoreData(data: Record<string, unknown>): Record<string, unknown> {
  return toFirestoreValue(data) as Record<string, unknown>;
}

export function deserializeFirestoreData(data: Record<string, unknown>): Record<string, unknown> {
  return fromFirestoreValue(data) as Record<string, unknown>;
}
