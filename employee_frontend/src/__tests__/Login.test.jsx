import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

function renderWithProviders(ui, { route = '/login' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthProvider>
  );
}

test('renders login form fields and validates empty submission', async () => {
  renderWithProviders(<Login />);

  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  const email = screen.getByTestId('email-input');
  const password = screen.getByTestId('password-input');
  expect(email).toBeInTheDocument();
  expect(password).toBeInTheDocument();

  const submit = screen.getByRole('button', { name: /sign in/i });
  fireEvent.click(submit);

  expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument();
});
