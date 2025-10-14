/**
 * mockApi.js
 * Thin client for the backend [STUB] endpoints at http://localhost:3001.
 * Uses the shared axios client for consistency and error handling.
 *
 * Note: The base URL is derived to default to :3001 when the frontend runs on :3000,
 * and falls back to relative path for same-origin proxying.
 */
import { api, toResult } from '../api/client';

// PUBLIC_INTERFACE
export async function getEmployees({ q = '', page = 1, pageSize = 10 } = {}) {
  /**
   * Returns a normalized shape:
   * { items: Employee[], total: number, page, pageSize, pages }
   */
  const params = { page, page_size: pageSize };
  if (q) params.q = q;
  const res = await toResult(api.get('/employees', { params }));
  if (res?.error) return res;

  const data = res?.data || res?.items || res?.results || [];
  const pagination = res?.pagination || {};
  return {
    items: data,
    total: pagination.total ?? data.length ?? 0,
    page: pagination.page ?? page,
    pageSize: pagination.page_size ?? pageSize,
    pages: pagination.pages ?? 1,
  };
}

// PUBLIC_INTERFACE
export async function getById(id) {
  if (!id) return { error: { code: 'VALIDATION_ERROR', message: 'ID is required.' } };
  return toResult(api.get(`/employees/${encodeURIComponent(id)}`));
}

// PUBLIC_INTERFACE
export async function create(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid payload.' } };
  }
  return toResult(api.post('/employees', payload));
}

// PUBLIC_INTERFACE
export async function update(id, payload) {
  if (!id) return { error: { code: 'VALIDATION_ERROR', message: 'ID is required.' } };
  return toResult(api.put(`/employees/${encodeURIComponent(id)}`, payload));
}

// PUBLIC_INTERFACE
export async function remove(id) {
  if (!id) return { error: { code: 'VALIDATION_ERROR', message: 'ID is required.' } };
  return toResult(api.delete(`/employees/${encodeURIComponent(id)}`));
}

// PUBLIC_INTERFACE
export async function getSummary() {
  /**
   * Computes simple summary from employees. In pure stub mode we fetch a large page
   * and derive counts locally to avoid backend dependencies.
   */
  const res = await getEmployees({ page: 1, pageSize: 1000 });
  if (res?.error) return res;
  const items = Array.isArray(res?.items) ? res.items : [];
  const total = items.length;
  // Consider "active" all entries for stub purposes
  const active = items.length;
  return {
    total_employees: total,
    active_employees: active,
  };
}

// PUBLIC_INTERFACE
export async function getDepartmentStats() {
  /**
   * Returns counts by department computed locally. Missing departments are grouped as 'Unassigned'.
   */
  const res = await getEmployees({ page: 1, pageSize: 1000 });
  if (res?.error) return res;
  const items = Array.isArray(res?.items) ? res.items : [];
  const counts = items.reduce((acc, e) => {
    const key = e?.department || 'Unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).map((department) => ({ department, count: counts[department] }));
}
