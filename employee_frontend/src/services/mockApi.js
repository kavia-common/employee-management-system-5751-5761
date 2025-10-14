/**
 * mockApi.js
 * Thin client for the backend [STUB] endpoints at http://localhost:3001.
 * Uses the shared axios client for consistency and error handling.
 *
 * Note: The base URL is derived to default to :3001 when the frontend runs on :3000.
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
