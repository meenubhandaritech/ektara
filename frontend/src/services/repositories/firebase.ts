import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../../lib/firebase';
import type {
  ChecklistDocument,
  JourneyDocument,
  KnowledgeArticleDocument,
  OfficialSourceDocument,
  ReminderDocument,
  UserDocument,
} from '../../types/firestore';
import type { Profile } from '../../types';
import type {
  BookmarkRepository,
  ChecklistRepository,
  JourneyRepository,
  ReminderRepository,
  ResourceRepository,
  UserRepository,
} from './interfaces';

function documentData<T>(data: DocumentData): T {
  return data as T;
}

export const firebaseUserRepository: UserRepository = {
  async get(uid) {
    const snapshot = await getDoc(doc(getFirebaseFirestore(), 'users', uid));
    return snapshot.exists() ? documentData<UserDocument>(snapshot.data()) : null;
  },
  async update(uid, profile: Partial<Profile>) {
    const { consentAt, ...profileFields } = profile;
    const consentTimestamp = consentAt ? Timestamp.fromDate(new Date(consentAt)) : undefined;
    await setDoc(
      doc(getFirebaseFirestore(), 'users', uid),
      {
        ...profileFields,
        ...(consentTimestamp ? { consentAt: consentTimestamp } : {}),
        updatedAt: serverTimestamp(),
      } as DocumentData,
      { merge: true },
    );
  },
};

export const firebaseJourneyRepository: JourneyRepository = {
  async get(uid) {
    const snapshot = await getDoc(doc(getFirebaseFirestore(), 'journeys', uid));
    return snapshot.exists() ? documentData<JourneyDocument>(snapshot.data()) : null;
  },
  async save(uid, journey) {
    await setDoc(
      doc(getFirebaseFirestore(), 'journeys', uid),
      { ...journey, updatedAt: serverTimestamp() } as DocumentData,
      { merge: true },
    );
  },
};

export const firebaseChecklistRepository: ChecklistRepository = {
  async list(uid) {
    const snapshot = await getDocs(collection(getFirebaseFirestore(), 'checklists', uid, 'items'));
    return snapshot.docs.map((item) => ({
      ...documentData<ChecklistDocument>(item.data()),
      id: item.id,
    }));
  },
  async update(uid, itemId, changes) {
    await updateDoc(doc(getFirebaseFirestore(), 'checklists', uid, 'items', itemId), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  },
};

export const firebaseReminderRepository: ReminderRepository = {
  async list(uid) {
    const snapshot = await getDocs(collection(getFirebaseFirestore(), 'reminders', uid, 'items'));
    return snapshot.docs.map((item) => ({
      ...documentData<ReminderDocument>(item.data()),
      id: item.id,
    }));
  },
  async create(uid, reminder) {
    const reference = doc(collection(getFirebaseFirestore(), 'reminders', uid, 'items'));
    await setDoc(reference, {
      ...reminder,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return reference.id;
  },
  async update(uid, reminderId, changes) {
    await updateDoc(doc(getFirebaseFirestore(), 'reminders', uid, 'items', reminderId), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  },
  async remove(uid, reminderId) {
    await deleteDoc(doc(getFirebaseFirestore(), 'reminders', uid, 'items', reminderId));
  },
};

export const firebaseBookmarkRepository: BookmarkRepository = {
  async list(uid) {
    const snapshot = await getDocs(collection(getFirebaseFirestore(), 'bookmarks', uid, 'resources'));
    return snapshot.docs.map((item) => item.id);
  },
  async save(uid, resourceId) {
    await setDoc(doc(getFirebaseFirestore(), 'bookmarks', uid, 'resources', resourceId), {
      savedAt: serverTimestamp(),
    });
  },
  async remove(uid, resourceId) {
    await deleteDoc(doc(getFirebaseFirestore(), 'bookmarks', uid, 'resources', resourceId));
  },
};

export const firebaseResourceRepository: ResourceRepository = {
  async listPublishedArticles() {
    const snapshot = await getDocs(
      query(collection(getFirebaseFirestore(), 'knowledgeArticles'), where('status', '==', 'published')),
    );
    return snapshot.docs.map((item) => ({
      ...documentData<KnowledgeArticleDocument>(item.data()),
      id: item.id,
    }));
  },
  async getPublishedArticle(articleId) {
    const snapshot = await getDoc(doc(getFirebaseFirestore(), 'knowledgeArticles', articleId));
    if (!snapshot.exists()) return null;
    const article = documentData<KnowledgeArticleDocument>(snapshot.data());
    return article.status === 'published' ? { ...article, id: snapshot.id } : null;
  },
  async listSources() {
    const snapshot = await getDocs(
      query(collection(getFirebaseFirestore(), 'officialSources'), where('verificationStatus', '==', 'verified')),
    );
    return snapshot.docs.map((item) => ({
      ...documentData<OfficialSourceDocument>(item.data()),
      id: item.id,
    }));
  },
};
