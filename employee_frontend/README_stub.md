# Employee Frontend [STUB]

This stub UI mirrors the intended structure but uses a simple mock API client and fake auth to run without external services.

Key points:
- No real authentication; a fake token is stored in memory/localStorage.
- Backend base URL defaults to http://localhost:3001 when frontend runs on :3000.
- Pages: Login, Dashboard (home), Employees list, Employee detail.
- Styling uses the Executive Gray palette.

Run:
npm start

Pages:
- /login
- /dashboard
- /employees
- /employees/:id

Services:
- src/services/mockApi.js: CRUD/search/pagination for employees
- src/services/stubAuth.js: login/signup/logout against backend [STUB]
- src/utils/logger.js: console logger wrapper

Notes:
- This is not production-ready. Avoid using with real data.
