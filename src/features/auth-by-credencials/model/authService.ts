import axios from 'axios';
import type { User } from '../../../entities/user/model/types';
import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import { loginWithMockCredencials } from './mockAuthService';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: User['role'];
  };
}

export const loginWithCredencials = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  if (USE_MOCKS) {
    return loginWithMockCredencials(email, password);
  }

  try {
    const { data } = await httpClient.post<BackendLoginResponse>('/auth/login', {
      email,
      password,
    });

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        ...data.user,
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      },
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error('Nao foi possivel conectar ao servidor. Tente novamente.');
      }

      const responseData = err.response.data as {
        message?: string;
        mensagem?: string;
        erro?: { mensagem?: string };
      };
      const message = responseData.erro?.mensagem ?? responseData.mensagem ?? responseData.message;

      if (err.response.status === 401) {
        throw new Error(message ?? 'Email ou senha invalidos');
      }

      if (err.response.status === 403) {
        throw new Error(message ?? 'Conta desativada. Entre em contato com o administrador.');
      }
    }

    throw new Error('Erro ao entrar. Tente novamente.');
  }
};
