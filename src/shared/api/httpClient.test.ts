jest.mock('../config/env', () => ({
  API_BASE_URL: 'https://api.test',
}));

import type { InternalAxiosRequestConfig } from 'axios';
import { httpClient } from './httpClient';

type RequestInterceptor = {
  fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
};

const runRequestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const requestInterceptors = httpClient.interceptors.request as unknown as { handlers: RequestInterceptor[] };
  return requestInterceptors.handlers[0].fulfilled(config);
};

describe('httpClient', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('uses the configured API base URL', () => {
    expect(httpClient.defaults.baseURL).toBe('https://api.test');
  });

  it('adds the bearer token to requests when it exists', async () => {
    localStorage.setItem('access_token', 'access-token');

    const config = await runRequestInterceptor({
      headers: {} as InternalAxiosRequestConfig['headers'],
    } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBe('Bearer access-token');
  });

  it('keeps requests untouched when no token is stored', async () => {
    const config = await runRequestInterceptor({
      headers: {} as InternalAxiosRequestConfig['headers'],
    } as InternalAxiosRequestConfig);

    expect(config.headers.Authorization).toBeUndefined();
  });
});
