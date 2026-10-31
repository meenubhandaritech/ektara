# EKTARA Privacy Design

Designed around the principles of the Digital Personal Data Protection Act, 2023 and applicable notified rules (phased commencement). **Obtain legal review before production deployment.**

## Principles
- **Data minimisation:** name, email, state, residency status and chosen route only. No Aadhaar, passport, medical or financial data.
- **Purpose limitation:** data is used only to personalise preparation guidance.
- **Consent:** explicit consent checkbox at registration; policy linked.
- **Owner-only access:** private collections are readable only by their owner (Firestore rules + API checks). Admins cannot read notes, checklists or reminders.
- **Erasure:** account deletion workflow removes all `users`, `journeys`, `checklists`, `reminders`, `bookmarks`, `userNotes` records for the uid.
- **Correction:** users can edit profile and route at any time.
- **Auditing:** admin content changes write to `adminAuditLogs`.

## Never stored
Child profiles, photographs, matching data, government case data, uploaded identity documents.

## Retention (proposed)
Inactive accounts reviewed after 24 months; feedback retained 12 months; audit logs 24 months.
