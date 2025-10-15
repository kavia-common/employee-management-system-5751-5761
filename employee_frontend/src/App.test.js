import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * In authenticated mode, unauthenticated users should see the login page first.
 */
test('renders login page by default when unauthenticated', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /login/i });
  expect(heading).toBeInTheDocument();
});
