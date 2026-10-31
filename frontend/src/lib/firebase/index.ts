export { getFirebaseApp } from './app';
export {
  configureAuthPersistence,
  getAuthErrorMessage,
  getCurrentUser,
  getCurrentUserIdToken,
  getGoogleRedirectResult,
  getFirebaseAuth,
  observeAuthState,
  resetPassword,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
} from './auth';
export { firebaseConfigured, firebaseConfig, missingFirebaseConfig } from './config';
export { getFirebaseFirestore } from './firestore';
