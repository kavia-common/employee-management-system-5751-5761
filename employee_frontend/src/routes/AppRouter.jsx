import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/Employees/List';
import EmployeeCreate from '../pages/Employees/Create';
import EmployeeEdit from '../pages/Employees/Edit';
import EmployeeDetail from '../pages/Employees/Detail';
import Login from '../pages/Login';
import { seedIfEmpty } from '../services/mockApi';
import ProtectedRoute from './ProtectedRoute';

/**
 * AppRouter defines application routes.
 * - /login is public.
 * - Main app routes (/dashboard, /employees/*) are protected via ProtectedRoute and require
 *   a stub session (session.displayName) from AppContext.
 * - Default routes redirect to /dashboard (which, if not authenticated, will redirect to /login).
 */

// PUBLIC_INTERFACE
export default function AppRouter() {
  // Initialize mock dataset on first load for richer demo data
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <BrowserRouter>
      <div className="layout">
        <Header />
        <Sidebar />
        <main className="content">
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeesList />} />
              <Route path="/employees/new" element={<EmployeeCreate />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route path="/employees/:id/edit" element={<EmployeeEdit />} />
            </Route>

            {/* Defaults */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
