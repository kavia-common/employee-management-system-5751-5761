# Employee Frontend [STUB]

This stub UI mirrors the intended structure but uses a simple mock API client and runs without any authentication, database, or environment variables.

Key points:
- No authentication at all. All pages are accessible without tokens or login.
- Backend base URL resolution:
  - If the app runs on :3000 (typical React dev), requests target http://localhost:3001 by default.
  - Otherwise, if running on localhost without a set env, default is http://localhost:3001.
  - If neither applies, the client uses relative paths (use a same-origin proxy if needed).
- Pages: Dashboard (home), Employees list, Employee detail, Create/Edit.
- Styling uses the Executive Gray palette.

Run:
- npm install
- npm start
Open http://localhost:3000

Pages:
- /dashboard
- /employees
- /employees/:id
- /employees/:id/edit
- /employees/new

Services:
- src/services/mockApi.js: CRUD/search/pagination for employees + derived dashboard stats
- src/utils/logger.js: console logger wrapper

Tests:
- npm test
Notes for tests:
- Tests assert open routing (no redirect to login).
- Client baseURL fallback behavior is validated.

Notes:
- This is not production-ready. Avoid using with real data.
