import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAppContext } from '../hooks/useAppContext';

/**
 * Login.jsx
 * Simple non-auth login form that accepts any credentials.
 * - Does NOT call any API or store tokens.
 * - On submit, sets a display name in AppContext and navigates to /employees.
 *
 * Security notes:
 * - No passwords persist or are logged.
 * - Inputs are accepted without validation to simplify demo flow.
 */

// PUBLIC_INTERFACE
export default function Login() {
  const navigate = useNavigate();
  const { session, setSession } = useAppContext();

  // Accept any input; no validation errors or API calls
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  // If already "logged in" (stub), redirect away
  if (session?.displayName) {
    return <Navigate to="/employees" replace />;
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
      navigate('/employees', { replace: true });
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
