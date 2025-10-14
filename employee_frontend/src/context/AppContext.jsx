/**
 * AppContext.jsx
 * Minimal application context for pure stub mode.
 * - Holds UI theme (light/dark) and exposes toggle/set methods.
 * - Provides a "stub session" with a displayName after demo login (no tokens).
 */

import React, { createContext, useCallback, useMemo, useState } from 'react';

const DEFAULT_SESSION = Object.freeze({ displayName: null });

const AppContext = createContext({
  theme: 'light',
  session: DEFAULT_SESSION,
  // methods
  setTheme: (_next) => {},
  toggleTheme: () => {},
  setDisplayName: (_name) => {},
  clearSession: () => {},
});

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  /**
   * Theme state: persisted to localStorage for user preference across sessions.
   * Defaults to 'light' if not previously set.
   */
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('ui_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  /**
   * Stub session: contains only a displayName for demo purposes.
   * Persist to localStorage to survive reloads; no tokens are stored.
   */
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem('stub_session');
      if (!raw) return DEFAULT_SESSION;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return DEFAULT_SESSION;
      return {
        displayName:
          typeof parsed.displayName === 'string' && parsed.displayName.trim()
            ? parsed.displayName.trim()
            : null,
      };
    } catch {
      return DEFAULT_SESSION;
    }
  });

  const setTheme = useCallback((next) => {
    const value = next === 'dark' ? 'dark' : 'light';
    try {
      localStorage.setItem('ui_theme', value);
    } catch {
      // ignore storage errors (e.g., privacy mode)
    }
    document.documentElement.setAttribute('data-theme', value);
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  /**
   * Set display name for stub session; persists to localStorage.
   */
  const setDisplayName = useCallback((name) => {
    const displayName = (name || '').toString().trim() || null;
    const next = { displayName };
    setSession(next);
    try {
      localStorage.setItem('stub_session', JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  }, []);

  /**
   * Clear stub session info.
   */
  const clearSession = useCallback(() => {
    setSession(DEFAULT_SESSION);
    try {
      localStorage.removeItem('stub_session');
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, session, setDisplayName, clearSession }),
    [theme, setTheme, toggleTheme, session, setDisplayName, clearSession]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
