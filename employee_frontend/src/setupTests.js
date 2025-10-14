/**
 * Jest setup for React Testing Library and DOM environment
 * - Adds jest-dom matchers
 * - Mocks browser APIs used in the app for stable tests
 */
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Make userEvent globally available if needed
global.userEvent = userEvent;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock crypto.randomUUID for tests
if (!global.crypto) {
  global.crypto = {};
}
if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => 'test-correlation-id';
}
