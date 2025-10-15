# employee-management-system-5751-5761

Frontend workspace for the Employee Management System.

- Container root: `employee_frontend/`
- Tech: React (react-scripts), axios, react-router-dom

Quick steps:
1) cd `employee_frontend`
2) `npm install`
3) Copy `.env.local.example` to `.env.local` and set:
   - REACT_APP_API_BASE_URL (e.g., `http://localhost:3001`)
   - REACT_APP_LOG_LEVEL=info
4) `npm start` then open http://localhost:3000

CORS:
- Ensure the backend has CORSMiddleware configured to allow your frontend origin (e.g., `http://localhost:3000`) for both simple and preflight (OPTIONS) requests.

See `employee_frontend/README.md` for more details and smoke tests.
