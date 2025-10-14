import { render, screen } from '@testing-library/react';
import App from './App';

/**
 * In pure stub mode, the app has no authentication and should render the dashboard by default.
 */
test('renders dashboard by default', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /dashboard/i });
  expect(heading).toBeInTheDocument();
});
