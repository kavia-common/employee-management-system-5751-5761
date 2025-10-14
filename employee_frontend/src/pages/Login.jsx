import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

// PUBLIC_INTERFACE
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const errs = {};
    if (!validateEmail(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result?.error) {
      setApiError(result.error.message || 'Login failed.');
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="form-card" aria-label="Sign In">
      <h1 style={{ marginTop: 0 }}>Sign In</h1>
      <p className="help-text">Access your employee management dashboard.</p>
      {apiError && <div className="form-error" role="alert">{apiError}</div>}
      <form onSubmit={onSubmit} noValidate aria-label="Login Form">
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            data-testid="email-input"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={onChange}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
            required
          />
          {errors.email && <div id="email-error" className="form-error">{errors.email}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            data-testid="password-input"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={onChange}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
            required
          />
          {errors.password && <div id="password-error" className="form-error">{errors.password}</div>}
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
          <Button type="submit" disabled={submitting} ariaLabel="Sign In">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
          <Link to="/signup" aria-label="Go to Signup">Create an account</Link>
        </div>
      </form>
    </div>
  );
}
