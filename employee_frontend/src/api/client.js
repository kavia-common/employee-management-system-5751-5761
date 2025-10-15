/**
 * api/client.js
 * Axios client configured for pure stub mode (no authentication).
 *
 * Behavior:
 * - Base URL from REACT_APP_API_BASE_URL or window.API_BASE_URL (normalized without trailing slash)
 * - If missing, derive from current origin:
 *     * If port is :3000 (typical React dev), switch to :3001
 *     * If localhost without explicit port, default to http://localhost:3001
 *     * Otherwise, leave baseURL empty to allow relative path / same-origin proxying
 * - Adds X-Correlation-ID per request for basic tracing
 * - Minimal, safe JSON-structured logging in development honoring REACT_APP_LOG_LEVEL
 *
 * Security:
 * - No tokens, no auth headers, no PII in logs.
 */

import axios from 'axios';

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
    return 'cid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  } catch {
    return 'cid-' + Date.now();
  }
}

/**
 * Derive and normalize API base URL for stub mode.
 * - Prefer REACT_APP_API_BASE_URL
 * - Normalize by removing trailing slashes
 * - Fallback from current window.location when available
 */
function deriveBaseUrl() {
  // 1) Prefer env
  const envRaw = (process.env.REACT_APP_API_BASE_URL || 'https://vscode-internal-23063-beta.beta01.cloud.kavia.ai:3001').trim();
  let derived = envRaw;
  let source = envRaw ? 'env' : null;

  // 2) Then window.API_BASE_URL if provided by host page
  if (!derived && typeof window !== 'undefined') {
    try {
      const winRaw = (window.API_BASE_URL || '').toString().trim();
      if (winRaw) {
        derived = winRaw;
        source = 'window';
      }
    } catch {
      // ignore if window/API_BASE_URL not accessible
    }
  }

  // 3) Fallback from current window.location when available
  if (!derived && typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;

    if (port === '3000') {
      // Replace :3000 (frontend) with :3001 (backend)
      derived = `${protocol}//${hostname}:3001`;
      source = 'fallback_port_switch';
      safeLog('WARN', 'api_base_url_fallback_used', { reason: 'origin_port_3000_replaced', fallback: derived });
    } else {
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      if (isLocalhost) {
        derived = 'https://vscode-internal-23063-beta.beta01.cloud.kavia.ai:3001';
        source = 'fallback_localhost';
        safeLog('WARN', 'api_base_url_fallback_used', { reason: 'env_missing_localhost', fallback: derived });
      } else {
        // Use relative path for same-origin proxy setups
        derived = '';
        source = 'relative';
        safeLog('INFO', 'api_base_url_relative', { reason: 'same_origin_or_proxy' });
      }
    }
  }

  // Normalize (remove trailing slashes)
  if (derived && derived.endsWith('/')) {
    derived = derived.replace(/\/*$/, '');
  }

  if (!derived) {
    safeLog('INFO', 'api_base_url_empty_using_relative', {});
  } else {
    safeLog('DEBUG', 'api_base_url_configured', { baseURL: derived, source });
  }

  return derived;
}

const BASE_URL = deriveBaseUrl();

// Dev convenience: print resolved base URL
if (process.env.NODE_ENV === 'development' && typeof console !== 'undefined' && console.info) {
  try {
    // eslint-disable-next-line no-console
    console.info(`[api] baseURL: ${BASE_URL || '(relative)'}`);
  } catch {
    // no-op
  }
}

export const api = axios.create({
  baseURL: BASE_URL || undefined,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use(
  (config) => {
    const cfg = { ...config };
    cfg.headers = cfg.headers || {};

    // Ensure relative paths start with "/" when baseURL is present to avoid accidental concatenations
    if (cfg.baseURL && typeof cfg.url === 'string') {
      const isAbsolute = /^https?:\/\//i.test(cfg.url);
      if (!isAbsolute && !cfg.url.startsWith('/')) {
        cfg.url = `/${cfg.url}`;
      }
    }

    const cid = correlationId();
    cfg.headers['X-Correlation-ID'] = cid;
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

    safeLog('ERROR', 'http_response_error', { status, correlationId: cid });
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
