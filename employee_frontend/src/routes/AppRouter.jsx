import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/Employees/List';
import EmployeeCreate from '../pages/Employees/Create';
import EmployeeEdit from '../pages/Employees/Edit';
import EmployeeDetail from '../pages/Employees/Detail';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute wraps private routes and redirects unauthenticated users to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * AppRouter defines public and private routes. Private routes render within the
 * authenticated application layout (Header + Sidebar + Content).
 */
// PUBLIC_INTERFACE
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="layout">
                <Header />
                <Sidebar />
                <main className="content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/employees" element={<EmployeesList />} />
                    <Route path="/employees/new" element={<EmployeeCreate />} />
                    <Route path="/employees/:id" element={<EmployeeDetail />} />
                    <Route path="/employees/:id/edit" element={<EmployeeEdit />} />
                    {/* Default route for authenticated users */}
                    <Route index element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
