 /**
  * logger.js
  * Console logger wrapper to standardize logs and avoid PII.
  */
const LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

function canLog(level) {
  if (process.env.NODE_ENV === 'production') return false;
  return LEVELS.includes(level);
}

// PUBLIC_INTERFACE
export function log(level, message, meta = {}) {
  if (!canLog(level)) return;
  const safe = { ...meta };
  delete safe.password;
  delete safe.token;
  delete safe.authorization;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, message, ...safe }));
}
