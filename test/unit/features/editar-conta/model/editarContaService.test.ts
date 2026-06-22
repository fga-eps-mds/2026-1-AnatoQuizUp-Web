/// <reference types="jest" />

const patchMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  patchMock.mockReset();

  jest.doMock('../../../../../src/shared/api/httpClient', () => ({
    httpClient: {
      patch: patchMock,
    },
  }));

  jest.doMock('../../../../../src/shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  return import('../../../../../src/features/editar-conta/model/editarContaService');
};

describe('editarContaService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('atualiza dados pessoais pela API com payload normalizado', async () => {
    const { atualizarDadosPessoais } = await loadService(false);
    patchMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await atualizarDadosPessoais({
      nome: '  Joao Novo  ',
      nickname: ' Joao_Novo ',
    });

    expect(patchMock).toHaveBeenCalledWith('/usuarios/eu', {
      nome: 'Joao Novo',
      nickname: 'joao_novo',
    });
  });

  it('usa mensagens padrao dos erros especificos quando nenhuma mensagem e informada', async () => {
    const { ApelidoEmUsoError, SenhaAtualIncorretaError } = await loadService(false);

    expect(new ApelidoEmUsoError().message).toBe('Este apelido ja esta em uso.');
    expect(new SenhaAtualIncorretaError().message).toBe('Senha atual incorreta.');
  });

  it('mapeia conflito de apelido para ApelidoEmUsoError', async () => {
    const { ApelidoEmUsoError, atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          erro: {
            mensagem: 'Ja existe um usuario cadastrado com este nickname.',
            detalhes: { nickname: 'joao' },
          },
        },
      },
    });

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'joao',
    })).rejects.toEqual(
      new ApelidoEmUsoError('Ja existe um usuario cadastrado com este nickname.'),
    );
  });

  it('extrai erro de apelido quando detalhes vem em array', async () => {
    const { ApelidoEmUsoError, atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            detalhes: [{ campo: 'nickname', mensagem: 'Nickname contem caracteres invalidos.' }],
          },
        },
      },
    });

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'joao',
    })).rejects.toEqual(new ApelidoEmUsoError('Nickname contem caracteres invalidos.'));
  });

  it('extrai erro de apelido quando detalhes vem com errors aninhado', async () => {
    const { ApelidoEmUsoError, atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            detalhes: {
              nickname: { errors: ['Nickname deve comecar com letra.'] },
            },
          },
        },
      },
    });

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: '1joao',
    })).rejects.toEqual(new ApelidoEmUsoError('Nickname deve comecar com letra.'));
  });

  it('retorna mensagem generica quando erro de dados pessoais nao e Axios', async () => {
    const { atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce(new Error('falha js'));

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'joao',
    })).rejects.toThrow('Nao foi possivel salvar suas informacoes. Tente novamente.');
  });

  it('retorna mensagem de conexao quando API nao responde nos dados pessoais', async () => {
    const { atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce({ isAxiosError: true });

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'joao',
    })).rejects.toThrow('Nao foi possivel conectar ao servidor. Tente novamente.');
  });

  it('retorna mensagem do backend em erro generico de dados pessoais', async () => {
    const { atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 500,
        data: { mensagem: 'Falha inesperada ao salvar.' },
      },
    });

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'joao',
    })).rejects.toThrow('Falha inesperada ao salvar.');
  });

  it('ignora detalhes sem mensagem de campo e usa mensagem geral de dados pessoais', async () => {
    const { atualizarDadosPessoais } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            mensagem: 'Campos invalidos.',
            detalhes: {
              nickname: { errors: [] },
            },
          },
        },
      },
    });

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'joao',
    })).rejects.toThrow('Campos invalidos.');
  });

  it('usa mock de dados pessoais quando mocks estao ativos', async () => {
    const { atualizarDadosPessoais } = await loadService(true);
    const { getAuthenticatedUserMock } = await import(
      '../../../../../src/features/auth-by-credencials/model/mockAuthService'
    );

    await atualizarDadosPessoais({
      nome: '  Maria Nova  ',
      nickname: ' Maria_Nova ',
    });

    await expect(getAuthenticatedUserMock()).resolves.toMatchObject({
      name: 'Maria Nova',
      nickname: 'maria_nova',
    });
    expect(patchMock).not.toHaveBeenCalled();
  });

  it('mock de dados pessoais simula apelido em uso', async () => {
    const { ApelidoEmUsoError, atualizarDadosPessoais } = await loadService(true);

    await expect(atualizarDadosPessoais({
      nome: 'Joao',
      nickname: 'em_uso',
    })).rejects.toEqual(
      new ApelidoEmUsoError('Ja existe um usuario cadastrado com este nickname.'),
    );
  });

  it('altera senha pela API', async () => {
    const { alterarSenha } = await loadService(false);
    patchMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await alterarSenha({
      senhaAtual: 'atual123',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    });

    expect(patchMock).toHaveBeenCalledWith('/usuarios/eu/senha', {
      senhaAtual: 'atual123',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    });
  });

  it('mapeia senha atual incorreta para SenhaAtualIncorretaError', async () => {
    const { SenhaAtualIncorretaError, alterarSenha } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            codigo: 'REQUISICAO_INVALIDA',
            mensagem: 'Senha atual incorreta.',
          },
        },
      },
    });

    await expect(alterarSenha({
      senhaAtual: 'errada',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).rejects.toEqual(new SenhaAtualIncorretaError('Senha atual incorreta.'));
  });

  it('mantem erro de validacao de senha como erro generico de formulario', async () => {
    const { SenhaAtualIncorretaError, alterarSenha } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            codigo: 'ERRO_DE_VALIDACAO',
            mensagem: 'A confirmacao nao corresponde a nova senha.',
          },
        },
      },
    });

    try {
      await alterarSenha({
        senhaAtual: 'atual123',
        novaSenha: 'nova1234',
        confirmacaoNovaSenha: 'diferente',
      });
      throw new Error('Nao deveria resolver');
    } catch (err) {
      expect(err).not.toBeInstanceOf(SenhaAtualIncorretaError);
      expect(err).toEqual(new Error('A confirmacao nao corresponde a nova senha.'));
    }
  });

  it('extrai senha atual incorreta de detalhes em properties', async () => {
    const { SenhaAtualIncorretaError, alterarSenha } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            codigo: 'ERRO_DE_VALIDACAO',
            detalhes: {
              properties: {
                senhaAtual: { errors: ['Senha atual incorreta.'] },
              },
            },
          },
        },
      },
    });

    await expect(alterarSenha({
      senhaAtual: 'errada',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).rejects.toEqual(new SenhaAtualIncorretaError('Senha atual incorreta.'));
  });

  it('mapeia senha atual incorreta pela mensagem do backend', async () => {
    const { SenhaAtualIncorretaError, alterarSenha } = await loadService(false);
    patchMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          erro: {
            mensagem: 'Senha atual incorreta.',
          },
        },
      },
    });

    await expect(alterarSenha({
      senhaAtual: 'errada',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).rejects.toEqual(new SenhaAtualIncorretaError('Senha atual incorreta.'));
  });

  it('retorna mensagem generica quando erro de senha nao e Axios', async () => {
    const { alterarSenha } = await loadService(false);
    patchMock.mockRejectedValueOnce(new Error('falha js'));

    await expect(alterarSenha({
      senhaAtual: 'atual123',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).rejects.toThrow('Nao foi possivel alterar a senha. Tente novamente.');
  });

  it('retorna mensagem de conexao quando API de senha nao responde', async () => {
    const { alterarSenha } = await loadService(false);
    patchMock.mockRejectedValueOnce({ isAxiosError: true });

    await expect(alterarSenha({
      senhaAtual: 'atual123',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).rejects.toThrow('Nao foi possivel conectar ao servidor. Tente novamente.');
  });

  it('mock de senha simula senha atual incorreta', async () => {
    const { SenhaAtualIncorretaError, alterarSenha } = await loadService(true);

    await expect(alterarSenha({
      senhaAtual: 'errada',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).rejects.toEqual(new SenhaAtualIncorretaError('Senha atual incorreta.'));
    expect(patchMock).not.toHaveBeenCalled();
  });

  it('mock de senha rejeita nova senha igual a atual', async () => {
    const { alterarSenha } = await loadService(true);

    await expect(alterarSenha({
      senhaAtual: 'atual123',
      novaSenha: 'atual123',
      confirmacaoNovaSenha: 'atual123',
    })).rejects.toThrow('A nova senha deve ser diferente da senha atual.');
    expect(patchMock).not.toHaveBeenCalled();
  });

  it('mock de senha aceita senha atual correta e nova diferente', async () => {
    const { alterarSenha } = await loadService(true);

    await expect(alterarSenha({
      senhaAtual: 'atual123',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    })).resolves.toBeUndefined();
    expect(patchMock).not.toHaveBeenCalled();
  });
});
