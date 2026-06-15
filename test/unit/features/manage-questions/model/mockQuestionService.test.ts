import type { QuestionFormValues } from '../../../../../src/features/manage-questions/model/types';

const loadMockService = async () => {
  jest.resetModules();
  return import('../../../../../src/features/manage-questions/model/mockQuestionService');
};

const multipleChoiceValues = {
  topic: 'Torax',
  tags: 'anatomia',
  type: 'Múltipla escolha',
  difficulty: 'Difícil',
  origemQuestao: 'ELABORADA_POR_PROFESSOR',
  statement: 'Qual estrutura protege o coracao?',
  explanation: 'A caixa toracica protege os orgaos do mediastino.',
  alternatives: [
    { id: 'a', label: 'A', text: 'Clavicula', isCorrect: false },
    { id: 'b', label: 'B', text: 'Esterno', isCorrect: true },
    { id: 'c', label: 'C', text: 'Escapula', isCorrect: false },
  ],
} as QuestionFormValues;

const trueFalseValues = {
  topic: 'Neuroanatomia',
  tags: '',
  type: 'Verdadeiro/Falso',
  difficulty: 'Fácil',
  origemQuestao: 'ELABORADA_POR_PROFESSOR',
  statement: 'O cerebelo participa do equilibrio.',
  explanation: '',
  alternatives: [
    { id: 'v', label: 'V', text: 'Verdadeiro', isCorrect: true },
    { id: 'f', label: 'F', text: 'Falso', isCorrect: false },
  ],
} as QuestionFormValues;

describe('mockQuestionService', () => {
  it('lista questoes ativas com paginacao e filtros', async () => {
    const { listarQuestoesMock, listProfessorQuestionsMock } = await loadMockService();

    const paginated = await listarQuestoesMock({
      page: 1,
      limit: 1,
      tema: 'Imagem',
      tipo: 'MULTIPLA_ESCOLHA',
      dificuldade: 'DIFICIL',
    });
    const professorQuestions = await listProfessorQuestionsMock();

    expect(paginated.dados).toHaveLength(1);
    expect(paginated.dados[0]).toMatchObject({
      id: 'question-14',
      status: 'ATIVO',
      tema: { nome: 'Imagem' },
    });
    expect(paginated.metadados).toMatchObject({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
    expect(professorQuestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'question-14',
          difficulty: 'Difícil',
          createdAt: '31/03/2025',
        }),
      ]),
    );
  });

  it('busca questoes por termo, busca e id', async () => {
    const { buscarQuestaoPorFiltroMock, buscarQuestaoPorIdMock } = await loadMockService();

    await expect(buscarQuestaoPorFiltroMock({ busca: 'radiografia' })).resolves.toEqual(
      expect.objectContaining({
        dados: expect.objectContaining({ id: 'question-14' }),
      }),
    );
    await expect(buscarQuestaoPorFiltroMock({ termo: 'aorta' })).resolves.toEqual(
      expect.objectContaining({
        dados: expect.objectContaining({ id: 'cmp00lkko00014hlq1ra3432j' }),
      }),
    );
    await expect(buscarQuestaoPorIdMock('question-14')).resolves.toEqual(
      expect.objectContaining({
        dados: expect.objectContaining({ tema: expect.objectContaining({ nome: 'Imagem' }) }),
      }),
    );
  });

  it('cria, atualiza e remove questoes no mock', async () => {
    const {
      atualizarQuestaoMock,
      buscarQuestaoPorIdMock,
      createQuestionMock,
      listarQuestoesMock,
      removerQuestaoMock,
      updateQuestionMock,
    } = await loadMockService();

    const created = await createQuestionMock(trueFalseValues);

    expect(created).toMatchObject({
      topic: 'Neuroanatomia',
      type: 'Verdadeiro/Falso',
      difficulty: 'Fácil',
      explanation: '',
    });
    expect(created.alternatives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'C', isCorrect: true }),
        expect.objectContaining({ label: 'E', isCorrect: false }),
      ]),
    );

    const createdApiQuestion = await buscarQuestaoPorIdMock(created.id);
    expect(createdApiQuestion.dados).toMatchObject({
      alternativaCorreta: 'C',
      saibaMais: null,
    });

    const updated = await updateQuestionMock(created.id, multipleChoiceValues);
    expect(updated).toMatchObject({
      id: created.id,
      difficulty: 'Difícil',
      topic: 'Torax',
    });

    const apiUpdated = await atualizarQuestaoMock(created.id, {
      tema: 'Imagem',
      enunciado: 'Questao revisada',
      dificuldade: 'MEDIA',
      imagem: null,
      alternativaCorreta: 'A',
      saibaMais: 'Explicacao revisada',
      alternativas: { A: 'Resposta revisada' },
    });
    expect(apiUpdated.dados).toMatchObject({
      tema: { nome: 'Imagem' },
      enunciado: 'Questao revisada',
      alternativas: { A: 'Resposta revisada' },
    });

    const removed = await removerQuestaoMock(created.id);
    expect(removed.dados).toMatchObject({
      id: created.id,
      status: 'INATIVO',
      excluidoEm: expect.any(String),
    });

    const inactiveQuestions = await listarQuestoesMock({ status: 'INATIVO' });
    expect(inactiveQuestions.dados).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id })]),
    );
  });

  it('retorna erro quando a questao nao existe', async () => {
    const {
      atualizarQuestaoMock,
      buscarQuestaoPorFiltroMock,
      buscarQuestaoPorIdMock,
      removerQuestaoMock,
      updateQuestionMock,
    } = await loadMockService();

    await expect(buscarQuestaoPorFiltroMock({ q: 'termo inexistente' })).rejects.toThrow(
      'Questão não encontrada.',
    );
    await expect(buscarQuestaoPorIdMock('missing-question')).rejects.toThrow(
      'Questão não encontrada.',
    );
    await expect(updateQuestionMock('missing-question', multipleChoiceValues)).rejects.toThrow(
      'Questão não encontrada.',
    );
    await expect(atualizarQuestaoMock('missing-question', { tema: 'Torax' })).rejects.toThrow(
      'Questão não encontrada.',
    );
    await expect(removerQuestaoMock('missing-question')).rejects.toThrow(
      'Questão não encontrada.',
    );
  });
});
