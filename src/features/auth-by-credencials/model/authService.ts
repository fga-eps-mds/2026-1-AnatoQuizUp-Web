import axios from 'axios';
import type { User } from '../../../entities/user/model/types';
import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import { getAuthenticatedUserMock, loginWithMockCredencials } from './mockAuthService';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface BackendLoginResponse {
  dados: {
    accessToken: string;
    refreshToken: string;
  };
}

type BackendPapel = 'ALUNO' | 'PROFESSOR' | 'ADMIN' | 'ADMINISTRADOR';
type BackendStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'RECUSADO';

interface BackendUsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  papel: BackendPapel;
  status: BackendStatus;
  instituicao?: string | null;
  curso?: string | null;
  periodo?: string | null;
}

interface BackendMeResponse {
  dados: {
    usuario: BackendUsuarioAutenticado;
  };
}

const mapPapelToRole = (papel: BackendPapel): User['role'] => {
  if (papel === 'ALUNO') return 'STUDENT';
  if (papel === 'PROFESSOR') return 'PROFESSOR';
  return 'ADMIN';
};

const mapStatusToUserStatus = (status: BackendStatus): User['status'] => (
  status === 'ATIVO' ? 'ACTIVE' : 'INACTIVE'
);

const mapPeriodo = (periodo?: string | null): number | null => {
  if (!periodo) return null;

  const parsedPeriodo = Number(periodo);
  return Number.isNaN(parsedPeriodo) ? null : parsedPeriodo;
};

const mapUsuarioAutenticado = (usuario: BackendUsuarioAutenticado): User => ({
  id: usuario.id,
  name: usuario.nome,
  email: usuario.email,
  role: mapPapelToRole(usuario.papel),
  status: mapStatusToUserStatus(usuario.status),
  authProvider: 'LOCAL',
  institution: usuario.instituicao ?? null,
  course: usuario.curso ?? null,
  period: mapPeriodo(usuario.periodo),
});

const extractErrorMessage = (err: unknown): string | null => {
  if (!axios.isAxiosError(err) || !err.response) return null;

  const responseData = err.response.data as {
    message?: string;
    mensagem?: string;
    erro?: { mensagem?: string };
  };

  return responseData.erro?.mensagem ?? responseData.mensagem ?? responseData.message ?? null;
};

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
      senha: password,
    });

    return {
      accessToken: data.dados.accessToken,
      refreshToken: data.dados.refreshToken,
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error('Nao foi possivel conectar ao servidor. Tente novamente.');
      }

      const message = extractErrorMessage(err);

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

export const getAuthenticatedUser = async (): Promise<User> => {
  if (USE_MOCKS) {
    return getAuthenticatedUserMock();
  }

  try {
    const { data } = await httpClient.get<BackendMeResponse>('/auth/me');

    return mapUsuarioAutenticado(data.dados.usuario);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        throw new Error('Nao foi possivel conectar ao servidor. Tente novamente.');
      }

      const message = extractErrorMessage(err);

      if (err.response.status === 401 || err.response.status === 403) {
        throw new Error(message ?? 'Sessao expirada. Faca login novamente.');
      }
    }

    throw new Error('Nao foi possivel carregar o usuario autenticado.');
  }
};
