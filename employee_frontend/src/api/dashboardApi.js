import { api, toResult } from './client';

// PUBLIC_INTERFACE
export async function getSummary() {
  return toResult(api.get('/dashboard/summary'));
}

// PUBLIC_INTERFACE
export async function getDepartmentStats() {
  return toResult(api.get('/dashboard/department-stats'));
}
