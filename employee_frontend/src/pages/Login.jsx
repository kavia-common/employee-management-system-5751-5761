import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAppContext } from '../hooks/useAppContext';

/**
 * Login.jsx
 * Simple non-auth login form that accepts any credentials.
 * - Does NOT call any API or store tokens.
 * - On submit, sets a display name in AppContext and navigates to the original protected route
 *   (from location.state.from) or to /dashboard by default.
 *
 * Security notes:
 * - No passwords persist or are logged.
 * - Inputs are accepted without validation to simplify demo flow.
 */

// PUBLIC_INTERFACE
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSession } = useAppContext();

  // Accept any input; no validation errors or API calls
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  // If already "logged in" (stub), redirect away to the dashboard
  if (session?.displayName) {
    return <Navigate to="/dashboard" replace />;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Derive a friendly display name from the email local part; fallback to "User"
      const localPart = (form.email || '').split('@')[0] || '';
      const displayName =
        localPart
          .split(/[._-]+/)
          .filter(Boolean)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ') || 'User';

      setSession({ displayName });

      // Redirect to the originally requested path if available (and not /login), else /dashboard
      const fromPath = location?.state?.from?.pathname;
      const target =
        typeof fromPath === 'string' && fromPath.startsWith('/') && fromPath !== '/login'
          ? fromPath
          : '/dashboard';

      navigate(target, { replace: true });
    } catch {
      // No-op; in stub we do not show API errors
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={onSubmit} noValidate aria-label="Login Form" className="form-card">
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            autoComplete="current-password"
          />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Continuing...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
