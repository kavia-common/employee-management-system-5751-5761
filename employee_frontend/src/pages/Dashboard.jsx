import React, { useEffect, useState } from 'react';
import * as mockApi from '../services/mockApi';

// PUBLIC_INTERFACE
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      // Compute from mock store/endpoints in pure stub mode
      const s = await mockApi.getSummary();
      const d = await mockApi.getDepartmentStats();
      if (!active) return;
      if (s?.error) setError(s.error.message);
      else setSummary(s || {});
      if (d?.error) setError((prev) => prev || d.error.message);
      else setDeptStats(Array.isArray(d) ? d : (d?.items || []));
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="row" style={{ gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <div className="form-card" style={{ minWidth: 260 }}>
          <h3 style={{ marginTop: 0 }}>Summary</h3>
          <p className="help-text">High-level overview</p>
          <div className="space-between">
            <span>Total Employees</span>
            <strong>{summary?.total_employees ?? '-'}</strong>
          </div>
          <div className="space-between">
            <span>Active</span>
            <strong>{summary?.active_employees ?? '-'}</strong>
          </div>
        </div>

        <div className="form-card" style={{ minWidth: 320 }}>
          <h3 style={{ marginTop: 0 }}>By Department</h3>
          <table className="table" aria-label="Department Stats">
            <thead>
              <tr>
                <th>Department</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {deptStats?.length === 0 && (
                <tr>
                  <td colSpan={2} className="help-text">No data available.</td>
                </tr>
              )}
              {deptStats?.map((row) => (
                <tr key={row.department}>
                  <td>{row.department}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
