jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

import { httpClient } from '../../../shared/api/httpClient';
import { loginWithCredencials } from './authService';

const postMock = httpClient.post as jest.Mock;

describe('loginWithCredencials', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the mock student without calling the API', async () => {
    const result = await loginWithCredencials('aluno@unb.br', 'any-password');

    expect(postMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        email: 'aluno@unb.br',
        role: 'STUDENT',
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      },
    });
  });

  it('throws the disabled account message before calling the API', async () => {
    await expect(loginWithCredencials('desativado@unb.br', 'secret')).rejects.toThrow(
      'Conta desativada. Entre em contato com o administrador.',
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it('maps a successful backend login response to the auth user shape', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        accessToken: 'api-access',
        refreshToken: 'api-refresh',
        user: {
          id: 'user-1',
          name: 'Professor UnB',
          email: 'professor@unb.br',
          role: 'PROFESSOR',
        },
      },
    });

    const result = await loginWithCredencials('professor@unb.br', 'secret');

    expect(postMock).toHaveBeenCalledWith('/api/auth/login', {
      email: 'professor@unb.br',
      password: 'secret',
    });
    expect(result).toEqual({
      accessToken: 'api-access',
      refreshToken: 'api-refresh',
      user: {
        id: 'user-1',
        name: 'Professor UnB',
        email: 'professor@unb.br',
        role: 'PROFESSOR',
        status: 'ACTIVE',
        authProvider: 'LOCAL',
      },
    });
  });

  it('throws a friendly message when the backend is unreachable', async () => {
    postMock.mockRejectedValueOnce({ isAxiosError: true });

    await expect(loginWithCredencials('professor@unb.br', 'secret')).rejects.toThrow(
      'Não foi possível conectar ao servidor. Tente novamente.',
    );
  });

  it('throws the backend message for invalid credentials', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Credenciais inválidas' },
      },
    });

    await expect(loginWithCredencials('professor@unb.br', 'wrong')).rejects.toThrow('Credenciais inválidas');
  });

  it('throws a generic message for unexpected errors', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 500,
        data: {},
      },
    });

    await expect(loginWithCredencials('professor@unb.br', 'secret')).rejects.toThrow(
      'Erro ao entrar. Tente novamente.',
    );
  });
});
