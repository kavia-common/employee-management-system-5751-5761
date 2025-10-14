/**
 * mockApi.js
 * In-memory (localStorage-backed) mock service for employees in pure stub mode.
 * Provides CRUD, search, pagination, and derived dashboard stats — without any backend.
 *
 * Notes:
 * - Data persists in localStorage under the key "mock_employees".
 * - seedIfEmpty() initializes a richer dataset on first load (15-25 records).
 * - All methods are async to mirror real API semantics.
 *
 * Security:
 * - No PII is logged. Avoid logging payloads. Do not store tokens.
 */

// Constants
const STORAGE_KEY = 'mock_employees';
const ID_SEQ_KEY = 'mock_employees_seq';
const PAGE_FALLBACK = 10;

function safeRead(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

function getStore() {
  const data = safeRead(STORAGE_KEY);
  return Array.isArray(data) ? data : [];
}

function saveStore(items) {
  if (!Array.isArray(items)) return;
  safeWrite(STORAGE_KEY, items);
}

function nextId() {
  try {
    const current = Number(localStorage.getItem(ID_SEQ_KEY) || '1000');
    const next = current + 1;
    localStorage.setItem(ID_SEQ_KEY, String(next));
    return next;
  } catch {
    // Fallback if localStorage fails
    return Math.floor(Math.random() * 1e6);
  }
}

function normalizeEmployee(e) {
  // Keep fields used across UI; tolerate extra fields.
  return {
    id: e.id,
    name: e.name?.toString() || '',
    email: e.email?.toString() || '',
    department: e.department?.toString() || '',
    role: e.role?.toString() || e.title?.toString() || '',
    phone: e.phone?.toString() || '',
    date_hired: e.date_hired?.toString() || '',
  };
}

function includesInsensitive(hay, needle) {
  if (!hay || !needle) return false;
  return hay.toString().toLowerCase().includes(needle.toString().toLowerCase());
}

function sortByDateDesc(a, b) {
  const da = a?.date_hired ? Date.parse(a.date_hired) : 0;
  const db = b?.date_hired ? Date.parse(b.date_hired) : 0;
  return db - da;
}

/**
 * Build the initial richer dataset for demo usage.
 */
function buildSeedData() {
  const seed = [
    { id: 1001, name: 'Alice Johnson', email: 'alice.johnson@example.com', department: 'Engineering', role: 'Senior Software Engineer', phone: '555-0101', date_hired: '2021-03-15' },
    { id: 1002, name: 'Bob Smith', email: 'bob.smith@example.com', department: 'Engineering', role: 'DevOps Engineer', phone: '555-0102', date_hired: '2020-11-22' },
    { id: 1003, name: 'Carla Gomez', email: 'carla.gomez@example.com', department: 'HR', role: 'HR Generalist', phone: '555-0103', date_hired: '2022-05-10' },
    { id: 1004, name: 'David Lee', email: 'david.lee@example.com', department: 'Sales', role: 'Account Executive', phone: '555-0104', date_hired: '2023-01-09' },
    { id: 1005, name: 'Emma Davis', email: 'emma.davis@example.com', department: 'Finance', role: 'Financial Analyst', phone: '555-0105', date_hired: '2021-08-01' },
    { id: 1006, name: 'Frank Miller', email: 'frank.miller@example.com', department: 'Operations', role: 'Operations Manager', phone: '555-0106', date_hired: '2019-12-12' },
    { id: 1007, name: 'Grace Chen', email: 'grace.chen@example.com', department: 'Engineering', role: 'Frontend Engineer', phone: '555-0107', date_hired: '2024-02-14' },
    { id: 1008, name: 'Hector Alvarez', email: 'hector.alvarez@example.com', department: 'Sales', role: 'Sales Manager', phone: '555-0108', date_hired: '2020-07-07' },
    { id: 1009, name: 'Ivy Patel', email: 'ivy.patel@example.com', department: 'Finance', role: 'Accountant', phone: '555-0109', date_hired: '2022-10-03' },
    { id: 1010, name: 'Jack Wilson', email: 'jack.wilson@example.com', department: 'Operations', role: 'Logistics Coordinator', phone: '555-0110', date_hired: '2023-06-21' },
    { id: 1011, name: 'Karen Nguyen', email: 'karen.nguyen@example.com', department: 'HR', role: 'Recruiter', phone: '555-0111', date_hired: '2021-09-13' },
    { id: 1012, name: 'Liam Brown', email: 'liam.brown@example.com', department: 'Engineering', role: 'Backend Engineer', phone: '555-0112', date_hired: '2018-04-30' },
    { id: 1013, name: 'Mia Thompson', email: 'mia.thompson@example.com', department: 'Finance', role: 'Payroll Specialist', phone: '555-0113', date_hired: '2020-02-28' },
    { id: 1014, name: 'Noah Garcia', email: 'noah.garcia@example.com', department: 'Operations', role: 'Operations Analyst', phone: '555-0114', date_hired: '2022-12-05' },
    { id: 1015, name: 'Olivia Martinez', email: 'olivia.martinez@example.com', department: 'Sales', role: 'Sales Associate', phone: '555-0115', date_hired: '2024-03-02' },
    { id: 1016, name: 'Paul King', email: 'paul.king@example.com', department: 'Engineering', role: 'QA Engineer', phone: '555-0116', date_hired: '2019-05-18' },
    { id: 1017, name: 'Quinn Rivera', email: 'quinn.rivera@example.com', department: 'HR', role: 'HR Coordinator', phone: '555-0117', date_hired: '2023-09-19' },
    { id: 1018, name: 'Riley Brooks', email: 'riley.brooks@example.com', department: 'Engineering', role: 'Data Engineer', phone: '555-0118', date_hired: '2021-01-26' },
    { id: 1019, name: 'Sophia Turner', email: 'sophia.turner@example.com', department: 'Finance', role: 'Senior Accountant', phone: '555-0119', date_hired: '2020-10-17' },
    { id: 1020, name: 'Tyler Evans', email: 'tyler.evans@example.com', department: 'Operations', role: 'Supply Chain Specialist', phone: '555-0120', date_hired: '2024-04-11' },
    { id: 1021, name: 'Uma Collins', email: 'uma.collins@example.com', department: 'Sales', role: 'Business Development Rep', phone: '555-0121', date_hired: '2022-07-24' },
    { id: 1022, name: 'Victor Perez', email: 'victor.perez@example.com', department: 'Engineering', role: 'Site Reliability Engineer', phone: '555-0122', date_hired: '2023-11-30' },
    { id: 1023, name: 'Wendy Scott', email: 'wendy.scott@example.com', department: 'HR', role: 'Benefits Specialist', phone: '555-0123', date_hired: '2019-03-08' },
    { id: 1024, name: 'Xavier Reed', email: 'xavier.reed@example.com', department: 'Finance', role: 'Controller', phone: '555-0124', date_hired: '2018-09-29' },
  ];
  return seed.map(normalizeEmployee);
}

/**
 * Seed the local dataset if empty. Safe to call multiple times.
 */
// PUBLIC_INTERFACE
export function seedIfEmpty() {
  try {
    const existing = getStore();
    if (existing.length > 0) return;
    const seed = buildSeedData();
    saveStore(seed);
    // Maintain ID sequence to avoid collisions
    localStorage.setItem(ID_SEQ_KEY, String(Math.max(...seed.map((e) => e.id))));
  } catch {
    // ignore seed errors
  }
}

/**
 * List employees with optional search and pagination.
 * Returns { items, total, page, pageSize, pages }
 */
// PUBLIC_INTERFACE
export async function getEmployees({ q = '', page = 1, pageSize = PAGE_FALLBACK } = {}) {
  const search = (q || '').toString().trim();
  const data = getStore();
  const filtered = !search
    ? data
    : data.filter(
        (e) => includesInsensitive(e.name, search) || includesInsensitive(e.email, search)
      );

  const total = filtered.length;
  const size = Math.max(1, Number(pageSize) || PAGE_FALLBACK);
  const current = Math.max(1, Number(page) || 1);
  const start = (current - 1) * size;
  const end = start + size;
  const items = filtered.slice(start, end);

  return {
    items,
    total,
    page: current,
    pageSize: size,
    pages: Math.max(1, Math.ceil(total / size)),
  };
}

// PUBLIC_INTERFACE
export async function getById(id) {
  if (!id && id !== 0) {
    return { error: { code: 'VALIDATION_ERROR', message: 'ID is required.' } };
  }
  const data = getStore();
  const item = data.find((e) => String(e.id) === String(id));
  if (!item) {
    return { error: { code: 'NOT_FOUND', message: 'Employee not found.' } };
  }
  return item;
}

// PUBLIC_INTERFACE
export async function create(payload) {
  if (!payload || typeof payload !== 'object') {
    return { error: { code: 'VALIDATION_ERROR', message: 'Invalid payload.' } };
  }
  const name = (payload.name || '').toString().trim();
  const email = (payload.email || '').toString().trim();
  const department = (payload.department || '').toString().trim();
  const role = (payload.role || '').toString().trim();

  if (!name || !email || !department) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Name, email, and department are required.' } };
  }

  const all = getStore();
  if (all.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
    return { error: { code: 'CONFLICT', message: 'An employee with this email already exists.' } };
  }

  const created = normalizeEmployee({
    id: nextId(),
    name,
    email,
    department,
    role,
    phone: payload.phone || '',
    date_hired: payload.date_hired || new Date().toISOString().slice(0, 10),
  });

  all.push(created);
  saveStore(all);

  return created;
}

