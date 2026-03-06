import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Create React App only reads .env when the dev server STARTS. If you change .env, restart: stop the server (Ctrl+C) and run "npm start" again.
// Use the API key from Firebase Console > Project settings > Your apps > Web app (apiKey). Do not use a key from Google Cloud Console unless it is the same key.
const apiKey = (process.env.REACT_APP_FIREBASE_API_KEY || '').trim();
const authDomain = (process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '').trim();
const projectId = (process.env.REACT_APP_FIREBASE_PROJECT_ID || '').trim();

const isConfigured = apiKey && apiKey.length > 10 && !apiKey.includes('YOUR_API');
if (process.env.NODE_ENV === 'development') {
  if (!isConfigured) {
    console.warn(
      '[Ocean View Resort] Firebase env vars not loaded (apiKey length:', apiKey.length, '). Restart the dev server (Ctrl+C, then "npm start"). Ensure .env is in the project root (same folder as package.json) and saved as UTF-8 without BOM.'
    );
  } else {
    console.info('[Ocean View Resort] Firebase config loaded (apiKey length:', apiKey.length, '). If login still fails, check API key restrictions in Google Cloud Console.');
  }
}

const firebaseConfig = {
  apiKey: apiKey || 'dummy-key-avoid-undefined',
  authDomain: authDomain || 'dummy.firebaseapp.com',
  projectId: projectId || 'dummy-project',
  storageBucket: (process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com').trim(),
  messagingSenderId: (process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '0').trim(),
  appId: (process.env.REACT_APP_FIREBASE_APP_ID || 'dummy-app-id').trim(),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
