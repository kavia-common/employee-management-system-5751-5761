/**
 * App.js
 * Application entry that wires AppProvider (theme-only) and AppRouter and applies the Executive Gray theme.
 * Authentication is removed in pure stub mode; the UI runs without tokens or env vars.
 */

import React, { useEffect } from 'react';
import './App.css';
import './theme/styles.css';
import { AppProvider } from './context/AppContext';
import AppRouter from './routes/AppRouter';

// PUBLIC_INTERFACE
function App() {
  /** Initialize theme from localStorage on first load (default to 'light'). */
  useEffect(() => {
    try {
      const preferred = localStorage.getItem('ui_theme') || 'light';
      document.documentElement.setAttribute('data-theme', preferred);
    } catch {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <div className="App">
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </div>
  );
}

export default App;
