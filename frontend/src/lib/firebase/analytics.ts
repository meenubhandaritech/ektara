import { getAnalytics, isSupported, logEvent, setConsent, type Analytics } from 'firebase/analytics';
import { getFirebaseApp } from './app';
import { firebaseConfig } from './config';

const CONSENT_KEY = 'ektara-analytics-consent';
let analyticsInstance: Analytics | undefined;

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

export async function analyticsIsSupported(): Promise<boolean> {
  return isSupported();
}

export async function setAnalyticsConsent(consented: boolean): Promise<boolean> {
  if (!consented) {
    localStorage.setItem(CONSENT_KEY, 'denied');
    if (analyticsInstance) setConsent({ analytics_storage: 'denied' });
    return true;
  }

  if (!firebaseConfig.measurementId || !(await isSupported())) return false;

  try {
    localStorage.setItem(CONSENT_KEY, 'granted');
    analyticsInstance = getAnalytics(getFirebaseApp());
    setConsent({ analytics_storage: 'granted' });
    logEvent(analyticsInstance, 'app_opened');
    return true;
  } catch (error) {
    localStorage.removeItem(CONSENT_KEY);
    throw error;
  }
}

export async function initializeAnalyticsForStoredConsent(): Promise<void> {
  if (hasAnalyticsConsent()) await setAnalyticsConsent(true);
}
