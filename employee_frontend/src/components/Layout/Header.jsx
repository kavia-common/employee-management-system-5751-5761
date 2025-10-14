import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function Header() {
  const { user, logout } = useAuth();

  const onLogout = () => {
    try {
      logout();
      // Avoid logging PII and avoid console in production
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'INFO', message: 'user_logout' }));
      }
      window.location.assign('/login');
    } catch {
      // swallow
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
      <div className="row" aria-label="User Actions">
        <span aria-label="Current User" className="help-text">
          {user?.name ? `Hi, ${user.name}` : 'Signed in'}
        </span>
        <Button variant="secondary" onClick={onLogout} ariaLabel="Logout">
          Logout
        </Button>
      </div>
    </header>
  );
}
