 /**
  * token.js
  * Centralized storage helpers for authentication tokens (JWT).
  * 
  * Responsibilities:
  * - Provide safe get/set/clear operations for the auth token
  * - Avoid logging sensitive information
  * - Encapsulate the localStorage key and access
  * 
  * Security:
  * - Never log tokens or PII
  * - Storage may be unavailable in some environments; handle errors gracefully
  */

const TOKEN_STORAGE_KEY = 'auth_token';

/**
 * Safely read an item from localStorage by key.
 * Returns null if not available or on errors (e.g., storage disabled).
 */
function safeRead(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely write a string to localStorage by key.
 * No-ops on errors (e.g., private browsing, storage quota).
 */
function safeWrite(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
}

/**
 * Safely remove an item from localStorage by key.
 */
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
}

// PUBLIC_INTERFACE
export function getAccessToken() {
  /** Get the JWT access token string from storage, or null if absent. */
  const raw = safeRead(TOKEN_STORAGE_KEY);
  return typeof raw === 'string' && raw.trim() ? raw : null;
}

// PUBLIC_INTERFACE
export function setAccessToken(token) {
  /** Set the JWT access token. If falsy or not a string, clears the token. */
  if (!token || typeof token !== 'string') {
    safeRemove(TOKEN_STORAGE_KEY);
    return;
  }
  safeWrite(TOKEN_STORAGE_KEY, token);
}

// PUBLIC_INTERFACE
export function clearAccessToken() {
  /** Remove the JWT access token from storage. */
  safeRemove(TOKEN_STORAGE_KEY);
}
