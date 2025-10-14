 /** 
  * AppContext.jsx
  * Minimal application context for pure stub mode.
  * - Holds UI theme (light/dark) and exposes toggle/set methods.
  * - Provides a simple "session" with a displayName after demo login (no tokens).
  * - Exposes setSession/clearSession as public interface for Login and Header components.
  *
  * Security:
  * - No tokens, credentials, or PII are logged or persisted beyond displayName.
  */
 
 import React, { createContext, useCallback, useMemo, useState } from 'react';
 
 const DEFAULT_SESSION = Object.freeze({ displayName: null });
 
 const AppContext = createContext({
   theme: 'light',
   session: DEFAULT_SESSION,
   // methods (no-ops by default)
   setTheme: (_next) => {},
   toggleTheme: () => {},
   setSession: (_s) => {},
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
   const [session, setSessionState] = useState(() => {
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
    * Persist session helper.
    */
   const persistSession = useCallback((next) => {
     try {
       localStorage.setItem('stub_session', JSON.stringify(next));
     } catch {
       // ignore storage failures
     }
   }, []);
 
   /**
    * PUBLIC: Set session object (only accepts displayName).
    * - Sanitizes displayName to string or null.
    * - Persists to localStorage.
    */
   const setSession = useCallback(
     (value) => {
       const nameRaw = value && typeof value === 'object' ? value.displayName : null;
       const displayName = (nameRaw || '').toString().trim() || null;
       const next = { displayName };
       setSessionState(next);
       persistSession(next);
     },
     [persistSession]
   );
 
   /**
    * PUBLIC: Set display name for stub session; persists to localStorage.
    * Kept for backward compatibility; delegates to setSession.
    */
   const setDisplayName = useCallback(
     (name) => {
       setSession({ displayName: name });
     },
     [setSession]
   );
 
   /**
    * PUBLIC: Clear stub session info.
    */
   const clearSession = useCallback(() => {
     setSessionState(DEFAULT_SESSION);
     try {
       localStorage.removeItem('stub_session');
     } catch {
       // ignore
     }
   }, []);
 
   const value = useMemo(
     () => ({
       theme,
       setTheme,
       toggleTheme,
       session,
       setSession,
       setDisplayName,
       clearSession,
     }),
     [theme, setTheme, toggleTheme, session, setSession, setDisplayName, clearSession]
   );
 
   return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
 }
 
 export default AppContext;
