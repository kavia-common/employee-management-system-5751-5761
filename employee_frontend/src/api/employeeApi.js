 /**
  * api/employeeApi.js
  * Employee management API methods using the real backend.
  *
  * Backend shapes (OpenAPI):
  * - List: GET /employees -> { data: EmployeeRead[], pagination: { total, page, size, pages } }
  * - Get: GET /employees/{id} -> EmployeeRead
  * - Create: POST /employees -> 201 EmployeeRead
  * - Update: PUT /employees/{id} -> 200 EmployeeRead
  * - Delete: DELETE /employees/{id} -> 204 No Content
  *
  * UI model:
  *  { id, name, email, department, role, phone?, date_hired? }
  *    - name = `${first_name} ${last_name}` (trimmed)
  *    - role maps from backend `title`
  */

import { api, toResult } from './client';

const DEFAULT_PAGE_SIZE = 10;

function mapEmployeeFromApi(e) {
  if (!e || typeof e !== 'object') return null;
  const first = (e.first_name || '').toString().trim();
  const last = (e.last_name || '').toString().trim();
  const name = [first, last].filter(Boolean).join(' ').trim();
  return {
    id: e.id,
    name,
    email: e.email || '',
    department: e.department || '',
    role: e.title || '',
    phone: e.phone || '',
    date_hired: e.date_hired || '',
    status: e.status || 'ACTIVE',
  };
}

function splitNameToFirstLast(name) {
  const trimmed = (name || '').toString().trim();
  if (!trimmed) return { first_name: null, last_name: null };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: null };
  const first_name = parts.slice(0, -1).join(' ');
  const last_name = parts.slice(-1).join(' ');
  return { first_name, last_name };
}

function mapFormToCreatePayload(form) {
  const email = (form?.email || '').toString().trim();
  const department = (form?.department || '').toString().trim() || null;
  const role = (form?.role || '').toString().trim() || null;
  const phone = (form?.phone || '').toString().trim() || null;
  const date_hired = (form?.date_hired || '').toString().trim() || null;
  const { first_name, last_name } = splitNameToFirstLast(form?.name);

  return {
    first_name,
    last_name,
    email,
    phone,
    department,
    title: role,
    manager_id: null,
    salary: null,
    date_hired,
    status: 'ACTIVE',
  };
}

function mapFormToUpdatePayload(form) {
  const payload = {};
  const { first_name, last_name } = splitNameToFirstLast(form?.name);
  if (first_name) payload.first_name = first_name;
  if (last_name !== undefined) payload.last_name = last_name || null;
  if (form?.email !== undefined) payload.email = (form.email || '').toString().trim() || null;
  if (form?.department !== undefined) payload.department = (form.department || '').toString().trim() || null;
  if (form?.role !== undefined) payload.title = (form.role || '').toString().trim() || null;
  if (form?.phone !== undefined) payload.phone = (form.phone || '').toString().trim() || null;
  if (form?.date_hired !== undefined) payload.date_hired = (form.date_hired || '').toString().trim() || null;
  if (form?.status !== undefined) payload.status = (form.status || '').toString().trim() || null;
  return payload;
}

// PUBLIC_INTERFACE
export async function listEmployees({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '', sort = '' } = {}) {
  /**
   * List employees, mapping backend response to UI-friendly structure.
   * Supports pagination, optional search, and sorting.
   * - sort: maps directly to backend 'sort' param (e.g., 'last_name', 'last_name:desc', '-date_hired')
   * Returns { items, total, page, pageSize, pages } or { error }.
   */
  const params = { page, size: pageSize };
  if (search) params.search = search;
  if (sort) params.sort = sort;

  const res = await toResult(api.get('/employees', { params }));
  if (res?.error) return res;

  const data = Array.isArray(res?.data) ? res.data : [];
  const pagination = res?.pagination || {};
  return {
    items: data.map(mapEmployeeFromApi).filter(Boolean),
    total: typeof pagination.total === 'number' ? pagination.total : data.length,
    page: typeof pagination.page === 'number' ? pagination.page : page,
    pageSize: typeof pagination.size === 'number' ? pagination.size : pageSize,
    pages: typeof pagination.pages === 'number' ? pagination.pages : Math.max(1, Math.ceil(data.length / pageSize)),
  };
}

// PUBLIC_INTERFACE
export async function getEmployee(id) {
  /** Fetch an employee by ID and map to UI model. */
  if (!id && id !== 0) return { error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' } };
  const res = await toResult(api.get(`/employees/${encodeURIComponent(id)}`));
  if (res?.error) return res;
  return mapEmployeeFromApi(res);
}

// PUBLIC_INTERFACE
export async function createEmployee(payload) {
  /**
   * Create an employee from UI form payload.
   * Returns mapped employee or { error }.
   */
  if (!payload || typeof payload !== 'object') {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid employee payload.' } };
  }
  const body = mapFormToCreatePayload(payload);
  const res = await toResult(api.post('/employees', body));
  if (res?.error) return res;
  return mapEmployeeFromApi(res);
}

// PUBLIC_INTERFACE
export async function updateEmployee(id, payload) {
  /** Update an employee using UI form payload and map response to UI model. */
  if (!id && id !== 0) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' } };
  }
  const body = mapFormToUpdatePayload(payload);
  const res = await toResult(api.put(`/employees/${encodeURIComponent(id)}`, body));
  if (res?.error) return res;
  return mapEmployeeFromApi(res);
}

// PUBLIC_INTERFACE
export async function deleteEmployee(id) {
  /** Delete an employee by ID. Returns { success: true } or { error }. */
  if (!id && id !== 0) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required.' } };
  }
  const res = await api.delete(`/employees/${encodeURIComponent(id)}`).then(() => ({})).catch((e) => e);
  if (res?.error) return res;
  return { success: true };
}
