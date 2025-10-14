import axios from 'axios';
import { triggerLogout } from '../context/authEvents';

/**
 * API client:
 * - Base URL from REACT_APP_API_BASE_URL
 * - Adds Authorization Bearer token when available
 * - Adds X-Correlation-ID per request
 * - Minimal structured logs in development honoring REACT_APP_LOG_LEVEL
 * - Handles 401 by logging out and redirecting to /login
 */

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const LOG_LEVEL = (process.env.REACT_APP_LOG_LEVEL || 'INFO').toUpperCase();
const NODE_ENV = process.env.NODE_ENV;

const LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
function canLog(level) {
  if (NODE_ENV === 'production') return false;
  const idx = LEVELS.indexOf(level);
  const minIdx = LEVELS.indexOf(LOG_LEVEL);
  if (idx === -1 || minIdx === -1) return false;
  return idx >= minIdx;
}

function safeLog(level, message, meta = {}) {
  if (!canLog(level)) return;
  // Do not log PII: never include raw email, password, tokens, or payloads
  const redactedMeta = { ...meta };
  delete redactedMeta.password;
  delete redactedMeta.token;
  delete redactedMeta.authorization;
  // Structured log
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level,
      message,
      ...redactedMeta,
    })
  );
}

function correlationId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback
    return 'cid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  } catch {
    return 'cid-' + Date.now();
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout for network resilience
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use(
  (config) => {
    const cfg = { ...config };
    const token = localStorage.getItem('auth_token');
    cfg.headers = cfg.headers || {};
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    const cid = correlationId();
    cfg.headers['X-Correlation-ID'] = cid;
    // attach cid to config for downstream extraction
    cfg.metadata = { ...(cfg.metadata || {}), correlationId: cid };
    safeLog('DEBUG', 'http_request', {
      method: cfg.method,
      url: cfg.baseURL ? `${cfg.baseURL}${cfg.url}` : cfg.url,
    });
    return cfg;
  },
  (error) => {
    safeLog('ERROR', 'http_request_error', { code: error?.code || 'REQUEST_SETUP_ERROR' });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    safeLog('DEBUG', 'http_response', {
      url: response?.config?.url,
      status: response?.status,
    });
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const cfg = error?.config || {};
    const cid =
      error?.response?.headers?.['x-correlation-id'] ||
      error?.response?.headers?.['X-Correlation-ID'] ||
      cfg?.metadata?.correlationId ||
      correlationId();

    if (status === 401) {
      safeLog('WARN', 'http_unauthorized', { status, correlationId: cid });
      // Force logout and redirect to login
      try {
        triggerLogout();
      } catch {
        // no-op
      }
      if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
        window.location.assign('/login');
      }
    } else {
      safeLog('ERROR', 'http_response_error', { status, correlationId: cid });
    }
    return Promise.reject({
      error: {
        code: status || error?.code || 'HTTP_ERROR',
        message: error?.response?.data?.message || error?.message || 'Request failed',
        correlationId: cid,
      },
    });
  }
);

// PUBLIC_INTERFACE
export function toResult(promise) {
  /**
   * Helper to standardize API responses to either data or { error }.
   */
  return promise
    .then((r) => r?.data)
    .catch((e) => {
      if (e?.error) return e;
      const cid = correlationId();
      return {
        error: {
          code: e?.code || 'UNKNOWN',
          message: e?.message || 'Unknown error',
          correlationId: cid,
        },
      };
    });
}
