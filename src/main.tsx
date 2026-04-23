import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker and handle updates gracefully
registerSW({
  onNeedRefresh() {
    // New content available, could show a toast here
    console.log('[SW] New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('[SW] App is ready to work offline!');
  },
  onRegistered(swRegistration) {
    console.log('[SW] Service Worker registered:', swRegistration);
  },
  onRegisterError(error) {
    console.error('[SW] Service Worker registration error:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
