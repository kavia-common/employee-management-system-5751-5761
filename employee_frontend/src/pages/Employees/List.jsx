import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { listEmployees, deleteEmployee } from '../../api/employeeApi';

const PAGE_SIZE = 10;

/**
 * Build next sort value given the current sort and a clicked field.
 * Backend accepts formats like:
 * - 'last_name' (asc)
 * - 'last_name:desc' (desc)
 * We cycle: none -> asc -> desc -> none
 */
function buildNextSort(currentSort, field) {
  const norm = (currentSort || '').toString().trim().toLowerCase();
  const isThisFieldAsc = norm === field.toLowerCase();
  const isThisFieldDesc = norm === `${field.toLowerCase()}:desc` || norm === `-${field.toLowerCase()}`;
  if (!isThisFieldAsc && !isThisFieldDesc) return field; // asc
  if (isThisFieldAsc) return `${field}:desc`; // desc
  return ''; // clear
}

// PUBLIC_INTERFACE
export default function EmployeesList() {
  const [params, setParams] = useSearchParams();

  // Initialize from URL params
  const initialPage = Math.max(1, Number(params.get('page') || 1));
  const initialSearch = params.get('search') || '';
  const initialSort = params.get('sort') || '';

  const [state, setState] = useState({
    items: [],
    page: initialPage,
    total: 0,
    pages: 1,
    loading: false,
    error: null,
    search: initialSearch,
    sort: initialSort, // Maps directly to backend 'sort' param
    success: null, // ephemeral success toast message
  });

  // Keep URL params in sync when page/search/sort changes
  const updateUrlParams = (next) => {
    const q = new URLSearchParams(params);
    q.set('page', String(next.page || state.page || 1));
    if (typeof next.search === 'string' ? next.search.trim() : state.search.trim()) {
      q.set('search', (typeof next.search === 'string' ? next.search : state.search).trim());
    } else {
      q.delete('search');
    }
    if ((typeof next.sort === 'string' ? next.sort : state.sort).trim()) {
      q.set('sort', (typeof next.sort === 'string' ? next.sort : state.sort).trim());
    } else {
      q.delete('sort');
    }
    setParams(q);
  };

  const fetchData = async (override = {}) => {
    const page = override.page ?? state.page;
    const search = override.search ?? state.search;
    const sort = override.sort ?? state.sort;

    setState((s) => ({ ...s, loading: true, error: null }));
    const result = await listEmployees({
      page,
      pageSize: PAGE_SIZE,
      search: (search || '').trim(),
      sort: (sort || '').trim(),
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

  // Debounce search input: after 400ms of inactivity, reset to page 1, update URL, and fetch
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const next = { page: 1 };
      updateUrlParams(next);
      fetchData(next);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.search]);

  // Fetch on page or sort changes
  useEffect(() => {
    updateUrlParams({});
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.page, state.sort]);

  // When URL params change externally (e.g., back/forward), reflect them in state
  useEffect(() => {
    const urlPage = Math.max(1, Number(params.get('page') || 1));
    const urlSearch = params.get('search') || '';
    const urlSort = params.get('sort') || '';
    setState((s) => ({
      ...s,
      page: urlPage,
      search: urlSearch,
      sort: urlSort,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const onDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;
    const res = await deleteEmployee(id);
    if (res?.error) {
      // Non-PII error toast/banner
      setState((s) => ({ ...s, success: null, error: res.error.message || 'Delete failed' }));
      return;
    }
    setState((s) => ({ ...s, success: 'Employee deleted successfully.' }));
    // Clear success after a short delay
    setTimeout(() => setState((s) => ({ ...s, success: null })), 2000);
    fetchData();
  };

  // Columns and sort mapping: UI 'Name' -> backend 'last_name', others map 1:1 when possible
  const SORT_FIELDS = useMemo(
    () => ({
      name: 'last_name',
      email: 'email',
      department: 'department',
    }),
    []
  );

  const totalPages = Math.max(1, Number(state.pages) || 1);

  const sortIndicator = (field) => {
    const sort = (state.sort || '').toLowerCase();
    const asc = field.toLowerCase();
    const desc = `${field.toLowerCase()}:desc`;
    if (sort === asc) return ' ▲';
    if (sort === desc || sort === `-${field.toLowerCase()}`) return ' ▼';
    return '';
  };

  return (
    <div>
      <div className="space-between" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Employees</h1>
        <Link to="/employees/new">
          <Button ariaLabel="Create Employee">New Employee</Button>
        </Link>
      </div>

      {/* Toast banners */}
      {state.success && <div className="toast toast-success" role="status">{state.success}</div>}
      {state.error && <div className="toast toast-error" role="alert">{state.error}</div>}

      <div className="row" aria-label="Employee Search" style={{ marginBottom: 12 }}>
        <input
          name="search"
          value={state.search}
          onChange={(e) => setState((s) => ({ ...s, search: e.target.value }))}
          placeholder="Search by name or email"
          aria-label="Search employees"
          style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', flex: 1 }}
        />
      </div>

      {state.loading ? (
        <p className="help-text">Loading...</p>
      ) : (
        <>
          <table className="table" aria-label="Employees Table">
            <thead>
              <tr>
                <th
                  style={{ cursor: 'pointer' }}
                  aria-sort={state.sort?.startsWith('last_name') || state.sort?.startsWith('-last_name') ? 'other' : 'none'}
                  onClick={() =>
                    setState((s) => ({ ...s, page: 1, sort: buildNextSort(s.sort, SORT_FIELDS.name) }))
                  }
                >
                  Name{sortIndicator(SORT_FIELDS.name)}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  aria-sort={state.sort?.startsWith('email') || state.sort?.startsWith('-email') ? 'other' : 'none'}
                  onClick={() =>
                    setState((s) => ({ ...s, page: 1, sort: buildNextSort(s.sort, SORT_FIELDS.email) }))
                  }
                >
                  Email{sortIndicator(SORT_FIELDS.email)}
                </th>
                <th
                  style={{ cursor: 'pointer' }}
                  aria-sort={
                    state.sort?.startsWith('department') || state.sort?.startsWith('-department') ? 'other' : 'none'
                  }
                  onClick={() =>
                    setState((s) => ({ ...s, page: 1, sort: buildNextSort(s.sort, SORT_FIELDS.department) }))
                  }
                >
                  Department{sortIndicator(SORT_FIELDS.department)}
                </th>
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
              onClick={() => {
                const nextPage = Math.max(1, state.page - 1);
                setState((s) => ({ ...s, page: nextPage }));
              }}
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
              onClick={() => {
                const nextPage = Math.min(totalPages, state.page + 1);
                setState((s) => ({ ...s, page: nextPage }));
              }}
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
