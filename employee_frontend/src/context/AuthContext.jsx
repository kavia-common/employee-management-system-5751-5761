 /**
  * AuthContext.jsx
  * Authentication context for managing JWT token, current user, and auth flows.
  * 
  * Exposes:
  * - isAuthenticated: boolean
  * - isInitializing: boolean (initial token->/auth/me check)
  * - user: current authenticated user (or null)
  * - login(email, password): Promise<void>
  * - signup({ email, password, full_name }): Promise<void>
  * - logout(): void
  * 
  * Security:
  * - Never logs or exposes tokens
  * - Stores token in localStorage (if allowed) and memory
  */

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { clearAccessToken, getAccessToken, setAccessToken } from '../api/token';

// Define a noop default to avoid undefined checks in consumers
const AuthContext = createContext({
  isAuthenticated: false,
  isInitializing: true,
  user: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  signup: async () => {},
  logout: () => {},
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provider component responsible for:
   * - Hydrating token from storage
   * - Validating token by calling /auth/me
   * - Managing user state across the app
   * - Reacting to unauthorized events emitted by axios interceptor
   */
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Helper: clear all auth state safely
  const clearAuth = useCallback(() => {
    try {
      clearAccessToken();
    } catch {
      // ignore storage errors
    }
    setToken(null);
    setUser(null);
  }, []);

  // Listen for unauthorized events from axios interceptor to auto-logout
  useEffect(() => {
    function onUnauthorized() {
      clearAuth();
    }
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [clearAuth]);

  // On mount: if we have a token, validate by calling /auth/me
  useEffect(() => {
    let active = true;

    async function initialize() {
      const existing = getAccessToken();
      if (!existing) {
        setIsInitializing(false);
        return;
      }
      const profile = await authApi.me();
      if (!active) return;
      if (profile?.error) {
        // Token invalid or expired
        clearAuth();
      } else {
        setUser(profile);
        setToken(existing);
      }
      setIsInitializing(false);
    }

    initialize();
    return () => {
      active = false;
    };
  }, [clearAuth]);

  // PUBLIC: login
  const login = useCallback(async (email, password) => {
    // Validate inputs to avoid unnecessary requests
    const emailStr = (email || '').toString().trim();
    const passwordStr = (password || '').toString();
    if (!emailStr || !passwordStr) {
      throw new Error('Email and password are required.');
    }
    const res = await authApi.login(emailStr, passwordStr);
    if (res?.error) {
      throw new Error(res.error.message || 'Login failed.');
    }
    const accessToken = res?.access_token;
    if (!accessToken) {
      throw new Error('Login succeeded but token was missing. Please try again or contact support.');
    }

    // Persist token
    setAccessToken(accessToken);
    setToken(accessToken);

    // Load user profile
    const profile = await authApi.me();
    if (profile?.error) {
      // If failed to load profile, clear token and show a friendly error
      clearAuth();
      throw new Error(profile.error.message || 'Unable to load user profile.');
    }
    setUser(profile);
  }, [clearAuth]);

  // PUBLIC: signup
  const signup = useCallback(async ({ email, password, full_name }) => {
    const emailStr = (email || '').toString().trim();
    const passwordStr = (password || '').toString();
    const fullNameStr = (full_name || '').toString().trim() || null;
    if (!emailStr || !passwordStr) {
      throw new Error('Email and password are required.');
    }

    const res = await authApi.signup({ email: emailStr, password: passwordStr, full_name: fullNameStr });
    if (res?.error) {
      throw new Error(res.error.message || 'Signup failed.');
    }
    // Do not auto-login after signup; require explicit login
    return res;
  }, []);

  // PUBLIC: logout
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token) && Boolean(user),
      isInitializing,
      user,
      login,
      signup,
      logout,
    }),
    [isInitializing, login, logout, signup, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
