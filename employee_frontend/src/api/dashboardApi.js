import { api, toResult } from './client';

/**
 * Dashboard endpoints require a valid Bearer token (Authorization) which is
 * attached via axios interceptor in api/client.js when available.
 */

// PUBLIC_INTERFACE
export async function getSummary() {
  return toResult(api.get('/dashboard/summary'));
}

// PUBLIC_INTERFACE
export async function getDepartmentStats() {
  return toResult(api.get('/dashboard/department-stats'));
}
