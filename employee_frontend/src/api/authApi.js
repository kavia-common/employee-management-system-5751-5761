 /**
  * api/authApi.js
  * Authentication API methods for the React frontend.
  * 
  * Endpoints:
  * - POST /auth/login -> { access_token: string, token_type: 'bearer' }
  * - POST /auth/signup -> 201 { id, email, full_name?, is_active }
  * - GET /auth/me -> { id, email, full_name?, is_active }
  * 
  * Returns:
  * - On success: data object
  * - On error: { error: { code, message, correlationId } }
  */

import { api, toResult } from './client';

// PUBLIC_INTERFACE
export async function login(email, password) {
  /**
   * Authenticate with credentials and return the token.
   * Returns { access_token } on success or { error } on failure.
   */
  if (!email || !password) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } };
  }
  const res = await toResult(api.post('/auth/login', { email, password }));
  if (res?.error) return res;

  const token = res?.access_token;
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { error: { code: 'TOKEN_MISSING', message: 'Login succeeded but token was missing from response.' } };
  }
  return { access_token: token };
}

// PUBLIC_INTERFACE
export async function signup({ email, password, full_name }) {
  /**
   * Create a new user account.
   * Returns created user or { error }.
   */
  if (!email || !password) {
    return { error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } };
  }
  return toResult(api.post('/auth/signup', { email, password, full_name: full_name || null }));
}

// PUBLIC_INTERFACE
export async function me() {
  /**
   * Retrieve the current authenticated user's profile.
   */
  return toResult(api.get('/auth/me'));
}
