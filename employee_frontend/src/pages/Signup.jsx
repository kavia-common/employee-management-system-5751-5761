import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

// PUBLIC_INTERFACE
export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!validateEmail(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const result = await signup({ name: form.name, email: form.email, password: form.password });
    setSubmitting(false);
    if (result?.error) {
      setApiError(result.error.message || 'Signup failed.');
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="form-card" aria-label="Create Account">
      <h1 style={{ marginTop: 0 }}>Create Account</h1>
      <p className="help-text">Start managing your employees efficiently.</p>
      {apiError && <div className="form-error" role="alert">{apiError}</div>}

      <form onSubmit={onSubmit} noValidate aria-label="Signup Form">
        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={onChange}
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
            required
          />
          {errors.name && <div id="name-error" className="form-error">{errors.name}</div>}
        </div>

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
            autoComplete="new-password"
            value={form.password}
            onChange={onChange}
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
            required
          />
          {errors.password && <div id="password-error" className="form-error">{errors.password}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={onChange}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby="confirmPassword-error"
            required
          />
          {errors.confirmPassword && <div id="confirmPassword-error" className="form-error">{errors.confirmPassword}</div>}
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
          <Button type="submit" disabled={submitting} ariaLabel="Create Account">
            {submitting ? 'Creating...' : 'Create Account'}
          </Button>
          <Link to="/login" aria-label="Go to Sign In">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
