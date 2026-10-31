import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { initializeAnalyticsForStoredConsent } from './lib/firebase/analytics';
import './index.css';

void initializeAnalyticsForStoredConsent().catch(() => {
  console.warn('Firebase Analytics is unavailable; the application will continue without it.');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);
