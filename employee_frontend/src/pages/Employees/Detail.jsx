import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEmployee } from '../../api/employeeApi';
import Button from '../../components/common/Button';

// PUBLIC_INTERFACE
export default function EmployeeDetail() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await getEmployee(id);
      if (!active) return;
      if (res?.error) setError(res.error.message);
      else setEmp(res);
    }
    load();
    return () => { active = false; };
  }, [id]);

  if (error) return <div className="form-error" role="alert">{error}</div>;
  if (!emp) return <p className="help-text">Loading...</p>;

  return (
    <div>
      <div className="space-between">
        <h1>Employee Detail</h1>
        <Link to={`/employees/${emp.id}/edit`}>
          <Button variant="secondary">Edit</Button>
        </Link>
      </div>
      <div className="form-card" style={{ maxWidth: 560, marginLeft: 0 }}>
        <div className="space-between"><span>Name</span><strong>{emp.name}</strong></div>
        <div className="space-between"><span>Email</span><strong>{emp.email}</strong></div>
        <div className="space-between"><span>Department</span><strong>{emp.department || '-'}</strong></div>
        <div className="space-between"><span>Role</span><strong>{emp.role || '-'}</strong></div>
      </div>
    </div>
  );
}
