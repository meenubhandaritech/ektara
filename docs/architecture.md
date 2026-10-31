# EKTARA Architecture

EKTARA is an **independent informational and preparation companion**. It is not operated or endorsed by the Government of India or CARA, and it does not integrate with CARINGS.

## Overview

```
Browser (React + Vite + TS + Tailwind)
   │  Firebase Auth (client)  ──► ID token
   ▼
Express API (Node + TS)  ── verifies ID token ──► Firebase Admin SDK ──► Firestore
   │
   └── Assistant: retrieve approved knowledge ► (Gemini if configured, else curated-FAQ fallback) ► answer + source cards
```

## Layers

| Layer | Responsibility |
|---|---|
| `frontend/` | UI, localisation (EN/HI), route navigator, dashboard, assistant UI, admin panel |
| `backend/` | Token verification, validation, authorisation, rate limiting, assistant retrieval, admin content APIs |
| `firebase/` | Security rules (defence in depth) and indexes |
| `docs/` | Architecture, privacy, data model, source register |

The frontend Firebase modules live under `frontend/src/lib/firebase/`; typed Firebase-backed repository implementations are grouped in `frontend/src/services/repositories/`. Existing screens continue to call the Express API rather than accessing Firestore from components. The backend's `Store` abstraction selects the in-memory implementation only when `DEMO_MODE=true`; production initialization requires valid Admin SDK configuration.

## Key decisions

1. **Backend never trusts the frontend.** Every protected route verifies a Firebase ID token; admin routes additionally check the `role` custom claim.
2. **Admins manage public content only.** Rules and APIs give admins no read path to `userNotes`, checklists or reminders.
3. **Retrieval-first AI.** The assistant only answers from approved (`status: published`) knowledge entries. If nothing relevant is found, it says so and points to official authorities. Gemini is used only to rephrase retrieved text in simple language; with no key, a deterministic FAQ fallback is used and labelled as such.
4. **Demo mode is explicit.** `DEMO_MODE=true` uses an in-memory store with synthetic data, shows a persistent banner, and never touches Firestore.
5. **No sensitive document handling in MVP.** No uploads, no Firebase Storage. OCR (phase two) runs in-browser.

## Route navigator

Rule-based and transparent: answers map to *potentially relevant* information and official sources. It never states eligibility and always shows the label "Preliminary informational guidance — not an official eligibility determination or legal opinion."
