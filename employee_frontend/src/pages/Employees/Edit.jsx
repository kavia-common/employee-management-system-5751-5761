import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
export default function EmployeeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', department: '', role: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await employeeApi.getEmployee(id);
      if (!active) return;
      if (res?.error) {
        setApiError(res.error.message);
      } else {
        setForm({
          name: res?.name || '',
          email: res?.email || '',
          department: res?.department || '',
          role: res?.role || '',
        });
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [id]);

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

    setSaving(true);
    const res = await employeeApi.updateEmployee(id, form);
    setSaving(false);
    if (res?.error) {
      setApiError(res.error.message || 'Update failed.');
      return;
    }
    navigate(`/employees/${id}`, { replace: true });
  };

  if (loading) return <p className="help-text">Loading...</p>;

  return (
    <div>
      <h1>Edit Employee</h1>
      {apiError && <div className="form-error" role="alert">{apiError}</div>}
      <form onSubmit={onSubmit} noValidate aria-label="Edit Employee Form" className="form-card" style={{ maxWidth: 560, marginLeft: 0 }}>
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
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
