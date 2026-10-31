# Firebase setup

The local frontend configuration targets Firebase project `ektara-507fd`. Demo mode remains enabled by default. This environment has no Firebase Admin credentials or project IAM permission to deploy rules. A real two-account test also found the currently deployed Firestore rules do not enforce user isolation; production is unsafe until the reviewed rules deploy and the test passes.

## 1. Firebase project and providers

The project is `ektara-507fd`. In the [Firebase Console](https://console.firebase.google.com/), verify that **Google** and **Email/Password** are enabled under **Authentication → Sign-in method**. The public Auth metadata endpoint currently lists `localhost`, `ektara-507fd.firebaseapp.com`, and `ektara-507fd.web.app` as authorized domains, but does not expose provider state.

## 2. Firestore

Cloud Firestore is enabled for this project. The local rules in `firebase/firestore.rules` restrict private records by authenticated UID. However, the deployed rules currently failed a real cross-account test: a different account could read and overwrite private records, and an unauthenticated query could read a temporary test profile. The reviewed rules deployment was attempted and denied by project IAM (`serviceusage.services.use`). Do not use this project for real private data until the rules are deployed and the isolation tests pass.

## 3. Frontend web configuration

The supplied Firebase Web App values are in the ignored `frontend/.env.local`. Vite reads these on startup; restart the frontend after changing environment values. For another environment, use:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=<Firebase Web API key>
VITE_FIREBASE_AUTH_DOMAIN=ektara-507fd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ektara-507fd
VITE_FIREBASE_STORAGE_BUCKET=<Firebase storage bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<Firebase sender ID>
VITE_FIREBASE_APP_ID=<Firebase Web App ID>
VITE_FIREBASE_MEASUREMENT_ID=<Firebase Analytics measurement ID>
```

The Web API key and other web configuration values identify the Firebase app; they are not backend secrets. Do not put a service-account key or other private credential in any `VITE_` variable. Authentication and Firestore access still depend on verified ID tokens and security rules.

## 4. Configure backend Admin SDK credentials

No `backend/.env`, Admin service-account values, or Application Default Credentials are present in this checkout. Production requires `FIREBASE_PROJECT_ID` and either a complete service-account pair or valid Application Default Credentials.

For a service account, obtain credentials through an authorized project administrator and store them only in `backend/.env`:

```dotenv
DEMO_MODE=false
FIREBASE_PROJECT_ID=ektara-507fd
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CORS_ORIGIN=http://localhost:5173
```

`FIREBASE_PRIVATE_KEY` may be stored with literal `\n` sequences; the backend converts them to line breaks. Keep `.env` files and downloaded service-account JSON files private. Do not commit them.

Alternatively, use Google Application Default Credentials (ADC), such as a `GOOGLE_APPLICATION_CREDENTIALS` path to an authorized credential file, local gcloud ADC, or the workload identity provided by a Google Cloud runtime. Keep credential files outside the repository. Do not leave a partial service-account pair configured when using ADC.

The backend validates the project ID and presence of a complete credential source at startup when `DEMO_MODE=false`. Missing configuration is an error; it does not switch the server to demo data. Credential validity and project permissions must also be verified by successful authenticated backend requests before production activation.

## 5. Review and publish Firestore rules

The candidate rules are in `firebase/firestore.rules`. Review the complete file, then open Firebase Console → project `ektara-507fd` → Firestore Database → Rules, replace the editor contents with this file, and publish. Confirm the project ID before publishing. This workflow does not use Firebase CLI. Do not publish until an authorized project administrator approves the rules; publishing cannot be verified from this checkout.

The client can access a user's private documents only under that user's UID. Unknown collections and nested user subcollections are denied. Published articles and FAQs are public; official sources are public after verification. Admin/editor access to drafts and content writes is based on verified Firebase custom claims, not a role submitted by the browser. The backend Admin SDK bypasses Firestore rules, so backend authorization and validation remain essential.

## 6. Create the first admin

The first admin must be provisioned from a trusted server-side environment using Firebase Admin SDK credentials. After Admin SDK initialization, an operator with appropriate access can run:

```ts
await getAuth().setCustomUserClaims(uid, { role: 'admin' });
```

Use the UID of an existing Firebase Authentication user. Never expose an endpoint that allows unauthenticated callers to set claims, and never grant admin by editing a Firestore user profile. The user should sign out and back in (or refresh the ID token) before testing admin access. Thereafter, the existing admin role-management API can set supported roles.

## 7. Switch from demo to production

1. Keep `DEMO_MODE=true` in `backend/.env` and `VITE_DEMO_MODE=true` while using the synthetic in-memory demo.
2. Set `DEMO_MODE=false` in `backend/.env` and `VITE_DEMO_MODE=false` in `frontend/.env`.
3. Supply the Firebase web configuration and backend Admin SDK credentials above.
4. Restart the backend and frontend so they load the environment values.
5. Confirm the backend `/api/status` reports `demoMode: false` and `auth: "firebase"`.

The UI will not initialize Firebase authentication in demo mode. The in-memory seed data is separate from Firestore and is never copied to production. Production Firebase errors are reported; there is no success-shaped fallback to demo data.

## 8. Verify the integration

Run the backend and frontend typechecks/builds, then verify:

- The backend starts with `DEMO_MODE=true` and no Firebase credentials.
- The backend refuses to start with `DEMO_MODE=false` and missing Admin SDK credentials.
- With valid project configuration and Admin credentials, registration, Google sign-in, and email/password sign-in work.
- An authenticated ID token reaches the backend and `/api/me` returns the verified UID and claim-derived role.
- A normal account cannot access another user's documents or admin routes.
- An account with a trusted admin claim can access the admin API and manage public content.
- Production API or Firebase failures are shown as errors, not replaced with demo data.

The supplied Web configuration was verified against project `ektara-507fd`. Temporary email/password registration, sign-in, logout, persistent session, and Firestore profile/journey/checklist/reminder/bookmark/note reads and writes were tested and temporary data was cleaned up. Password reset request acceptance was tested, but message delivery was not verified. Google sign-in and Express ID-token verification against a production Admin backend remain unverified. The current backend is in demo mode and rejects Firebase ID tokens. Rules deployment was denied by project IAM, and real cross-account isolation failed against the deployed rules. These blockers must be resolved before setting `DEMO_MODE=false`.

Firebase Analytics is opt-in in the signed-in account privacy preferences. It initializes only after consent and sends a generic `app_opened` event without user data or event parameters. Analytics support can vary by browser.

## Collection ownership

Private records use their authenticated UID in the document path: `users/{uid}`, `journeys/{uid}`, and the user-owned subcollections under `checklists`, `reminders`, `bookmarks`, and `userNotes`. The Express API uses the Firebase Admin SDK-backed store in production; browser API calls send Firebase ID tokens for verification. Public knowledge collections are separate. Admin audit logs are written through the backend Admin SDK and are not client-writable.
