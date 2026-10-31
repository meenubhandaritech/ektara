import type {
  ChecklistDocument,
  JourneyDocument,
  KnowledgeArticleDocument,
  OfficialSourceDocument,
  ReminderDocument,
  UserDocument,
} from '../../types/firestore';
import type { Profile } from '../../types';

export interface UserRepository {
  get(uid: string): Promise<UserDocument | null>;
  update(uid: string, profile: Partial<Profile>): Promise<void>;
}

export interface JourneyRepository {
  get(uid: string): Promise<JourneyDocument | null>;
  save(uid: string, journey: Partial<JourneyDocument>): Promise<void>;
}

export interface ChecklistRepository {
  list(uid: string): Promise<ChecklistDocument[]>;
  update(uid: string, itemId: string, changes: Pick<ChecklistDocument, 'completed' | 'notes'>): Promise<void>;
}

export interface ReminderRepository {
  list(uid: string): Promise<ReminderDocument[]>;
  create(uid: string, reminder: Pick<ReminderDocument, 'title' | 'description' | 'dueDate'>): Promise<string>;
  update(uid: string, reminderId: string, changes: Partial<ReminderDocument>): Promise<void>;
  remove(uid: string, reminderId: string): Promise<void>;
}

export interface BookmarkRepository {
  list(uid: string): Promise<string[]>;
  save(uid: string, resourceId: string): Promise<void>;
  remove(uid: string, resourceId: string): Promise<void>;
}

export interface ResourceRepository {
  listPublishedArticles(): Promise<KnowledgeArticleDocument[]>;
  getPublishedArticle(articleId: string): Promise<KnowledgeArticleDocument | null>;
  listSources(): Promise<OfficialSourceDocument[]>;
}
