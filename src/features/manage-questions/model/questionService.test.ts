const getMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  getMock.mockReset();

  jest.doMock('../../../shared/api/httpClient', () => ({
    httpClient: {
      get: getMock,
    },
  }));

  jest.doMock('../../../shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  return import('./questionService');
};

describe('listarQuestoesProfessor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns mocked professor questions without calling the API when mocks are enabled', async () => {
    const { listarQuestoesProfessor } = await loadService(true);

    const result = await listarQuestoesProfessor();

    expect(getMock).not.toHaveBeenCalled();
    expect(result.total).toBe(2);
    expect(result.questoes[0]).toMatchObject({
      id: 'questao-mock-001',
      tipoQuestao: 'MULTIPLA_ESCOLHA',
      respostaCorreta: 'C',
      status: 'ATIVO',
      feitoPorIa: false,
      tema: {
        id: 'tema-imagem',
        nome: 'Imagem',
      },
      alternativas: {
        alternativaC: 'Perda de volume com desvio de fissuras, hilo ou mediastino',
      },
    });
    expect(result.questoes[0]).not.toHaveProperty('dificuldade');
  });

  it('loads professor questions from the API when mocks are disabled', async () => {
    const { listarQuestoesProfessor } = await loadService(false);
    getMock.mockResolvedValueOnce({
      data: {
        mensagem: 'ok',
        dados: {
          total: 1,
          questoes: [
            {
              id: 'questao-api-001',
              enunciado: 'Questao da API',
              tipoQuestao: 'CERTO_ERRADO',
              respostaCorreta: 'E',
              saibaMais: null,
              status: 'ATIVO',
              feitoPorIa: false,
              urlImagem: null,
              criadoPorId: 'professor-api',
              temaId: 'tema-api',
              questaoOriginalId: null,
              tema: {
                id: 'tema-api',
                nome: 'Anatomia',
                criadoEm: '2025-04-01T10:00:00.000Z',
                atualizadoEm: '2025-04-01T10:00:00.000Z',
                excluidoEm: null,
              },
              alternativas: null,
              criadoEm: '2025-04-01T10:00:00.000Z',
              atualizadoEm: '2025-04-01T10:00:00.000Z',
              excluidoEm: null,
            },
          ],
        },
      },
    });

    const result = await listarQuestoesProfessor();

    expect(getMock).toHaveBeenCalledWith('/questoes');
    expect(result).toMatchObject({
      total: 1,
      questoes: [{ id: 'questao-api-001' }],
    });
  });
});
