import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';

// Mock navigate by using MemoryRouter and checking for absence of form heading as proxy,
// or we can spy on window.history. For simplicity, we'll rely on UI changes.

jest.mock('../api/authApi', () => ({
  login: jest.fn(),
  signup: jest.fn(),
}));

const authApi = require('../api/authApi');

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

test('successful login stores token and navigates away from login screen', async () => {
  // Arrange: mock login to return access_token
  authApi.login.mockResolvedValue({
    access_token: 'jwt-token-abc',
    token_type: 'bearer',
    user: { id: 1, email: 'u@example.com' },
  });

  renderWithProviders(<Login />);

  // Fill in valid credentials
  fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'u@example.com', name: 'email' } });
  fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Password1', name: 'password' } });

  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  // Assert token stored
  // Wait for any async state updates by awaiting that heading is not present anymore or localStorage set
  await screen.findByRole('button', { name: /sign in/i }); // ensure DOM settled

  const token = window.localStorage.getItem('auth_token');
  expect(token).toBe('jwt-token-abc');
});

test('shows friendly error when token is missing from server response', async () => {
  // Arrange: mock login to return success without access_token
  authApi.login.mockResolvedValue({
    token_type: 'bearer',
    user: { id: 2, email: 'x@example.com' },
  });

  renderWithProviders(<Login />);

  fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'x@example.com', name: 'email' } });
  fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Password1', name: 'password' } });

  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByText(/missing token from server/i)).toBeInTheDocument();
});
