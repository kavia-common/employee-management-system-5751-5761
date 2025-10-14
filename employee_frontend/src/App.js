/**
 * App.js
 * Application entry that wires AuthProvider and AppRouter and applies the Executive Gray theme.
 * This file focuses on shell-only concerns; routing and business pages are isolated in routes/pages.
 */

import React, { useEffect } from 'react';
import './App.css';
import './theme/styles.css';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';

// PUBLIC_INTERFACE
function App() {
  // Persist theme to root for CSS variables; default to light
  useEffect(() => {
    const preferred = localStorage.getItem('ui_theme') || 'light';
    document.documentElement.setAttribute('data-theme', preferred);
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </div>
  );
}

export default App;
