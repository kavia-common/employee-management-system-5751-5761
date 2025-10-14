import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAppContext } from '../hooks/useAppContext';

/**
 * Login.jsx
 * Simple non-auth login form for stub/demo flows.
 * - Does NOT call any API or store tokens.
 * - On submit, sets a display name in AppContext and navigates to /employees.
 *
 * Security notes:
 * - No passwords persist or are logged.
 * - Inputs are minimally validated client-side for basic UX.
 */

// PUBLIC_INTERFACE
export default function Login() {
  const navigate = useNavigate();
  const { session, setDisplayName } = useAppContext();

  // Hooks must be called unconditionally at the top of the component
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // If already "logged in" (stub), redirect away
  if (session?.displayName) {
    return <Navigate to="/employees" replace />;
  }

  function validate(data) {
    const errs = {};
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = 'Enter a valid email.';
    }
    // Password is optional in stub; if provided, require a minimum length for UX consistency
    if (data.password && data.password.length < 4) {
      errs.password = 'Use at least 4 characters.';
    }
    return errs;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: '' }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      // Derive a friendly display name from the email local part
      const localPart = form.email.split('@')[0] || '';
      const displayName =
        localPart
          .split(/[._-]+/)
          .filter(Boolean)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ') || 'User';

      setDisplayName(displayName);
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
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label="Login Form"
        className="form-card"
      >
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password (not validated in stub)</label>
          <input
            id="password"
            name="password"
            value={form.password}
            onChange={onChange}
            type="password"
            autoComplete="current-password"
          />
          {errors.password && (
            <div className="form-error">{errors.password}</div>
          )}
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Continuing...' : 'Continue'}
          </Button>
        </div>

        <p className="help-text" style={{ marginTop: 12 }}>
          This is a demo-only login. No credentials are sent and no token is stored.
        </p>
      </form>
    </div>
  );
}
