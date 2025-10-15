import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

/**
 * Login.jsx
 * Real login form that calls POST /auth/login, stores JWT, and redirects to the requested route.
 * 
 * Validation:
 * - Email must be non-empty and a valid format
 * - Password must be at least 8 characters (basic check)
 * 
 * Security:
 * - Never logs credentials or tokens
 */

// PUBLIC_INTERFACE
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errs = {};
    const email = (form.email || '').toString().trim();
    const password = (form.password || '').toString();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters.';
    return errs;
    };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: '' }));
    setApiError(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await login(form.email, form.password);

      const fromPath = location?.state?.from?.pathname;
      const target =
        typeof fromPath === 'string' && fromPath.startsWith('/') && fromPath !== '/login'
          ? fromPath
          : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      const msg = (err && err.message) || 'Login failed.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {apiError && <div className="form-error" role="alert">{apiError}</div>}

      <form onSubmit={onSubmit} noValidate aria-label="Login Form" className="form-card">
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
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
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <span className="help-text">No account?</span>
          <Link className="help-text" to="/signup" aria-label="Sign up link">
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
}
