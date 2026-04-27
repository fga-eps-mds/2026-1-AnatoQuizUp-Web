jest.mock('../config/env', () => ({
  API_BASE_URL: 'https://api.test',
}));

const mockPost = jest.fn();
const mockMainClientRequest = jest.fn();

type InterceptorPair = {
  fulfilled: (value: unknown) => unknown;
  rejected?: (error: unknown) => unknown;
};

jest.mock('axios', () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn((config) => {
        const client = Object.assign(jest.fn(mockMainClientRequest), {
          defaults: { baseURL: config.baseURL },
          interceptors: {
            request: {
              handlers: [] as InterceptorPair[],
              use: jest.fn((fulfilled, rejected) => {
                client.interceptors.request.handlers.push({ fulfilled, rejected });
              }),
            },
            response: {
              handlers: [] as InterceptorPair[],
              use: jest.fn((fulfilled, rejected) => {
                client.interceptors.response.handlers.push({ fulfilled, rejected });
              }),
            },
          },
          post: mockPost,
        });

        return client;
      }),
    },
  };
});

import type { InternalAxiosRequestConfig } from 'axios';
import { httpClient } from './httpClient';

const getRequestInterceptor = () => {
  const requestInterceptors = httpClient.interceptors.request as unknown as {
    handlers: InterceptorPair[];
  };
  return requestInterceptors.handlers[0].fulfilled;
};

const getResponseErrorInterceptor = () => {
  const responseInterceptors = httpClient.interceptors.response as unknown as {
    handlers: InterceptorPair[];
  };
  const rejected = responseInterceptors.handlers[0].rejected;

  if (!rejected) {
    throw new Error('Response error interceptor nao registrado.');
  }

  return rejected;
};

describe('httpClient', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPost.mockReset();
    mockMainClientRequest.mockReset();
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: {
        pathname: '/home',
        href: '/home',
      },
    });
  });

  it('uses the configured API base URL', () => {
    expect(httpClient.defaults.baseURL).toBe('https://api.test');
  });

  it('adds the bearer token to requests when it exists', async () => {
    localStorage.setItem('access_token', 'access-token');

    const config = await getRequestInterceptor()({
      headers: {} as InternalAxiosRequestConfig['headers'],
    } as InternalAxiosRequestConfig) as InternalAxiosRequestConfig;

    expect(config.headers.Authorization).toBe('Bearer access-token');
  });

  it('keeps requests untouched when no token is stored', async () => {
    const config = await getRequestInterceptor()({
      headers: {} as InternalAxiosRequestConfig['headers'],
    } as InternalAxiosRequestConfig) as InternalAxiosRequestConfig;

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('renews tokens and retries the original request on 401', async () => {
    localStorage.setItem('refresh_token', 'refresh-token-antigo');
    mockPost.mockResolvedValueOnce({
      data: {
        dados: {
          accessToken: 'novo-access-token',
          refreshToken: 'novo-refresh-token',
        },
      },
    });
    mockMainClientRequest.mockResolvedValueOnce({ data: { ok: true } });
    const originalRequest = {
      url: '/auth/me',
      headers: {},
    };

    await expect(
      getResponseErrorInterceptor()({
        response: { status: 401 },
        config: originalRequest,
      }),
    ).resolves.toEqual({ data: { ok: true } });

    expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'refresh-token-antigo',
    });
    expect(localStorage.getItem('access_token')).toBe('novo-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('novo-refresh-token');
    expect(originalRequest.headers).toEqual({
      Authorization: 'Bearer novo-access-token',
    });
    expect(originalRequest).toMatchObject({ _retry: true });
    expect(mockMainClientRequest).toHaveBeenCalledWith(originalRequest);
  });

  it('shares the same refresh request between concurrent 401 responses', async () => {
    localStorage.setItem('refresh_token', 'refresh-token-antigo');
    mockPost.mockResolvedValueOnce({
      data: {
        dados: {
          accessToken: 'novo-access-token',
          refreshToken: 'novo-refresh-token',
        },
      },
    });
    mockMainClientRequest
      .mockResolvedValueOnce({ data: { request: 1 } })
      .mockResolvedValueOnce({ data: { request: 2 } });
    const firstRequest = {
      url: '/auth/me',
      headers: {},
    };
    const secondRequest = {
      url: '/quizzes',
      headers: {},
    };

    await Promise.all([
      getResponseErrorInterceptor()({
        response: { status: 401 },
        config: firstRequest,
      }),
      getResponseErrorInterceptor()({
        response: { status: 401 },
        config: secondRequest,
      }),
    ]);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(firstRequest.headers).toEqual({ Authorization: 'Bearer novo-access-token' });
    expect(secondRequest.headers).toEqual({ Authorization: 'Bearer novo-access-token' });
    expect(mockMainClientRequest).toHaveBeenCalledTimes(2);
  });

  it('does not try to refresh login or refresh requests', async () => {
    const loginError = {
      response: { status: 401 },
      config: { url: '/auth/login', headers: {} },
    };
    const refreshError = {
      response: { status: 401 },
      config: { url: '/auth/refresh', headers: {} },
    };

    await expect(getResponseErrorInterceptor()(loginError)).rejects.toBe(loginError);
    await expect(getResponseErrorInterceptor()(refreshError)).rejects.toBe(refreshError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('does not retry a request more than once', async () => {
    const error = {
      response: { status: 401 },
      config: { url: '/auth/me', headers: {}, _retry: true },
    };

    await expect(getResponseErrorInterceptor()(error)).rejects.toBe(error);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('does not try to refresh non 401 errors', async () => {
    const error = {
      response: { status: 500 },
      config: { url: '/auth/me', headers: {} },
    };

    await expect(getResponseErrorInterceptor()(error)).rejects.toBe(error);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('clears tokens and redirects to login when refresh fails', async () => {
    localStorage.setItem('access_token', 'access-token');
    localStorage.setItem('refresh_token', 'refresh-token');
    mockPost.mockRejectedValueOnce(new Error('refresh falhou'));

    await expect(
      getResponseErrorInterceptor()({
        response: { status: 401 },
        config: { url: '/auth/me', headers: {} },
      }),
    ).rejects.toThrow('refresh falhou');

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(globalThis.location.href).toBe('/login');
  });

  it('clears tokens and redirects to login when there is no refresh token', async () => {
    localStorage.setItem('access_token', 'access-token');

    await expect(
      getResponseErrorInterceptor()({
        response: { status: 401 },
        config: { url: '/auth/me', headers: {} },
      }),
    ).rejects.toThrow('Refresh token inexistente.');

    expect(mockPost).not.toHaveBeenCalled();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(globalThis.location.href).toBe('/login');
  });
});
