import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import AppRouter from '../routes/AppRouter';

function renderApp(initialRoute = '/employees') {
  window.history.pushState({}, 'Test page', initialRoute);
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="*" element={<AppRouter />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

test('redirects unauthenticated users from protected route to login', async () => {
  renderApp('/employees');
  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
