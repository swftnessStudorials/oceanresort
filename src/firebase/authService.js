const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
const SESSION_KEY = 'ovr_session';

const listeners = new Set();

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function emitAuth() {
  const user = readSession()?.user || null;
  listeners.forEach((cb) => cb(user));
}

export function getAuthToken() {
  return readSession()?.token || null;
}

export function initAuthPersistence() {
  return Promise.resolve();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || 'Login failed. Please try again.');
    if (res.status === 401) err.code = 'auth/invalid-credential';
    throw err;
  }

  const data = await res.json();
  const session = {
    token: data.token,
    user: data.user,
    savedAt: Date.now(),
  };
  writeSession(session);
  emitAuth();
  return { user: data.user, role: data.user?.role || 'staff' };
}

export async function signOut() {
  clearSession();
  emitAuth();
}

export function subscribeToAuth(callback) {
  callback(readSession()?.user || null);
  listeners.add(callback);
  const storageListener = (e) => {
    if (e.key === SESSION_KEY) callback(readSession()?.user || null);
  };
  window.addEventListener('storage', storageListener);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', storageListener);
  };
}
