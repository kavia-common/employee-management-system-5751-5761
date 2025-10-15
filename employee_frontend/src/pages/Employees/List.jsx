import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { listEmployees, deleteEmployee } from '../../api/employeeApi';

const PAGE_SIZE = 10;

// PUBLIC_INTERFACE
export default function EmployeesList() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({
    items: [],
    page: Number(params.get('page') || 1),
    total: 0,
    pages: 1,
    loading: false,
    error: null,
    search: params.get('search') || '',
  });

  const fetchData = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await listEmployees({
      page: state.page,
      pageSize: PAGE_SIZE,
      search: state.search.trim(),
    });
    if (result?.error) {
      setState((s) => ({ ...s, loading: false, error: result.error.message }));
      return;
    }
    const items = result?.items || [];
    const total = typeof result?.total === 'number' ? result.total : items.length;
    const pages = typeof result?.pages === 'number' ? result.pages : Math.max(1, Math.ceil(total / PAGE_SIZE));
    setState((s) => ({ ...s, items, total, pages, loading: false }));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page]);

  const onSearch = (e) => {
    e.preventDefault();
    setParams({ page: '1', search: state.search });
    setState((s) => ({ ...s, page: 1 }), fetchData());
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;
    const res = await deleteEmployee(id);
    if (res?.error) {
      alert(res.error.message || 'Delete failed'); // non-PII, simple UX
      return;
    }
    fetchData();
  };

  const totalPages = Math.max(1, Number(state.pages) || 1);

  return (
    <div>
      <div className="space-between" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Employees</h1>
        <Link to="/employees/new">
          <Button ariaLabel="Create Employee">New Employee</Button>
        </Link>
      </div>

      <form onSubmit={onSearch} className="row" aria-label="Employee Search" style={{ marginBottom: 12 }}>
        <input
          name="search"
          value={state.search}
          onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
          placeholder="Search by name or email"
          aria-label="Search employees"
          style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', flex: 1 }}
        />
        <Button type="submit" variant="secondary" ariaLabel="Search Employees">Search</Button>
      </form>

      {state.error && <div className="form-error" role="alert">{state.error}</div>}

      {state.loading ? (
        <p className="help-text">Loading...</p>
      ) : (
        <>
          <table className="table" aria-label="Employees Table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.items?.length === 0 && (
                <tr>
                  <td colSpan={4} className="help-text">No employees found.</td>
                </tr>
              )}
              {state.items?.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <Link to={`/employees/${emp.id}`}>{emp.name}</Link>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.department || '-'}</td>
                  <td className="row">
                    <Link to={`/employees/${emp.id}/edit`} aria-label={`Edit ${emp.name}`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <Button variant="danger" onClick={() => onDelete(emp.id)} ariaLabel={`Delete ${emp.name}`}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="row" style={{ marginTop: 12 }}>
            <Button
              variant="secondary"
              onClick={() => setState((s) => ({ ...s, page: Math.max(1, s.page - 1) }))}
              disabled={state.page <= 1}
              ariaLabel="Previous Page"
            >
              Previous
            </Button>
            <span className="help-text" aria-live="polite" style={{ minWidth: 120, textAlign: 'center' }}>
              Page {state.page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setState((s) => ({ ...s, page: Math.min(totalPages, s.page + 1) }))}
              disabled={state.page >= totalPages}
              ariaLabel="Next Page"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
