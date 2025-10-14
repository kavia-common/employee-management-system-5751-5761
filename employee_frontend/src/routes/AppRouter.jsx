import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/Employees/List';
import EmployeeCreate from '../pages/Employees/Create';
import EmployeeEdit from '../pages/Employees/Edit';
import EmployeeDetail from '../pages/Employees/Detail';

/**
 * AppRouter defines open routes for pure stub mode. All routes are accessible
 * without authentication. The application renders within a simple layout.
 */
// PUBLIC_INTERFACE
export default function AppRouter() {
  return (
    <BrowserRouter>
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
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
