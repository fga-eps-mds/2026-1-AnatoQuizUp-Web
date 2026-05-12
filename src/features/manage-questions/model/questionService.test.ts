/// <reference types="jest" />

const getMock = jest.fn();
const postMock = jest.fn();
const putMock = jest.fn();
const deleteMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  getMock.mockReset();
  postMock.mockReset();
  putMock.mockReset();
  deleteMock.mockReset();

  jest.doMock('../../../shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  jest.doMock('../../../shared/api/httpClient', () => ({
    httpClient: {
      get: getMock,
      post: postMock,
      put: putMock,
      delete: deleteMock,
    },
  }));

  return import('./questionService');
};

const formValues = {
  topic: 'Tórax',
  tags: 'aorta, mediastino',
  type: 'Múltipla escolha' as const,
  difficulty: 'Médio' as const,
  origin: 'Manual',
  statement: 'Qual estrutura forma a parede anterior do mediastino superior?',
  explanation: 'O manúbrio se relaciona com os grandes vasos.',
  alternatives: [
    { id: 'a', label: 'A', text: 'Esterno', isCorrect: false },
    { id: 'b', label: 'B', text: 'Manúbrio do esterno', isCorrect: true },
    { id: 'c', label: 'C', text: 'Clavícula', isCorrect: false },
    { id: 'd', label: 'D', text: 'Escápula', isCorrect: false },
    { id: 'e', label: 'E', text: 'Primeira costela', isCorrect: false },
  ],
};

const apiQuestion = {
  id: 'question-1',
  tema: { id: 'tema-1', nome: 'Tórax' },
  tipo: 'MULTIPLA_ESCOLHA',
  dificuldade: 'MEDIA',
  imagem: 'https://exemplo.com/torax.png',
  enunciado: 'Pergunta anatômica',
  alternativaCorreta: 'A',
  explicacaoPedagogica: 'Explicação pedagógica',
  alternativas: { A: 'Resposta', B: 'Distrator' },
  status: 'ATIVO',
  criadoPorId: 'professor-api',
  criadoEm: '2025-03-31T10:00:00.000Z',
  atualizadoEm: '2025-03-31T10:00:00.000Z',
  excluidoEm: null,
};

describe('questionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists active professor questions from the API', async () => {
    const { listProfessorQuestions } = await loadService(false);
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

    await expect(listProfessorQuestions()).resolves.toEqual([
      expect.objectContaining({
        id: 'question-1',
        topic: 'Tórax',
        difficulty: 'Médio',
        createdAt: '31/03/2025',
      }),
    ]);
    expect(getMock).toHaveBeenCalledWith('/questoes');
  });

  it('returns mocked professor questions without calling the API when mocks are enabled', async () => {
    const { listarQuestoesProfessor } = await loadService(true);

    const result = await listarQuestoesProfessor();

    expect(getMock).not.toHaveBeenCalled();
    expect(result.total).toBeGreaterThan(0);
    expect(result.questoes[0]).toMatchObject({
      id: 'cmp00lkko00014hlq1ra3432j',
      type: 'Múltipla escolha',
      difficulty: 'Médio',
      topic: 'Sistema Cardiovascular',
    });
  });

  it('creates a question using the backend payload contract', async () => {
    const { createQuestion } = await loadService(false);
    postMock.mockResolvedValueOnce({
      data: {
        dados: {
          ...apiQuestion,
          id: 'question-2',
          enunciado: formValues.statement,
          alternativaCorreta: 'B',
          alternativas: {
            A: 'Esterno',
            B: 'Manúbrio do esterno',
            C: 'Clavícula',
            D: 'Escápula',
            E: 'Primeira costela',
          },
        },
      },
    });

    await createQuestion(formValues);

    expect(postMock).toHaveBeenCalledWith(
      '/questoes',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });

  it('calls the filter, find by id, update and delete endpoints', async () => {
    const {
      atualizarQuestao,
      buscarQuestaoPorFiltro,
      buscarQuestaoPorId,
      deleteQuestion,
      removerQuestao,
      updateQuestion,
    } = await loadService(false);

    getMock
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } })
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } });
    putMock
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } })
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } });
    deleteMock.mockResolvedValueOnce({ data: { mensagem: 'ok', dados: apiQuestion } });
    deleteMock.mockResolvedValueOnce({});

    await buscarQuestaoPorFiltro({ q: 'cardio' });
    await buscarQuestaoPorId('question-1');
    await atualizarQuestao('question-1', { dificuldade: 'DIFICIL' });
    await updateQuestion('question-1', formValues);
    await removerQuestao('question-1');
    await deleteQuestion('question-2');

    expect(getMock).toHaveBeenNthCalledWith(1, '/questoes/busca', {
      params: { tema: 'cardio' },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/questoes/question-1');
    expect(putMock).toHaveBeenNthCalledWith(1, '/questoes/question-1', {
      dificuldade: 'DIFICIL',
    });
    expect(putMock).toHaveBeenNthCalledWith(
      2, 
      '/questoes/question-1', 
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    expect(deleteMock).toHaveBeenNthCalledWith(1, '/questoes/question-1');
    expect(deleteMock).toHaveBeenNthCalledWith(2, '/questoes/question-2');
  });

  it('lists questions using the backend search endpoint when filters are provided', async () => {
    const { listProfessorQuestions } = await loadService(false);
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

    await listProfessorQuestions({ q: 'Tórax', dificuldade: 'MEDIA' });

    expect(getMock).toHaveBeenCalledWith('/questoes/busca', {
      params: { dificuldade: 'MEDIA', tema: 'Tórax' },
    });
  });
});
