import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import * as employeeApi from '../../api/employeeApi';

function validate(form) {
  const errs = {};
  if (!form.name || form.name.length < 2) errs.name = 'Name is required.';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required.';
  if (!form.department) errs.department = 'Department is required.';
  return errs;
}

// PUBLIC_INTERFACE
export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', department: '', role: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const res = await employeeApi.createEmployee(form);
    setSubmitting(false);
    if (res?.error) {
      setApiError(res.error.message || 'Create failed.');
      return;
    }
    const id = res?.id || res?.data?.id;
    navigate(id ? `/employees/${id}` : '/employees', { replace: true });
  };

  return (
    <div>
      <h1>Create Employee</h1>
      {apiError && <div className="form-error" role="alert">{apiError}</div>}
      <form onSubmit={onSubmit} noValidate aria-label="Create Employee Form" className="form-card" style={{ maxWidth: 560, marginLeft: 0 }}>
        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" value={form.email} onChange={onChange} required />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="department">Department</label>
          <input id="department" name="department" value={form.department} onChange={onChange} required />
          {errors.department && <div className="form-error">{errors.department}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="role">Role</label>
          <input id="role" name="role" value={form.role} onChange={onChange} />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </div>
  );
}
