import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Keep the user signed in across tabs and refreshes
export function initAuthPersistence() {
  return setPersistence(auth, browserLocalPersistence);
}

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const staffRef = doc(db, 'staff', user.uid);
  const staffSnap = await getDoc(staffRef);
  if (!staffSnap.exists()) {
    await firebaseSignOut(auth);
    throw new Error('Access denied. You are not registered as staff.');
  }
  return { user, role: staffSnap.data().role || 'staff' };
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
