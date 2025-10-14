import { api, toResult } from './client';

/**
 * Authentication API wrapper functions.
 * These helpers standardize responses and avoid exposing sensitive information.
 */

// PUBLIC_INTERFACE
export async function login(email, password) {
  /**
   * Performs user login.
   * Returns a normalized object: { access_token, token_type, user? } or { error }.
   * Provides a descriptive error when access_token is missing from a 200 response.
   */
  const result = await toResult(api.post('/auth/login', { email, password }));
  if (result?.error) {
    return result;
  }

  // The backend contract is expected to return { access_token, token_type }
  const accessToken = result?.access_token;
  const tokenType = result?.token_type || 'bearer';

  if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
    return {
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Login failed: missing token from server.',
      },
    };
  }

  // Normalize return shape for consumers
  return {
    access_token: accessToken,
    token_type: tokenType,
    // Some backends also attach user; pass through if available
    user: result?.user || null,
  };
}

// PUBLIC_INTERFACE
export async function signup(payload) {
  /** Performs user signup; payload must be pre-validated by caller. */
  return toResult(
    api.post('/auth/signup', payload)
  );
}
