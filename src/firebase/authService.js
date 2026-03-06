import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

let persistenceInitPromise = null;

// Keep the user signed in across tabs and refreshes.
export function initAuthPersistence() {
  if (!persistenceInitPromise) {
    persistenceInitPromise = setPersistence(auth, browserLocalPersistence).catch((err) => {
      persistenceInitPromise = null;
      throw err;
    });
  }
  return persistenceInitPromise;
}

export async function login(email, password) {
  await initAuthPersistence();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Make sure token is available before first protected Firestore read.
  await user.getIdToken();

  // Staff lookup is optional; do not force logout if the document
  // is missing or temporarily unreadable, otherwise login may appear
  // successful and then immediately sign out.
  try {
    const staffRef = doc(db, 'staff', user.uid);
    const staffSnap = await getDoc(staffRef);
    if (staffSnap.exists()) {
      return { user, role: staffSnap.data().role || 'staff' };
    }
  } catch (err) {
    console.warn('Staff lookup skipped:', err?.code || err?.message || err);
  }

  return { user, role: 'staff' };
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
