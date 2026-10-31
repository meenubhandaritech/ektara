# Data Model (Firestore)

Private (owner-only):
- `users/{uid}` — profile: displayName, email, state, residency, selectedRoute, language, consentAt. `role` is held in Firebase custom claims, not writable profile data.
- `journeys/{uid}` — route, milestones: `{ id: 'not_started'|'current'|'done' }`
- `checklists/{uid}/items/{itemId}` — route-specific items: title, category, description, sourceId, completed, notes
- `reminders/{uid}/items/{id}` — title, description, dueDate, completed
- `bookmarks/{uid}/resources/{resourceId}`
- `userNotes/{uid}/notes/{id}`

Public (admin-written, published-only reads for articles):
- `knowledgeArticles/{id}` — content, sourceId, documentName, section, effectiveDate, lastReviewed, reviewer, status (`draft|published|archived`), version, language
- `officialSources/{id}` — title, organisation, sourceType (`official|professional|educational`), url, lastVerified, nextReview, verificationStatus, state?, district?, category, summary; public in production only after verification
- `faqs/{id}` — question, answer, sourceId, status (`draft|published|archived`)

Other:
- `feedback/{id}` — uid, message, category, createdAt
- `adminAuditLogs/{id}` — actor, action, targetId, at (backend writes only)

The frontend model interfaces are in `frontend/src/types/firestore.ts`. Timestamp fields are stored as Firestore timestamps; API responses serialize backend timestamps as ISO strings. Public endpoints expose only published articles/FAQs and verified official sources in production.
