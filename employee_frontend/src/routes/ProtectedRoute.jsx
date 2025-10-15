import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute.jsx
 * Route guard that enforces presence of a valid authenticated session (JWT + /auth/me).
 *
 * Behavior:
 * - While AuthContext is initializing (checking token via /auth/me), show a lightweight loader
 * - If authenticated, render children or nested routes (Outlet)
 * - If unauthenticated, redirect to /login and pass the intended location in state.from
 *
 * Security:
 * - Does not expose any sensitive information
 */

// PUBLIC_INTERFACE
export default function ProtectedRoute({ children }) {
  /** Guarded route wrapper; redirects unauthenticated users to /login. */
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <p className="help-text" aria-live="polite">Checking session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
