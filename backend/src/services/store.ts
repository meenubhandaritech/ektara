import { firebaseAdminAuth } from './firebase/auth.service.js';
import {
  deserializeFirestoreData,
  firebaseAdminFirestore,
  serializeFirestoreData,
} from './firebase/firestore.service.js';
import { isDemo } from '../config/env.js';

export type Doc = Record<string, any> & { id: string };

/** Minimal document-store interface so demo mode and Firestore share one code path. */
export interface Store {
  get(path: string): Promise<Doc | null>;
  set(path: string, data: Record<string, any>, merge?: boolean): Promise<void>;
  createIfMissing(path: string, data: Record<string, any>): Promise<boolean>;
  list(collectionPath: string): Promise<Doc[]>;
  remove(path: string): Promise<void>;
  removeTree(path: string): Promise<void>;
}

class MemoryStore implements Store {
  private data = new Map<string, Record<string, any>>();
  async get(path: string) {
    const d = this.data.get(path);
    return d ? { id: path.split('/').pop()!, ...d } : null;
  }
  async set(path: string, data: Record<string, any>, merge = false) {
    const prev = merge ? this.data.get(path) ?? {} : {};
    this.data.set(path, { ...prev, ...data });
  }
  async createIfMissing(path: string, data: Record<string, any>) {
    if (this.data.has(path)) return false;
    this.data.set(path, { ...data });
    return true;
  }
  async list(col: string) {
    const depth = col.split('/').length + 1;
    return [...this.data.entries()]
      .filter(([p]) => p.startsWith(col + '/') && p.split('/').length === depth)
      .map(([p, d]) => ({ id: p.split('/').pop()!, ...d }));
  }
  async remove(path: string) {
    this.data.delete(path);
  }
  async removeTree(path: string) {
    for (const k of [...this.data.keys()]) if (k === path || k.startsWith(path + '/')) this.data.delete(k);
  }
}

class FirestoreStore implements Store {
  private get db() {
    return firebaseAdminFirestore();
  }
  async get(path: string) {
    const s = await this.db.doc(path).get();
    return s.exists
      ? { id: s.id, ...deserializeFirestoreData(s.data() as Record<string, unknown>) }
      : null;
  }
  async set(path: string, data: Record<string, any>, merge = false) {
    await this.db.doc(path).set(serializeFirestoreData(data), { merge });
  }
  async createIfMissing(path: string, data: Record<string, any>) {
    try {
      await this.db.doc(path).create(serializeFirestoreData(data));
      return true;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        ((error.code as number | string) === 6 || error.code === 'already-exists')
      ) {
        return false;
      }
      throw error;
    }
  }
  async list(col: string) {
    const s = await this.db.collection(col).get();
    return s.docs.map((d) => ({
      id: d.id,
      ...deserializeFirestoreData(d.data() as Record<string, unknown>),
    }));
  }
  async remove(path: string) {
    await this.db.doc(path).delete();
  }
  async removeTree(path: string) {
    await this.db.recursiveDelete(this.db.doc(path));
  }
}

export const store: Store = isDemo ? new MemoryStore() : new FirestoreStore();
export const adminAuth = firebaseAdminAuth;
