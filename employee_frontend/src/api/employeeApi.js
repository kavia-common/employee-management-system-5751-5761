import { api, toResult } from './client';

const DEFAULT_PAGE_SIZE = 10;

// PUBLIC_INTERFACE
export async function listEmployees({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' } = {}) {
  const params = { page, page_size: pageSize };
  if (search) params.search = search;
  return toResult(api.get('/employees', { params }));
}

// PUBLIC_INTERFACE
export async function getEmployee(id) {
  if (!id) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' } };
  }
  return toResult(api.get(`/employees/${encodeURIComponent(id)}`));
}

// PUBLIC_INTERFACE
export async function createEmployee(payload) {
  // Basic guard; deeper validation is in forms
  if (!payload || typeof payload !== 'object') {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid employee payload.' } };
  }
  return toResult(api.post('/employees', payload));
}

// PUBLIC_INTERFACE
export async function updateEmployee(id, payload) {
  if (!id) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' } };
  }
  return toResult(api.put(`/employees/${encodeURIComponent(id)}`, payload));
}

// PUBLIC_INTERFACE
export async function deleteEmployee(id) {
  if (!id) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' } };
  }
  return toResult(api.delete(`/employees/${encodeURIComponent(id)}`));
}
