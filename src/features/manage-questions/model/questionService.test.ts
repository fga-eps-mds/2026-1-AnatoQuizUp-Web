const getMock = jest.fn();
const putMock = jest.fn();
const deleteMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  getMock.mockReset();
  putMock.mockReset();
  deleteMock.mockReset();

  jest.doMock('../../../shared/api/httpClient', () => ({
    httpClient: {
      get: getMock,
      put: putMock,
      delete: deleteMock,
    },
  }));

  jest.doMock('../../../shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  return import('./questionService');
};

const apiQuestion = {
  id: 'questao-api-001',
  tema: {
    id: 'tema-api',
    nome: 'Sistema Cardiovascular',
  },
  enunciado: 'Qual camara do coracao bombeia sangue para a aorta?',
  tipo: 'MULTIPLA_ESCOLHA',
  dificuldade: 'MEDIA',
  imagem: 'https://exemplo.com/coracao.png',
  alternativaCorreta: 'B',
  explicacaoPedagogica: 'O ventriculo esquerdo e responsavel pela circulacao sistemica.',
  alternativas: {
    A: 'Atrio direito',
    B: 'Ventriculo esquerdo',
    C: 'Atrio esquerdo',
    D: 'Ventriculo direito',
    E: 'Veia cava',
  },
  status: 'ATIVO',
  criadoPorId: 'professor-api',
  criadoEm: '2026-05-10T16:56:14.952Z',
  atualizadoEm: '2026-05-10T16:56:14.952Z',
  excluidoEm: null,
};

describe('questionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns mocked professor questions without calling the API when mocks are enabled', async () => {
    const { listarQuestoesProfessor } = await loadService(true);

    const result = await listarQuestoesProfessor();

    expect(getMock).not.toHaveBeenCalled();
    expect(result.total).toBe(2);
    expect(result.questoes[0]).toMatchObject({
      id: 'cmp00lkko00014hlq1ra3432j',
      tipo: 'MULTIPLA_ESCOLHA',
      dificuldade: 'MEDIA',
      alternativaCorreta: 'B',
      status: 'ATIVO',
      tema: {
        id: 'cmozy4dxz00004h3xbjzw5vdv',
        nome: 'Sistema Cardiovascular',
      },
      alternativas: {
        B: 'Ventriculo esquerdo',
      },
    });
    expect(result.questoes[0]).not.toHaveProperty('tipoQuestao');
  });

  it('loads paginated questions from the API when mocks are disabled', async () => {
    const { listarQuestoes } = await loadService(false);
    getMock.mockResolvedValueOnce({
      data: {
        dados: [apiQuestion],
        metadados: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    });

    const result = await listarQuestoes({ page: 1, limit: 10 });

    expect(getMock).toHaveBeenCalledWith('/questoes', {
      params: { page: 1, limit: 10 },
    });
    expect(result).toMatchObject({
      dados: [{ id: 'questao-api-001' }],
      metadados: { total: 1 },
    });
  });

  it('calls the filter, find by id, update and delete endpoints', async () => {
    const {
      atualizarQuestao,
      buscarQuestaoPorFiltro,
      buscarQuestaoPorId,
      removerQuestao,
    } = await loadService(false);

    getMock
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } })
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } });
    putMock.mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } });
    deleteMock.mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } });

    await buscarQuestaoPorFiltro({ q: 'cardio' });
    await buscarQuestaoPorId('questao-api-001');
    await atualizarQuestao('questao-api-001', { dificuldade: 'DIFICIL' });
    await removerQuestao('questao-api-001');

    expect(getMock).toHaveBeenNthCalledWith(1, '/questoes/busca', {
      params: { q: 'cardio' },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/questoes/questao-api-001');
    expect(putMock).toHaveBeenCalledWith('/questoes/questao-api-001', {
      dificuldade: 'DIFICIL',
    });
    expect(deleteMock).toHaveBeenCalledWith('/questoes/questao-api-001');
  });
});
