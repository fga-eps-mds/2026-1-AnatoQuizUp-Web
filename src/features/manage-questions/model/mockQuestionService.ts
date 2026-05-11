import type {
  ApiSuccessResponse,
  ListQuestionsResponse,
  Question,
  QuestionListParams,
  QuestionTopic,
  SearchQuestionsParams,
  UpdateQuestionPayload,
} from './types';

const MOCK_PROFESSOR_ID = 'cmozsfilw00034h52pm1r4ibs';

const CARDIOVASCULAR_TOPIC: QuestionTopic = {
  id: 'cmozy4dxz00004h3xbjzw5vdv',
  nome: 'Sistema Cardiovascular',
};

const RESPIRATORY_TOPIC: QuestionTopic = {
  id: 'tema-sistema-respiratorio',
  nome: 'Sistema Respiratorio',
};

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'cmp00lkko00014hlq1ra3432j',
    tema: CARDIOVASCULAR_TOPIC,
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
    criadoPorId: MOCK_PROFESSOR_ID,
    criadoEm: '2026-05-10T16:56:14.952Z',
    atualizadoEm: '2026-05-10T16:56:14.952Z',
    excluidoEm: null,
  },
  {
    id: 'questao-mock-002',
    tema: RESPIRATORY_TOPIC,
    enunciado:
      'Em uma radiografia de torax, qual sinal radiologico sugere atelectasia?',
    tipo: 'MULTIPLA_ESCOLHA',
    dificuldade: 'DIFICIL',
    imagem: 'https://exemplo.com/radiografia-torax.png',
    alternativaCorreta: 'C',
    explicacaoPedagogica:
      'Atelectasia costuma causar perda de volume e deslocamento de estruturas adjacentes.',
    alternativas: {
      A: 'Broncograma aereo sem desvio mediastinal',
      B: 'Aumento difuso da transparencia pulmonar',
      C: 'Perda de volume com desvio de fissuras, hilo ou mediastino',
      D: 'Derrame pleural bilateral associado a cardiomegalia',
      E: 'Nodulo calcificado isolado',
    },
    status: 'ATIVO',
    criadoPorId: MOCK_PROFESSOR_ID,
    criadoEm: '2026-05-09T14:30:00.000Z',
    atualizadoEm: '2026-05-09T14:30:00.000Z',
    excluidoEm: null,
  },
];

const cloneQuestion = (question: Question): Question => ({
  ...question,
  tema: { ...question.tema },
  alternativas: question.alternativas ? { ...question.alternativas } : null,
});

const getTopicFromName = (nome: string): QuestionTopic => {
  const existingQuestion = MOCK_QUESTIONS.find(
    (question) => question.tema.nome.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'),
  );

  if (existingQuestion) {
    return { ...existingQuestion.tema };
  }

  return {
    id: `tema-mock-${nome.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, '-')}`,
    nome,
  };
};

const getSearchTerm = (params?: SearchQuestionsParams): string => (
  params?.q ?? params?.busca ?? params?.termo ?? ''
).trim().toLocaleLowerCase('pt-BR');

const filterQuestions = (params?: SearchQuestionsParams): Question[] => {
  const searchTerm = getSearchTerm(params);

  return MOCK_QUESTIONS.filter((question) => {
    const matchesStatus = params?.status ? question.status === params.status : question.status === 'ATIVO';
    const matchesTopic = params?.tema
      ? question.tema.nome.toLocaleLowerCase('pt-BR').includes(params.tema.toLocaleLowerCase('pt-BR'))
      : true;
    const matchesType = params?.tipo ? question.tipo === params.tipo : true;
    const matchesDifficulty = params?.dificuldade
      ? question.dificuldade === params.dificuldade
      : true;
    const matchesSearchTerm = searchTerm
      ? [
          question.tema.nome,
          question.enunciado,
          question.tipo,
          question.dificuldade,
          question.alternativaCorreta,
          question.explicacaoPedagogica ?? '',
          ...Object.values(question.alternativas ?? {}),
        ]
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(searchTerm)
      : true;

    return matchesStatus && matchesTopic && matchesType && matchesDifficulty && matchesSearchTerm;
  });
};

