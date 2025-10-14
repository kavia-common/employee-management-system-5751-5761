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
    const result = await authApi.login(email, password);
    if (result?.error) {
      return result;
    }
    const { token: newToken, user: newUser } = result || {};
    if (!newToken) {
      return { error: { code: 'INVALID_RESPONSE', message: 'Authentication response missing token.' } };
    }
    // Persist without logging sensitive data
    localStorage.setItem('auth_token', newToken);
    if (newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser || null);
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
    // Optional: directly log in after signup if backend returns token
    if (result?.token) {
      localStorage.setItem('auth_token', result.token);
      if (result?.user) {
        localStorage.setItem('auth_user', JSON.stringify(result.user));
      }
      setToken(result.token);
      setUser(result.user || null);
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
