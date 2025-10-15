# Employee Frontend (React)

Web UI for the Employee Management System. Communicates with the FastAPI backend via REST using JWT authentication.

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended

## Quick Start

1) Install dependencies:
```
npm install
```

2) Configure environment:
- Copy `.env.local.example` to `.env.local`
- Set `REACT_APP_API_BASE_URL` to your backend URL:
  - Local dev: `http://localhost:3001`
  - Or the backend preview URL if applicable (e.g., `https://<host>:3001`)
- Optionally set `REACT_APP_LOG_LEVEL=info` (or `debug` for verbose client logs in dev)

3) Start the app:
```
npm start
```
Open http://localhost:3000

## Environment Variables

- REACT_APP_API_BASE_URL (e.g., `http://localhost:3001`)
- REACT_APP_LOG_LEVEL (`debug` | `info` | `warn` | `error`) — default `info`

Notes:
- Variables MUST be prefixed with `REACT_APP_` to be available in the app.
- Do not commit secrets to source control.

## Authentication

- Login: POST `/auth/login` returns `{ access_token, token_type }`
- Signup: POST `/auth/signup`
- Current user: GET `/auth/me`
- The frontend stores the JWT in `localStorage` (key `auth_token`) and attaches it to requests via `Authorization: Bearer <token>`.
- On HTTP 401 from the backend, the app clears the token and redirects users to the login page.

## Employees CRUD

- List: GET `/employees?page=<n>&size=<n>&search=<term?>`
- Get: GET `/employees/{id}`
- Create: POST `/employees`
- Update: PUT `/employees/{id}`
- Delete: DELETE `/employees/{id}`

Field mapping:
- UI uses `name` which maps to backend `first_name` + `last_name`.
- UI uses `role` which maps to backend `title`.

## API Client Behavior

- Base URL is configured via `REACT_APP_API_BASE_URL` (defaults to `http://localhost:3001` when frontend runs on `:3000`).
- All requests include an `X-Correlation-ID` header for tracing.
- Minimal structured logs are emitted in development honoring `REACT_APP_LOG_LEVEL`.

## CORS and API Base URL Alignment

- The backend must allow the frontend origin. For local dev:
  - Backend must include CORS origins: `http://localhost:3000`
- The frontend must point to the backend with `REACT_APP_API_BASE_URL`.
- If you observe CORS errors in the browser console:
  - Confirm `REACT_APP_API_BASE_URL` is correct (scheme/host/port)
  - Confirm backend CORS middleware allows your exact frontend origin
  - Ensure OPTIONS preflight is handled by the backend

## Smoke Tests (End-to-End)

1) Signup
   - Navigate to `/signup`
   - Create a new user
   - On success, you will be redirected to `/login`

2) Login
   - Navigate to `/login`
   - Sign in with valid credentials
   - You should be redirected to `/dashboard`

3) Employees
   - Navigate to `/employees`
   - Create, view, edit, and delete employees — changes persist via backend

## Testing

Run React tests (non-interactive):
```
npm test
```

## Security

- Never log or store PII, tokens, or passwords in client logs.
- Use HTTPS in production.
- Do not commit `.env.local` files.

## Troubleshooting

- If API calls fail, check `REACT_APP_API_BASE_URL` and the backend server status.
  - In local development, ensure it points to the backend on port `3001` (not the frontend port `3000`), e.g. `http://localhost:3001`.
  - In preview environments, use the backend preview URL. If your frontend runs on `:3000`, the backend is typically on the same host at `:3001`.
- The client logs the effective API base URL once in development via `console.info`. This helps verify configuration without logging any sensitive data.
- If you get CORS errors, confirm backend CORS origins and frontend base URL.
- For 401 errors, verify credentials and token expiry; the app will require re-authentication.