const paginateQuestions = (
  questions: Question[],
  params?: Pick<QuestionListParams, 'page' | 'limit'>,
): ListQuestionsResponse => {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const limit = params?.limit && params.limit > 0 ? params.limit : 10;
  const start = (page - 1) * limit;
  const paginatedQuestions = questions.slice(start, start + limit).map(cloneQuestion);

  return {
    dados: paginatedQuestions,
    metadados: {
      page,
      limit,
      total: questions.length,
      totalPages: Math.max(1, Math.ceil(questions.length / limit)),
    },
  };
};

const findQuestionIndexById = (id: string): number => (
  MOCK_QUESTIONS.findIndex((question) => question.id === id)
);

const findQuestionById = (id: string): Question => {
  const question = MOCK_QUESTIONS.find((item) => item.id === id);

  if (!question) {
    throw new Error('Questao nao encontrada.');
  }

  return question;
};

export const listarQuestoesMock = async (
  params?: QuestionListParams,
): Promise<ListQuestionsResponse> => paginateQuestions(filterQuestions(params), params);

export const buscarQuestaoPorFiltroMock = async (
  params?: SearchQuestionsParams,
): Promise<ApiSuccessResponse<Question>> => {
  const [question] = filterQuestions(params);

  if (!question) {
    throw new Error('Questao nao encontrada.');
  }

  return {
    mensagem: 'Questao encontrada com sucesso.',
    dados: cloneQuestion(question),
  };
};

export const buscarQuestaoPorIdMock = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => ({
  mensagem: 'Questao encontrada com sucesso.',
  dados: cloneQuestion(findQuestionById(id)),
});

export const atualizarQuestaoMock = async (
  id: string,
  payload: UpdateQuestionPayload,
): Promise<ApiSuccessResponse<Question>> => {
  const questionIndex = findQuestionIndexById(id);

  if (questionIndex < 0) {
    throw new Error('Questao nao encontrada.');
  }

  const currentQuestion = MOCK_QUESTIONS[questionIndex];
  const updatedQuestion: Question = {
    ...currentQuestion,
    tema: payload.tema ? getTopicFromName(payload.tema) : { ...currentQuestion.tema },
    enunciado: payload.enunciado ?? currentQuestion.enunciado,
    tipo: payload.tipo ?? currentQuestion.tipo,
    dificuldade: payload.dificuldade ?? currentQuestion.dificuldade,
    imagem: payload.imagem ?? currentQuestion.imagem,
    alternativaCorreta: payload.alternativaCorreta ?? currentQuestion.alternativaCorreta,
    explicacaoPedagogica:
      payload.explicacaoPedagogica ?? currentQuestion.explicacaoPedagogica,
    alternativas: payload.alternativas
      ? { ...payload.alternativas }
      : currentQuestion.alternativas
        ? { ...currentQuestion.alternativas }
        : null,
    atualizadoEm: new Date().toISOString(),
  };

  MOCK_QUESTIONS[questionIndex] = updatedQuestion;

  return {
    mensagem: 'Questao atualizada com sucesso.',
    dados: cloneQuestion(updatedQuestion),
  };
};

export const removerQuestaoMock = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => {
  const questionIndex = findQuestionIndexById(id);

  if (questionIndex < 0) {
    throw new Error('Questao nao encontrada.');
  }

  const now = new Date().toISOString();
  const removedQuestion: Question = {
    ...MOCK_QUESTIONS[questionIndex],
    status: 'INATIVO',
    atualizadoEm: now,
    excluidoEm: now,
  };

  MOCK_QUESTIONS[questionIndex] = removedQuestion;

  return {
    mensagem: 'Questao removida com sucesso.',
    dados: cloneQuestion(removedQuestion),
  };
};
