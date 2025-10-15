import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { useAppContext } from '../../hooks/useAppContext';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppContext();
  const { isAuthenticated, user, logout } = useAuth();

  const displayName = (user?.full_name || '').toString().trim() || (user?.email || '').toString().trim() || null;

  const onSignOut = () => {
    try {
      logout();
    } catch {
      // ignore
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="header" role="banner" aria-label="Application Header">
      <div className="row">
        <span aria-label="App Name" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          Employee Management
        </span>
        <span className="badge">Executive Gray</span>
      </div>
      <div className="row" aria-label="App Actions" style={{ gap: 12 }}>
        <span aria-label="Theme" className="help-text">
          Theme: {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
        <Button variant="secondary" onClick={toggleTheme} ariaLabel="Toggle Theme">
          Toggle Theme
        </Button>
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="help-text" aria-label="Login">Login</Link>
            <span className="help-text" aria-hidden="true">|</span>
            <Link to="/signup" className="help-text" aria-label="Signup">Signup</Link>
          </>
        ) : (
          <>
            <span className="help-text" aria-label="Greeting">
              {displayName ? `Hello, ${displayName}` : 'Signed in'}
            </span>
            <Button variant="secondary" onClick={onSignOut} ariaLabel="Sign out">
              Sign out
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
