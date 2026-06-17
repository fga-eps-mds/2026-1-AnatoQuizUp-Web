import type { User } from '../../../entities/user/model/types';
import type { LoginResponse } from './authService';

const STUDENT_EMAIL = 'aluno@unb.br';
const PROFESSOR_EMAIL = 'professor@unb.br';
const DISABLED_EMAIL = 'desativado@unb.br';

const STUDENT_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Joao Jose',
  nickname: 'joaojose',
  email: STUDENT_EMAIL,
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasilia',
  period: 3,
};

const PROFESSOR_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Professor UnB',
  nickname: null,
  email: PROFESSOR_EMAIL,
  role: 'PROFESSOR',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: null,
  institution: 'Universidade de Brasilia',
  period: null,
};

const STUDENT_TOKENS: LoginResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

const PROFESSOR_TOKENS: LoginResponse = {
  accessToken: 'mock-professor-access-token',
  refreshToken: 'mock-professor-refresh-token',
};

let authenticatedMockUser: User = STUDENT_USER;

const getStoredAccessToken = (): string | null => {
  try {
    return globalThis.localStorage?.getItem('access_token') ?? null;
  } catch {
    return null;
  }
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

  if (normalizedEmail === STUDENT_EMAIL) {
    authenticatedMockUser = STUDENT_USER;
    return STUDENT_TOKENS;
  }

  if (normalizedEmail === PROFESSOR_EMAIL) {
    authenticatedMockUser = PROFESSOR_USER;
    return PROFESSOR_TOKENS;
  }

  throw new Error('Email ou senha invalidos');
};

export const getAuthenticatedUserMock = async (): Promise<User> => {
  const storedAccessToken = getStoredAccessToken();

  if (storedAccessToken === PROFESSOR_TOKENS.accessToken) {
    return PROFESSOR_USER;
  }

  if (storedAccessToken === STUDENT_TOKENS.accessToken) {
    return STUDENT_USER;
  }

  return authenticatedMockUser;
};
