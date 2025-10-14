# Employee Frontend (React)

Web UI for the Employee Management System. Communicates with the FastAPI backend via REST.

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
  - Or the backend preview URL if applicable
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

## API Client Behavior

- All requests include an `X-Correlation-ID` header for tracing.
- Minimal structured logs are emitted in development honoring `REACT_APP_LOG_LEVEL`.

## CORS and API Base URL Alignment

- The backend must allow the frontend origin. For local dev:
  - Backend `CORS_ORIGINS=http://localhost:3000`
- The frontend must point to the backend with `REACT_APP_API_BASE_URL`.
- If you observe CORS errors in the browser console:
  - Confirm `REACT_APP_API_BASE_URL` is correct (scheme/host/port)
  - Confirm backend `CORS_ORIGINS` includes your exact frontend origin

## Smoke Tests (End-to-End)

Stub mode (no real authentication required):

1) Employees
   - Navigate to `/employees`
   - Create a new employee
   - List/paginate/search employees
   - View detail and edit/delete the employee

2) Dashboard
   - Navigate to `/dashboard`
   - Verify summary and department stats are displayed

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
- If you get CORS errors, confirm backend `CORS_ORIGINS` and frontend base URL.
- For 401 errors, verify credentials and token expiry.
