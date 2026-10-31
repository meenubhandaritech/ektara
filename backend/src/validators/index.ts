import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  state: z.string().trim().max(60).optional(),
  residency: z.enum(['resident-indian', 'nri', 'oci', 'foreign', 'unsure']).optional(),
  language: z.enum(['en', 'hi']).optional(),
  consent: z.literal(true).optional(),
  onboarded: z.boolean().optional(),
});

export const navigatorSchema = z.object({
  residence: z.enum(['india', 'abroad', 'unsure']),
  status: z.enum(['resident-indian', 'nri', 'oci', 'foreign', 'unsure']),
  relationship: z.enum(['unrelated', 'relative', 'stepchild', 'unsure']),
  focus: z.enum(['general', 'hama', 'unsure']),
  knowsCaraCarings: z.enum(['yes', 'no', 'unsure']),
});

export const progressSchema = z.object({
  milestoneId: z.string().min(1).max(40),
  status: z.enum(['not_started', 'current', 'done']),
});

export const checklistUpdateSchema = z.object({
  completed: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export const reminderSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().default(''),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
});
export const reminderUpdateSchema = reminderSchema.partial().extend({ completed: z.boolean().optional() });

export const bookmarkSchema = z.object({ resourceId: z.string().min(1).max(80) });
export const noteSchema = z.object({ text: z.string().trim().min(1).max(2000) });
export const noteUpdateSchema = noteSchema;

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(600),
  language: z.enum(['en', 'hi']).default('en'),
  route: z.string().max(40).optional(),
});

export const feedbackSchema = z.object({
  message: z.string().trim().min(3).max(2000),
  category: z.enum(['content', 'bug', 'support', 'other']).default('other'),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(10).max(6000),
  keywords: z.array(z.string().max(40)).max(20).default([]),
  sourceId: z.string().min(1),
  documentName: z.string().max(200),
  section: z.string().max(120).default(''),
  effectiveDate: z.string().max(20).default(''),
  lastReviewed: isoDate,
  reviewer: z.string().trim().min(1).max(80),
  status: z.enum(['draft', 'published', 'archived']),
  language: z.enum(['en', 'hi']).default('en'),
});

export const sourceSchema = z.object({
  title: z.string().trim().min(3).max(200),
  organisation: z.string().trim().min(2).max(160),
  sourceType: z.enum(['official', 'professional', 'educational']),
  category: z.string().trim().max(60).default('General'),
  url: z.string().url().startsWith('https://', 'Official URLs must use https'),
  summary: z.string().trim().min(5).max(500),
  state: z.string().max(60).optional(),
  district: z.string().max(60).optional(),
  lastVerified: isoDate,
  nextReview: isoDate,
  verificationStatus: z.enum(['verified', 'needs-review', 'seeded-needs-admin-verification']),
});

export const roleSchema = z.object({ role: z.enum(['family', 'user', 'editor', 'admin']) });
