import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

/**
 * ProtectedRoute.jsx
 * Route guard that enforces presence of a stub "session" from AppContext.
 *
 * Behavior:
 * - If session.displayName exists, renders children or nested routes (Outlet).
 * - If absent, redirects to /login and passes the intended location in state.from
 *   so the Login page can navigate back to the requested route upon success.
 *
 * Security:
 * - No tokens, no Authorization headers, no external services referenced.
 */

// PUBLIC_INTERFACE
export default function ProtectedRoute({ children }) {
  /** Guarded route wrapper; redirects unauthenticated users to /login. */
  const { session } = useAppContext();
  const location = useLocation();

  const isAuthenticated =
    Boolean(session?.displayName) && typeof session.displayName === 'string';

  if (!isAuthenticated) {
    // Replace history to avoid back-button ping-pong; preserve intended location via state.from
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If children are provided, render them; otherwise, render nested route outlet
  return children ? <>{children}</> : <Outlet />;
}
