import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AppRouter from '../routes/AppRouter';

function renderApp(initialRoute = '/employees') {
  window.history.pushState({}, 'Test page', initialRoute);
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="*" element={<AppRouter />} />
      </Routes>
    </MemoryRouter>
  );
}

test('renders Employees list without requiring authentication', async () => {
  renderApp('/employees');
  expect(await screen.findByRole('heading', { name: /employees/i })).toBeInTheDocument();
});
