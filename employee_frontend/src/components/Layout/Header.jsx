import React from 'react';
import Button from '../common/Button';
import { useAppContext } from '../../hooks/useAppContext';

export default function Header() {
  const { theme, toggleTheme } = useAppContext();

  return (
    <header className="header" role="banner" aria-label="Application Header">
      <div className="row">
        <span aria-label="App Name" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          Employee Management
        </span>
        <span className="badge">Executive Gray</span>
      </div>
      <div className="row" aria-label="App Actions">
        <span aria-label="Mode" className="help-text">
          Stub Mode · Theme: {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
        <Button variant="secondary" onClick={toggleTheme} ariaLabel="Toggle Theme">
          Toggle Theme
        </Button>
      </div>
    </header>
  );
}
