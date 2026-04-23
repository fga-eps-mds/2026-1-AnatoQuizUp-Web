import axios from 'axios';
import type { User } from '../../../entities/user/model/types';
import { httpClient } from '../../../shared/api/httpClient';

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

const MOCK_EMAIL = 'aluno@unb.br';
const DISABLED_EMAIL = 'desativado@unb.br';

const MOCK_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João José',
  email: MOCK_EMAIL,
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasília',
  period: 3,
};

export const loginWithCredencials = async (email: string, password: string): Promise<LoginResponse> => {
  if (email === MOCK_EMAIL) {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: MOCK_USER,
    };
  }

  if (email === DISABLED_EMAIL) {
    throw new Error('Conta desativada. Entre em contato com o administrador.');
  }

  try {
    const { data } = await httpClient.post<BackendLoginResponse>('/api/auth/login', { email, password });
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
        throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
      }

      const message = (err.response.data as { message?: string })?.message;

      if (err.response.status === 401) {
        throw new Error(message ?? 'Email ou senha inválidos');
      }

      if (err.response.status === 403) {
        throw new Error(message ?? 'Conta desativada. Entre em contato com o administrador.');
      }
    }

    throw new Error('Erro ao entrar. Tente novamente.');
  }
};
