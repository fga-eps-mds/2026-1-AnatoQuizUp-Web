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
    expect(postMock).toHaveBeenCalledWith('/autenticacao/recuperar-senha', {
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
    expect(postMock).toHaveBeenCalledWith('/autenticacao/redefinir-senha', {
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

  it('throws default recovery message when error is not from Axios', async () => {
    postMock.mockRejectedValueOnce(new Error('Erro generico do JavaScript'));

    await expect(requestPasswordRecovery('aluno@unb.br')).rejects.toThrow(
      'Nao foi possivel enviar as instrucoes de recuperacao.'
    );
  });

  it('throws default reset message when Axios error has no response object', async () => {
    postMock.mockRejectedValueOnce({ isAxiosError: true }); 

    await expect(resetPassword('token', 'senha123')).rejects.toThrow(
      'Link expirado ou invalido.'
    );
  });

  it('extracts flat "mensagem" directly from response data', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          mensagem: 'Mensagem de erro flat vinda do backend',
        },
      },
    });

    await expect(requestPasswordRecovery('aluno@unb.br')).rejects.toThrow(
      'Mensagem de erro flat vinda do backend'
    );
  });

  it('extracts "message" (in english) directly from response data', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          message: 'Internal server error',
        },
      },
    });

    await expect(requestPasswordRecovery('aluno@unb.br')).rejects.toThrow(
      'Internal server error'
    );
  });

  it('throws default recovery message when response data has no recognized error fields', async () => {
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {}, 
      },
    });

    await expect(requestPasswordRecovery('aluno@unb.br')).rejects.toThrow(
      'Nao foi possivel enviar as instrucoes de recuperacao.'
    );
  });
});
