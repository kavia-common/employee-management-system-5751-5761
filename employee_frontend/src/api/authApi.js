import { api, toResult } from './client';

// PUBLIC_INTERFACE
export async function login(email, password) {
  /** Performs user login; never returns sensitive fields. */
  return toResult(
    api.post('/auth/login', { email, password })
  );
}

// PUBLIC_INTERFACE
export async function signup(payload) {
  /** Performs user signup; payload must be pre-validated by caller. */
  return toResult(
    api.post('/auth/signup', payload)
  );
}
