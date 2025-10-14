import axios from 'axios';
import { triggerLogout } from '../context/authEvents';

/**
 * API client:
 * - Base URL from REACT_APP_API_BASE_URL (normalized, no trailing slash)
 * - Fallback derivation from current origin when env is missing:
 *     * If origin uses port :3000, replace with :3001 to target backend
 *     * Otherwise, if on localhost, default to http://localhost:3001
 * - Adds Authorization Bearer token when available
 * - Adds X-Correlation-ID per request
 * - Minimal structured logs in development honoring REACT_APP_LOG_LEVEL
 * - Handles 401 by logging out and redirecting to /login
 *
 * Security considerations:
 * - Never log PII such as passwords, emails, or tokens
 * - Only log high-level events and metadata, not request bodies
 */

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

/**
 * Derive and normalize API base URL:
 * - Prefer REACT_APP_API_BASE_URL
 * - Remove any trailing slashes for consistent request URLs
 * - If not provided, derive from current origin and apply port replacement:
 *   - If current origin ends with :3000, replace with :3001
 *   - Otherwise, if localhost, fallback to http://localhost:3001
 */
function deriveBaseUrl() {
  // Prefer explicit environment variable if provided.
  const raw = (process.env.REACT_APP_API_BASE_URL || '').trim();
  let derived = raw;

  // If not provided, derive from current origin with replacement rule
  if (!derived && typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;

    if (port === '3000') {
      // Preserve protocol and hostname, change to backend port 3001
      derived = `${protocol}//${hostname}:3001`;
      safeLog('WARN', 'api_base_url_fallback_used', { reason: 'origin_port_3000_replaced', fallback: derived });
    } else {
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      if (isLocalhost) {
        derived = 'http://localhost:3001';
        safeLog('WARN', 'api_base_url_fallback_used', { reason: 'env_missing_localhost', fallback: derived });
      }
    }
  }

  // Normalize: remove trailing slashes to avoid accidental double slashes
  if (derived && derived.endsWith('/')) {
    derived = derived.replace(/\/+$/, '');
  }

  if (!derived) {
    // Surface a clear message in dev to help diagnose 404s due to wrong origin.
    safeLog('ERROR', 'api_base_url_missing', {
      message:
        'REACT_APP_API_BASE_URL is not set; API requests may target the frontend origin and fail with 404. ' +
        'Set REACT_APP_API_BASE_URL to your backend (e.g., http://localhost:3001).',
    });
  } else {
    safeLog('DEBUG', 'api_base_url_configured', { baseURL: derived });
  }

  return derived;
}

const BASE_URL = deriveBaseUrl();

// Dev-only: print the resolved base URL once to aid debugging (exclude PII).
if (process.env.NODE_ENV === 'development' && typeof console !== 'undefined' && console.info) {
  try {
    // eslint-disable-next-line no-console
    console.info(`[api] baseURL: ${BASE_URL || '(not set)'}`);
  } catch {
    // no-op
  }
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout for network resilience
  headers: {
    Accept: 'application/json',
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

    // Guard: if using baseURL and url is relative without a leading slash, add it to avoid accidental path join issues.
    if (cfg.baseURL && typeof cfg.url === 'string') {
      const isAbsolute = /^https?:\/\//i.test(cfg.url);
      if (!isAbsolute && !cfg.url.startsWith('/')) {
        cfg.url = `/${cfg.url}`;
      }
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
