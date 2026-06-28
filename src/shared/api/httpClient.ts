// Cliente HTTP central da aplicacao (Axios). Adiciona automaticamente o token de
// acesso em cada requisicao e implementa o fluxo de refresh: ao receber 401,
// tenta renovar o token uma vez e refazer a requisicao original. Falhando o
// refresh, limpa os tokens e redireciona ao login. Um segundo cliente isolado
// (refreshClient) faz o refresh sem cair nos proprios interceptors.
import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';

// Chaves usadas para guardar os tokens no localStorage.
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Config de requisicao com a flag `_retry`, que evita refresh em loop infinito.
type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// Formato da resposta do endpoint de refresh (novos tokens).
type RefreshResponse = {
  dados: {
    accessToken: string;
    refreshToken: string;
  };
};

// Instancia principal usada por toda a aplicacao para chamar a API.
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Cliente separado para o refresh, sem interceptors (evita recursao no 401).
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Promessa de refresh em andamento, compartilhada para deduplicar chamadas simultaneas.
let refreshPromise: Promise<string> | null = null;

// Remove ambos os tokens do armazenamento local.
const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Redireciona para o login, evitando recarregar se ja estiver nele.
const redirectToLogin = () => {
  if (globalThis.location.pathname !== '/login') {
    globalThis.location.href = '/login';
  }
};

// Endpoints de autenticacao que NAO devem disparar o fluxo de refresh no 401.
const isAuthEndpoint = (url?: string) => (
  url?.includes('/autenticacao/login') ||
  url?.includes('/autenticacao/sair') ||
  url?.includes('/autenticacao/atualizar-token')
);

/**
 * Renova os tokens usando o refresh token salvo e persiste os novos valores.
 * @returns o novo access token
 * @throws Error se nao houver refresh token armazenado
 */
const refreshTokens = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error('Refresh token inexistente.');
  }

  const { data } = await refreshClient.post<RefreshResponse>('/autenticacao/atualizar-token', {
    refreshToken,
  });

  localStorage.setItem(ACCESS_TOKEN_KEY, data.dados.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.dados.refreshToken);

  return data.dados.accessToken;
};

/**
 * Garante um access token renovado reaproveitando um refresh em andamento, para
 * que multiplas requisicoes que falharem com 401 ao mesmo tempo compartilhem
 * uma unica chamada de refresh.
 */
const getFreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

// Interceptor de requisicao: injeta o header Authorization quando ha token.
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: em caso de 401, tenta renovar o token e repetir a chamada.
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // So tenta refresh para 401 "genuino": ignora se ja repetiu ou se e endpoint de auth.
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // Marca para nao tentar refresh novamente nesta mesma requisicao.
    originalRequest._retry = true;

    try {
      // Renova o token e refaz a requisicao original com o novo Authorization.
      const accessToken = await getFreshAccessToken();

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return httpClient(originalRequest) as Promise<AxiosResponse>;
    } catch (refreshError) {
      // Refresh falhou: sessao encerrada, limpa tokens e volta ao login.
      clearAuthTokens();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);