// PUBLIC_INTERFACE
export async function update(id, payload) {
  if (!id && id !== 0) {
    return { error: { code: 'VALIDATION_ERROR', message: 'ID is required.' } };
  }
  const all = getStore();
  const idx = all.findIndex((e) => String(e.id) === String(id));
  if (idx === -1) {
    return { error: { code: 'NOT_FOUND', message: 'Employee not found.' } };
  }

  const current = all[idx];
  const next = normalizeEmployee({
    ...current,
    ...payload,
    id: current.id, // ID is immutable
  });

  // Email uniqueness check if changed
  if (
    next.email &&
    next.email !== current.email &&
    all.some((e, i) => i !== idx && e.email.toLowerCase() === next.email.toLowerCase())
  ) {
    return { error: { code: 'CONFLICT', message: 'Another employee uses this email.' } };
  }

  all[idx] = next;
  saveStore(all);
  return next;
}

// PUBLIC_INTERFACE
export async function remove(id) {
  if (!id && id !== 0) {
    return { error: { code: 'VALIDATION_ERROR', message: 'ID is required.' } };
  }
  const all = getStore();
  const next = all.filter((e) => String(e.id) !== String(id));
  if (next.length === all.length) {
    return { error: { code: 'NOT_FOUND', message: 'Employee not found.' } };
  }
  saveStore(next);
  return { success: true };
}

// PUBLIC_INTERFACE
export async function getSummary() {
  const items = getStore();
  return {
    total_employees: items.length,
    active_employees: items.length, // all active in stub
  };
}

// PUBLIC_INTERFACE
export async function getDepartmentStats() {
  const items = getStore();
  const counts = items.reduce((acc, e) => {
    const key = e?.department || 'Unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).map((department) => ({ department, count: counts[department] }));
}

/**
 * Return the most recent hires sorted by date_hired desc.
 * @param {number} limit
 */
// PUBLIC_INTERFACE
export async function getRecentHires(limit = 5) {
  const items = getStore().slice().sort(sortByDateDesc);
  const n = Math.max(1, Number(limit) || 5);
  return items.slice(0, n);
}
