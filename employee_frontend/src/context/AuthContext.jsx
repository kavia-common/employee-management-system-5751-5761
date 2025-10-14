import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import { setLogoutHandler } from './authEvents';

/**
 * AuthContext exposes authentication state and actions.
 * It stores JWT and user in localStorage and ensures secure usage by never logging PII.
 */

const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  user: null,
  // methods
  login: async (_email, _password) => {},
  signup: async (_payload) => {},
  logout: () => {},
});

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    // Never log tokens; do not log PII.
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Register logout handler used by API client on 401 responses
    setLogoutHandler(() => logout);
  }, [logout]);

  // PUBLIC_INTERFACE
  const login = useCallback(async (email, password) => {
    // Basic validation (client-side)
    if (!email || !password) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } };
    }

    // Use the authApi which normalizes the backend login response
    const result = await authApi.login(email, password);
    if (result?.error) {
      // Pass through API-provided error (e.g., invalid credentials) or our normalized errors
      return result;
    }

    // Expect { access_token, token_type?, user? }
    const accessToken = result?.access_token;
    const nextUser = result?.user || null;
    if (!accessToken) {
      // Defensive check (should be handled by authApi already)
      return { error: { code: 'INVALID_RESPONSE', message: 'Login failed: missing token from server.' } };
    }

    // Persist without logging sensitive data
    try {
      localStorage.setItem('auth_token', accessToken);
      if (nextUser) {
        localStorage.setItem('auth_user', JSON.stringify(nextUser));
      }
    } catch {
      // Storage may be blocked (e.g., privacy settings). Continue with in-memory token for the session.
    }

    setToken(accessToken);
    setUser(nextUser);
    return { success: true };
  }, []);

  // PUBLIC_INTERFACE
  const signup = useCallback(async (payload) => {
    const { email, password } = payload || {};
    if (!email || !password) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } };
    }
    const result = await authApi.signup(payload);
    if (result?.error) {
      return result;
    }
    // Optional: directly log in after signup if backend returns token-like structure
    const accessToken = result?.access_token || result?.token;
    if (accessToken) {
      try {
        localStorage.setItem('auth_token', accessToken);
        if (result?.user) {
          localStorage.setItem('auth_user', JSON.stringify(result.user));
        }
      } catch {
        // ignore storage errors
      }
      setToken(accessToken);
      setUser(result?.user || null);
      return { success: true };
    }
    return { success: true };
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, token, user, login, signup, logout }),
    [isAuthenticated, token, user, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
