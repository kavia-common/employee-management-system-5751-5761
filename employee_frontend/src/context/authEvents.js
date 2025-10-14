let logoutHandler = null;

/**
 * Registers a global logout handler function. Used by API client on 401.
 */
export function setLogoutHandler(fn) {
  logoutHandler = typeof fn === 'function' ? fn : null;
}

/**
 * Triggers logout if a handler is registered.
 */
export function triggerLogout() {
  if (typeof logoutHandler === 'function') {
    logoutHandler();
  }
}
