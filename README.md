# EKTARA

**Making Adoption Simpler, Kinder & Smarter.**
*Because building a family shouldn't be confusing.*

EKTARA is an independent informational and preparation companion for prospective adoptive parents in India. It is **not** operated or endorsed by the Government of India or CARA, does not replace CARINGS, does not match children, and never decides eligibility.

## Status (read this first)

The application supports a credential-free demo mode and includes a Firebase integration foundation. It is not connected to a Firebase project until you supply and verify project configuration.

Phase 1 (core) and the source-grounded assistant are implemented. Backend domain regression tests cover navigator safeguards and assistant refusals. Playwright end-to-end tests cover route rendering, responsive navigation, resource search, navigator editing, assistant source disclosure, and demo user/admin workflows. **Not yet built:** the OCR document scanner (Phase 2) and Hindi translations of the long educational pages (UI and navigation are localised; legal text is deliberately not machine-translated).

## Run it (demo mode, no Firebase or Gemini needed)

```bash
# 1. Backend
cd backend
cp ../.env.example .env        # DEMO_MODE=true by default
npm install
npm test
npm run typecheck
npm run dev                    # http://localhost:8080

# 2. Frontend (new terminal)
cd frontend
npm install
npm run typecheck
npm run dev                    # http://localhost:5173
```

In demo mode the server uses an in-memory store with synthetic data, a banner shows on every page, and the login page offers "Continue as demo user / demo admin". Nothing touches Firebase.

## Browser tests

Install the Playwright Chromium headless shell once, then run the isolated end-to-end suite:

```bash
cd frontend
npx playwright install chromium --only-shell
npm run test:e2e
```

The suite starts its own demo backend on port `8180` and frontend on port `5174`; it does not reuse the usual development servers.

## Firebase readiness

The ignored `frontend/.env.local` contains the provided Firebase Web App configuration for `ektara-507fd`; the client implements email/password and Google Authentication, local persistence, consent-gated Analytics, and first-login profile creation through the Express API. Email/password and temporary Firestore persistence were tested against the real project. Production is not activated: no Admin credentials are configured, and the deployed Firestore rules failed a two-account isolation test.

Review [docs/firebase-setup.md](./docs/firebase-setup.md) for the current security blocker, provider/domain checks, Admin credential setup, manual Firebase Console rule publication, and production verification steps. Do not use this Firebase project with real private data or set `DEMO_MODE=false` until reviewed rules are published and real token/backend/isolation checks pass.

## Production mode

1. Configure the existing Firebase project `ektara-507fd`; enable Google and email/password Authentication and Firestore.
2. Set backend env: `DEMO_MODE=false`, `FIREBASE_PROJECT_ID`, one complete Admin credential source (service-account pair or ADC), `CORS_ORIGIN`, and optionally `GEMINI_API_KEY`.
3. Set frontend env: `VITE_API_BASE_URL` and the public `VITE_FIREBASE_*` values.
4. Review `firebase/firestore.rules`, then publish it through Firebase Console → Firestore Database → Rules. Confirm the selected project is `ektara-507fd` before publishing. Do not use Firebase CLI for this workflow.
5. Create the first admin by setting a custom claim with the Admin SDK: `{ role: 'admin' }`. After that, admins can manage roles in the panel.
6. Add and **verify** official sources and articles in the admin panel. Seed content only exists in demo mode.

## Layout

- `frontend/` React + Vite + TypeScript + Tailwind
- `backend/` Express + TypeScript + Firebase Admin
- `firebase/` Firestore rules and indexes
- `docs/` architecture, privacy, data model, sources
- `docs/firebase-setup.md` Firebase project and deployment guide
- `docs/visual-assets.md` image sources and usage notes

## Design safeguards

- Route Navigator always shows "Preliminary informational guidance — not an official eligibility determination or legal opinion."
- In production, the assistant uses published material linked to currently verified sources; it shows source metadata, refuses eligibility, timeline, shortcut and child-contact questions, and says when it cannot answer reliably. Without a Gemini key it shows curated text and labels that mode. Demo reference content is explicitly marked as not independently verified.
- Admins manage public content only and have no read path to users' notes, checklists or reminders.
- Seed sources use only real official URLs, with section/page references left blank and every entry marked as needing admin verification.
- Before production: obtain legal review (DPDP Act 2023), verify all content against live official sources, and complete a security review.
