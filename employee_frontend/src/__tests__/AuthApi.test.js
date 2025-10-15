import React from 'react';

describe('API client baseURL configuration (stub mode)', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('client normalizes baseURL by removing trailing slash from REACT_APP_API_BASE_URL', async () => {
    const axiosCreateMock = jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }));
    jest.doMock('axios', () => ({ create: axiosCreateMock }));

    process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001/';
    process.env.REACT_APP_LOG_LEVEL = 'error';

    await import('../api/client');

    const callArgs = axiosCreateMock.mock.calls[0][0] || {};
    expect(callArgs.baseURL).toBe('http://localhost:3001');
  });

  test('client falls back to http://localhost:3001 when running on localhost:3000', async () => {
    const axiosCreateMock = jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }));
    jest.doMock('axios', () => ({ create: axiosCreateMock }));

    delete process.env.REACT_APP_API_BASE_URL;
    process.env.REACT_APP_LOG_LEVEL = 'error';

    const originalLocation = window.location;
    delete window.location;
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

    window.location = originalLocation;
  });

  test('client replaces :3000 with :3001 for preview origin when env is missing', async () => {
    const axiosCreateMock = jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    }));
    jest.doMock('axios', () => ({ create: axiosCreateMock }));

    delete process.env.REACT_APP_API_BASE_URL;
    process.env.REACT_APP_LOG_LEVEL = 'error';

    const originalLocation = window.location;
    delete window.location;
    window.location = {
      hostname: 'vscode-internal-22821-beta.beta01.cloud.kavia.ai',
      port: '3000',
      protocol: 'https:',
      pathname: '/',
      assign: jest.fn(),
    };

    await import('../api/client');

    const callArgs = axiosCreateMock.mock.calls[0][0] || {};
    expect(callArgs.baseURL).toBe('https://vscode-internal-22821-beta.beta01.cloud.kavia.ai:3001');

    window.location = originalLocation;
  });
});
