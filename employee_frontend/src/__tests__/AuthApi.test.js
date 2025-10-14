import React from 'react';

describe('authApi and API client configuration', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('signup uses /auth/signup path (matches backend routes)', async () => {
    // Mock axios.create to capture the client instance methods
    const postMock = jest.fn(() => Promise.resolve({ data: { ok: true } }));
    const axiosCreateMock = jest.fn(() => ({
      post: postMock,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }));

    jest.doMock('axios', () => ({ create: axiosCreateMock }));

    // Set env BEFORE importing modules that read them at module load time
    process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
    process.env.REACT_APP_LOG_LEVEL = 'error';

    // Import after mocks/env are set
    const authApi = await import('../api/authApi');

    await authApi.signup({ email: 'user@example.com', password: 'password123' });

    expect(postMock).toHaveBeenCalledTimes(1);
    // Ensure the path matches backend: '/auth/signup'
    expect(postMock.mock.calls[0][0]).toBe('/auth/signup');
  });

  test('client normalizes baseURL by removing trailing slash from REACT_APP_API_BASE_URL', async () => {
    const axiosCreateMock = jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      // we won't use post here; focus on config passed to create
    }));
    jest.doMock('axios', () => ({ create: axiosCreateMock }));

    process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001/';
    process.env.REACT_APP_LOG_LEVEL = 'error';

    await import('../api/client');

    // Verify axios.create was called with normalized baseURL
    const callArgs = axiosCreateMock.mock.calls[0][0] || {};
    expect(callArgs.baseURL).toBe('http://localhost:3001');
  });

  test('client falls back to http://localhost:3001 in local dev when env missing', async () => {
    const axiosCreateMock = jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }));
    jest.doMock('axios', () => ({ create: axiosCreateMock }));

    // Ensure env is not set
    delete process.env.REACT_APP_API_BASE_URL;
    process.env.REACT_APP_LOG_LEVEL = 'error';

    // Mock window.location for local dev scenario
    const originalLocation = window.location;
    delete window.location;
    // minimal shape used by client
    window.location = {
      hostname: 'localhost',
      port: '3000',
      protocol: 'http:',
      pathname: '/',
      assign: jest.fn(),
    };

    await import('../api/client');

    const callArgs = axiosCreateMock.mock.calls[0][0] || {};
    expect(callArgs.baseURL).toBe('http://localhost:3001');

    // Restore window.location
    window.location = originalLocation;
  });
});
