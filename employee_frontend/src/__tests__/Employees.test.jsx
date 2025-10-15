import React from 'react';
import { render, screen } from '@testing-library/react';
import AppRouter from '../routes/AppRouter';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

function renderApp(initialRoute = '/employees') {
  // Ensure BrowserRouter inside AppRouter uses the desired initial path
  window.history.pushState({}, 'Test page', initialRoute);
  return render(
    <AppProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </AppProvider>
  );
}

test('redirects unauthenticated users to Login when accessing /employees', async () => {
  renderApp('/employees');
  expect(await screen.findByRole('heading', { name: /login/i })).toBeInTheDocument();
});
