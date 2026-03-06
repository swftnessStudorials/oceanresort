import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToAuth, initAuthPersistence, signOut as firebaseSignOut } from '../firebase/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);
  const logoutRequestedRef = useRef(false);
  const hasUserRef = useRef(false);

  const setUserFromLogin = useCallback((firebaseUser) => {
    hasUserRef.current = true;
    setUser(firebaseUser);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    logoutRequestedRef.current = true;
    firebaseSignOut();
  }, []);

  useEffect(() => {
    unsubscribeRef.current = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        hasUserRef.current = true;
        logoutRequestedRef.current = false;
        setUser(firebaseUser);
        setLoading(false);
      } else {
        // Only accept "logged out" when user clicked Exit System. Ignore null from token refresh failure.
        if (logoutRequestedRef.current) {
          logoutRequestedRef.current = false;
          hasUserRef.current = false;
          setUser(null);
          setLoading(false);
        } else if (!hasUserRef.current) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    initAuthPersistence();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
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
