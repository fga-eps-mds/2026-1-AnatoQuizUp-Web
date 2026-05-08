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
  ],
};

describe('questionService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists active professor questions from the API', async () => {
    const { listProfessorQuestions } = await loadService(false);
    getMock.mockResolvedValueOnce({
      data: {
        dados: [
          {
            id: 'question-1',
            tema: 'Tórax',
            tags: ['aorta'],
            tipo: 'MULTIPLA_ESCOLHA',
            dificuldade: 'MEDIO',
            origem: 'Manual',
            enunciado: 'Pergunta anatômica',
            alternativas: [{ id: 'a', letra: 'A', texto: 'Resposta', correta: true }],
            criadoEm: '31/03/2025',
          },
        ],
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
    expect(getMock).toHaveBeenCalledWith('/questoes/professor/ativas');
  });

  it('creates a question using the backend payload contract', async () => {
    const { createQuestion } = await loadService(false);
    postMock.mockResolvedValueOnce({
      data: {
        dados: {
          id: 'question-2',
          tema: 'Tórax',
          tipo: 'MULTIPLA_ESCOLHA',
          dificuldade: 'MEDIO',
          enunciado: formValues.statement,
          alternativas: [{ letra: 'B', texto: 'Manúbrio do esterno', correta: true }],
        },
      },
    });

    await createQuestion(formValues);

    expect(postMock).toHaveBeenCalledWith('/questoes', {
      tema: 'Tórax',
      tags: ['aorta', 'mediastino'],
      tipo: 'MULTIPLA_ESCOLHA',
      dificuldade: 'MEDIO',
      origem: 'Manual',
      enunciado: formValues.statement,
      explicacao: 'O manúbrio se relaciona com os grandes vasos.',
      alternativas: [
        { letra: 'A', texto: 'Esterno', correta: false },
        { letra: 'B', texto: 'Manúbrio do esterno', correta: true },
      ],
    });
  });

  it('updates and deletes questions through the API', async () => {
    const { updateQuestion, deleteQuestion } = await loadService(false);
    putMock.mockResolvedValueOnce({ data: { dados: { id: 'question-2', tema: 'Tórax' } } });
    deleteMock.mockResolvedValueOnce({});

    await updateQuestion('question-2', formValues);
    await deleteQuestion('question-2');

    expect(putMock).toHaveBeenCalledWith('/questoes/question-2', expect.any(Object));
    expect(deleteMock).toHaveBeenCalledWith('/questoes/question-2');
  });
});
