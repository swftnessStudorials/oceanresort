import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToAuth, initAuthPersistence, signOut as firebaseSignOut } from '../firebase/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUserFromLogin = useCallback((firebaseUser) => {
    setUser(firebaseUser || null);
  }, []);

  const logout = useCallback(async () => {
    // Clear UI state immediately so protected routes redirect right away.
    setUser(null);
    setLoading(false);
    try {
      await firebaseSignOut();
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = null;
    let active = true;

    (async () => {
      try {
        await initAuthPersistence();
      } catch (e) {
        console.error('Failed to initialize auth persistence:', e);
      }

      if (!active) return;
      unsubscribe = subscribeToAuth((firebaseUser) => {
        if (!active) return;
        setUser(firebaseUser || null);
        setLoading(false);
      });
    })();

    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    setUserFromLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
