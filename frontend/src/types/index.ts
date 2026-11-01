export type Role = 'family' | 'user' | 'editor' | 'admin';

export interface Profile {
  displayName?: string;
  photoURL?: string;
  state?: string;
  residency?: 'resident-indian' | 'nri' | 'oci' | 'foreign' | 'unsure';
  language?: 'en' | 'hi';
  onboarded?: boolean;
  consentAt?: string;
}

export interface Me {
  uid: string;
  email?: string;
  role: Role;
  profile: Profile | null;
}

export interface SourceItem {
  id: string;
  title: string;
  organisation: string;
  sourceType: 'official' | 'professional' | 'educational';
  category: string;
  url: string;
  summary: string;
  state?: string;
  district?: string;
  lastVerified: string;
  nextReview: string;
  verificationStatus: 'verified' | 'needs-review' | 'seeded-needs-admin-verification' | string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  sourceId: string;
  documentName: string;
  section: string;
  effectiveDate: string;
  lastReviewed: string;
  reviewer: string;
  status: 'draft' | 'published' | 'archived';
  language: 'en' | 'hi';
  version?: number;
  source?: SourceItem | null;
}

export interface NavigatorAnswers {
  residence: 'india' | 'abroad' | 'unsure';
  status: 'resident-indian' | 'nri' | 'oci' | 'foreign' | 'unsure';
  relationship: 'unrelated' | 'relative' | 'stepchild' | 'unsure';
  focus: 'general' | 'hama' | 'unsure';
  knowsCaraCarings: 'yes' | 'no' | 'unsure';
}

export interface Guidance {
  route: string;
  confident: boolean;
  routeTitle: string;
  summary: string;
  frameworks: string[];
  considerations: string[];
  authorities: string[];
  nextSteps: string[];
  sourceIds: string[];
  seekProfessionalHelp: boolean;
  disclaimer: string;
}

export type MilestoneStatus = 'not_started' | 'current' | 'done';
export interface Journey {
  route: string | null;
  milestones: Record<string, MilestoneStatus>;
}
export interface MilestoneDef { id: string; title: string }

export interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  description: string;
  sourceId: string;
  completed: boolean;
  notes: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

export interface Note { id: string; text: string; createdAt: string; updatedAt?: string }

export interface SourceCardData {
  title: string;
  organisation: string;
  url: string;
  documentName: string;
  section: string;
  relevance: string;
  summary: string;
  lastReviewed: string;
  sourceType: string;
  verificationStatus: string;
}
export interface AssistantReply {
  answer: string;
  sources: SourceCardData[];
  mode: 'gemini-grounded' | 'faq-fallback' | 'no-source';
  answerType: 'official' | 'general' | 'confirmation';
  nextStep: string;
  notice: string;
  followUps: string[];
}

export interface PlatformStatus {
  demoMode: boolean;
  auth: 'demo' | 'firebase';
  assistant: 'gemini-grounded' | 'faq-fallback';
  environment: string;
}
