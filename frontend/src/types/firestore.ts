import type { Timestamp } from 'firebase/firestore';
import type {
  Article,
  ChecklistItem,
  Journey,
  NavigatorAnswers,
  Note,
  Profile,
  Reminder,
  SourceItem,
} from './index';

export type FirestoreTimestamp = Timestamp | string;

export interface UserDocument extends Omit<Profile, 'consentAt'> {
  email?: string;
  photoURL?: string;
  consentAt?: FirestoreTimestamp;
  selectedRoute?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface JourneyDocument extends Journey {
  answers?: NavigatorAnswers;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface ChecklistDocument extends ChecklistItem {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface ReminderDocument extends Reminder {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface BookmarkDocument {
  resourceId: string;
  savedAt: FirestoreTimestamp;
}

export interface UserNoteDocument extends Omit<Note, 'createdAt' | 'updatedAt'> {
  createdAt: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface KnowledgeArticleDocument extends Article {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface OfficialSourceDocument extends SourceItem {
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface FaqDocument {
  id: string;
  question: string;
  answer: string;
  sourceId: string;
  status: 'draft' | 'published' | 'archived';
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface FeedbackDocument {
  uid: string;
  message: string;
  category: 'content' | 'bug' | 'support' | 'other';
  createdAt: FirestoreTimestamp;
}

export interface AdminAuditLogDocument {
  actor: string;
  action: string;
  targetId: string;
  at: FirestoreTimestamp;
}
