jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    post: jest.fn(),
  },
}));

import { httpClient } from '../../../shared/api/httpClient';
import {
  requestPasswordRecovery,
  resetPassword,
} from './recoverPasswordService';

const postMock = httpClient.post as jest.Mock;

describe('recoverPasswordService', () => {
  afterEach(() => {
    postMock.mockReset();
  });

  it('requests password recovery and returns backend message', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        mensagem: 'Se o email existir no sistema, enviamos instrucoes.',
        dados: null,
      },
    });

    await expect(requestPasswordRecovery('aluno@unb.br')).resolves.toBe(
      'Se o email existir no sistema, enviamos instrucoes.',
    );
    expect(postMock).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'aluno@unb.br',
    });
  });

  it('resets password and returns backend message', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        mensagem: 'Senha redefinida com sucesso.',
        dados: null,
      },
    });

    await expect(resetPassword('token', 'senha1234')).resolves.toBe(
      'Senha redefinida com sucesso.',
    );
    expect(postMock).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'token',
      senha: 'senha1234',
    });
  });

  it('throws backend message when password recovery fails', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          erro: {
            mensagem: 'Falha na validacao da requisicao.',
          },
        },
      },
    });

    await expect(requestPasswordRecovery('email-invalido')).rejects.toThrow(
      'Falha na validacao da requisicao.',
    );
  });

  it('throws backend message when reset token is invalid', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          erro: {
            mensagem: 'Link expirado ou invalido.',
          },
        },
      },
    });

    await expect(resetPassword('token-invalido', 'senha1234')).rejects.toThrow(
      'Link expirado ou invalido.',
    );
  });
});
