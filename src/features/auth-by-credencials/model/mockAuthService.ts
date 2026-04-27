import type { User } from '../../../entities/user/model/types';
import type { LoginResponse } from './authService';

const MOCK_EMAIL = 'aluno@unb.br';
const DISABLED_EMAIL = 'desativado@unb.br';

const MOCK_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Joao Jose',
  email: MOCK_EMAIL,
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasilia',
  period: 3,
};

export const loginWithMockCredencials = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  void password;

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === DISABLED_EMAIL) {
    throw new Error('Conta desativada. Entre em contato com o administrador.');
  }

  if (normalizedEmail === MOCK_EMAIL) {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  throw new Error('Email ou senha invalidos');
};

export const getAuthenticatedUserMock = async (): Promise<User> => MOCK_USER;
