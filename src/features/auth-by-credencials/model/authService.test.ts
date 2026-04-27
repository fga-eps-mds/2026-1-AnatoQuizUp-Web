const postMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  postMock.mockReset();

  jest.doMock('../../../shared/api/httpClient', () => ({
    httpClient: {
      post: postMock,
    },
  }));

  jest.doMock('../../../shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  return import('./authService');
};

describe('loginWithCredencials', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the mock student without calling the API when mocks are enabled', async () => {
    const { loginWithCredencials } = await loadService(true);

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

  it('throws the disabled account message before calling the API when mocks are enabled', async () => {
    const { loginWithCredencials } = await loadService(true);

    await expect(loginWithCredencials('desativado@unb.br', 'secret')).rejects.toThrow(
      'Conta desativada. Entre em contato com o administrador.',
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it('maps a successful backend login response to the auth user shape when mocks are disabled', async () => {
    const { loginWithCredencials } = await loadService(false);
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

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
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
    const { loginWithCredencials } = await loadService(false);
    postMock.mockRejectedValueOnce({ isAxiosError: true });

    await expect(loginWithCredencials('professor@unb.br', 'secret')).rejects.toThrow(
      'Nao foi possivel conectar ao servidor. Tente novamente.',
    );
  });

  it('throws the backend message for invalid credentials', async () => {
    const { loginWithCredencials } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 401,
        data: { erro: { mensagem: 'Credenciais invalidas' } },
      },
    });

    await expect(loginWithCredencials('professor@unb.br', 'wrong')).rejects.toThrow(
      'Credenciais invalidas',
    );
  });

  it('throws a generic message for unexpected errors', async () => {
    const { loginWithCredencials } = await loadService(false);
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
