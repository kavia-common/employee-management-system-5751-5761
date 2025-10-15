import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

/**
 * Signup.jsx
 * Create a new user account by calling POST /auth/signup.
 * On success, navigates to /login and prompts the user to sign in.
 */

// PUBLIC_INTERFACE
export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

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
    setSuccessMessage(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await signup({ email: form.email, password: form.password, full_name: form.full_name });
      setSuccessMessage('Signup successful! You can now sign in.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 800);
    } catch (err) {
      const msg = (err && err.message) || 'Signup failed.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Signup</h1>
      {successMessage && <div role="status" className="help-text" style={{ color: 'var(--color-success)' }}>{successMessage}</div>}
      {apiError && <div className="form-error" role="alert">{apiError}</div>}

      <form onSubmit={onSubmit} noValidate aria-label="Signup Form" className="form-card">
        <div className="form-field">
          <label htmlFor="full_name">Full Name (optional)</label>
          <input id="full_name" name="full_name" value={form.full_name} onChange={onChange} />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" value={form.email} onChange={onChange} autoComplete="email" aria-invalid={Boolean(errors.email)} />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" value={form.password} onChange={onChange} type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'}
          </Button>
          <span className="help-text">Have an account?</span>
          <Link className="help-text" to="/login" aria-label="Login link">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
