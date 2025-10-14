import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * App renders AppRouter, which redirects unauthenticated users to /login.
 * Validate the login screen heading is present.
 */
test('renders login screen by default for unauthenticated users', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /sign in/i });
  expect(heading).toBeInTheDocument();
});
