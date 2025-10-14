import React from 'react';
import { NavLink } from 'react-router-dom';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '10px 12px',
  marginBottom: 6,
  borderRadius: 6,
  color: isActive ? '#fff' : 'var(--text)',
  background: isActive ? 'var(--color-primary)' : 'transparent',
  textDecoration: 'none',
  fontWeight: 600,
});

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Sidebar Navigation">
      <nav aria-label="Main Navigation">
        <NavLink to="/dashboard" style={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/employees" style={linkStyle}>
          Employees
        </NavLink>
      </nav>
    </aside>
  );
}
