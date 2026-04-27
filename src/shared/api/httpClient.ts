import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  dados: {
    accessToken: string;
    refreshToken: string;
  };
};

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string> | null = null;

const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const redirectToLogin = () => {
  if (globalThis.location.pathname !== '/login') {
    globalThis.location.href = '/login';
  }
};

const isAuthEndpoint = (url?: string) => (
  url?.includes('/auth/login') ||
  url?.includes('/auth/logout') ||
  url?.includes('/auth/refresh')
);

const refreshTokens = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error('Refresh token inexistente.');
  }

  const { data } = await refreshClient.post<RefreshResponse>('/auth/refresh', {
    refreshToken,
  });

  localStorage.setItem(ACCESS_TOKEN_KEY, data.dados.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.dados.refreshToken);

  return data.dados.accessToken;
};

const getFreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await getFreshAccessToken();

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return httpClient(originalRequest) as Promise<AxiosResponse>;
    } catch (refreshError) {
      clearAuthTokens();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);
