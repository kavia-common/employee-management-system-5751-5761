 /**
  * stubAuth.js
  * Minimal fake auth client used by the stub UI.
  * Talks to the backend [STUB] endpoints and stores token in memory/localStorage.
  *
  * Security: Never logs PII. Do not use in production.
  */
import { api, toResult } from '../api/client';

let memoryToken = null;

// PUBLIC_INTERFACE
export async function login(email, password) {
  /**
   * Returns { access_token, token_type, user? } or { error }.
   */
  const res = await toResult(api.post('/auth/login', { email, password }));
  if (res?.error) return res;
  const token = res?.access_token;
  if (!token) {
    return { error: { code: 'INVALID_RESPONSE', message: 'Login succeeded but token was missing.' } };
  }
  memoryToken = token;
  try {
    localStorage.setItem('auth_token', token);
    if (res?.user) localStorage.setItem('auth_user', JSON.stringify(res.user));
  } catch {
    // ignore storage failures
  }
  return res;
}

// PUBLIC_INTERFACE
export async function signup(payload) {
  return toResult(api.post('/auth/signup', payload));
}

// PUBLIC_INTERFACE
export async function logout() {
  try {
    await toResult(api.post('/auth/logout'));
  } catch {
    // ignore
  }
  memoryToken = null;
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {
    // ignore
  }
  return { success: true };
}

// PUBLIC_INTERFACE
export function isAuthenticated() {
  try {
    return Boolean(memoryToken || localStorage.getItem('auth_token'));
  } catch {
    return Boolean(memoryToken);
  }
}
