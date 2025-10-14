/**
 * AppContext.jsx
 * Minimal application context for pure stub mode.
 * - Holds UI theme only (light/dark) and exposes toggle/set methods.
 * - No authentication logic or user state is present.
 */

import React, { createContext, useCallback, useMemo, useState } from 'react';

const AppContext = createContext({
  theme: 'light',
  // methods
  setTheme: (_next) => {},
  toggleTheme: () => {},
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

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
