import type {
  ApiSuccessResponse,
  ListQuestionsResponse,
  ProfessorQuestion,
  Question,
  QuestionAlternative,
  QuestionAlternativeKey,
  QuestionFormValues,
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

const IMAGE_TOPIC: QuestionTopic = {
  id: 'tema-imagem',
  nome: 'Imagem',
};

let mockSequence = 3;

let questionsMock: Question[] = [
  {
    id: 'cmp00lkko00014hlq1ra3432j',
    tema: CARDIOVASCULAR_TOPIC,
    enunciado: 'Qual câmara do coração bombeia sangue para a aorta?',
    tipo: 'MULTIPLA_ESCOLHA',
    dificuldade: 'MEDIA',
    imagem: 'https://exemplo.com/coracao.png',
    alternativaCorreta: 'B',
    saibaMais: 'O ventrículo esquerdo é responsável pela circulação sistêmica.',
    taxonomiaBloom: 'COMPREENDER',
    origemQuestao: 'ELABORADA_POR_PROFESSOR',
    regiaoAnatomica: 'Tórax',
    estruturaAlvo: 'Coração',
    sistemaAnatomico: 'Cardiovascular',
    planoAnatomico: null,
    modalidade: null,
    alternativas: {
      A: 'Átrio direito',
      B: 'Ventrículo esquerdo',
      C: 'Átrio esquerdo',
      D: 'Ventrículo direito',
      E: 'Veia cava',
    },
    status: 'ATIVO',
    criadoPorId: MOCK_PROFESSOR_ID,
    criadoEm: '2026-05-10T16:56:14.952Z',
    atualizadoEm: '2026-05-10T16:56:14.952Z',
    excluidoEm: null,
  },
  {
    id: 'question-14',
    tema: IMAGE_TOPIC,
    enunciado:
      'Em uma radiografia de tórax, qual o sinal radiológico que diferencia atelectasia de consolidação pulmonar?',
    tipo: 'MULTIPLA_ESCOLHA',
    dificuldade: 'DIFICIL',
    imagem: 'https://exemplo.com/radiografia-torax.png',
    alternativaCorreta: 'B',
    saibaMais:
      'Atelectasia costuma causar perda de volume e deslocamento de estruturas adjacentes.',
    taxonomiaBloom: 'ANALISAR',
    origemQuestao: 'PROVA_ANTERIOR',
    regiaoAnatomica: 'Tórax',
    estruturaAlvo: 'Pulmão',
    sistemaAnatomico: 'Respiratório',
    planoAnatomico: 'AP',
    modalidade: 'Radiografia',
    alternativas: {
      A: 'Broncograma aéreo',
      B: 'Perda de volume pulmonar',
    },
    status: 'ATIVO',
    criadoPorId: MOCK_PROFESSOR_ID,
    criadoEm: '2025-03-31T10:00:00.000Z',
    atualizadoEm: '2025-03-31T10:00:00.000Z',
    excluidoEm: null,
  },
];

const cloneQuestion = (question: Question): Question => ({
  ...question,
  tema: { ...question.tema },
  alternativas: question.alternativas ? { ...question.alternativas } : null,
});

const getTopicFromName = (nome: string): QuestionTopic => {
  const existingQuestion = questionsMock.find(
    (question) => question.tema.nome.toLocaleLowerCase('pt-BR') === nome.toLocaleLowerCase('pt-BR'),
  );

  if (existingQuestion) return { ...existingQuestion.tema };

  return {
    id: `tema-mock-${nome.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, '-')}`,
    nome,
  };
};

const formatQuestionDate = (date: string): string => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parsedDate);
};

const mapTypeToProfessorQuestion = (type: Question['tipo']): ProfessorQuestion['type'] => (
  type === 'MULTIPLA_ESCOLHA' ? 'Múltipla escolha' : 'Verdadeiro/Falso'
);

const mapDifficultyToProfessorQuestion = (
  difficulty: Question['dificuldade'],
): ProfessorQuestion['difficulty'] => {
  if (difficulty === 'FACIL') return 'Fácil';
  if (difficulty === 'DIFICIL') return 'Difícil';
  return 'Médio';
};

const mapTypeToApi = (type: QuestionFormValues['type']): Question['tipo'] => (
  type === 'Múltipla escolha' ? 'MULTIPLA_ESCOLHA' : 'CERTO_ERRADO'
);

const mapDifficultyToApi = (difficulty: QuestionFormValues['difficulty']): Question['dificuldade'] => {
  if (difficulty === 'Fácil') return 'FACIL';
  if (difficulty === 'Difícil') return 'DIFICIL';
  return 'MEDIA';
};

const mapAlternativeLabelToApi = (label: string): QuestionAlternativeKey => {
  if (label === 'V') return 'C';
  if (label === 'F') return 'E';
  return label as QuestionAlternativeKey;
};

const mapApiAlternativesToFormAlternatives = (
  question: Question,
): QuestionAlternative[] => (
  Object.entries(question.alternativas ?? {}).map(([label, text]) => ({
    id: label.toLowerCase(),
    label,
    text: text ?? '',
    isCorrect: label === question.alternativaCorreta,
  }))
);

const mapQuestionToProfessorQuestion = (question: Question): ProfessorQuestion => ({
  id: question.id,
  topic: question.tema.nome,
  tags: [],
  type: mapTypeToProfessorQuestion(question.tipo),
  difficulty: mapDifficultyToProfessorQuestion(question.dificuldade),
  origemQuestao: question.origemQuestao ?? 'ELABORADA_POR_PROFESSOR',
  statement: question.enunciado,
  explanation: question.saibaMais ?? '',
  taxonomiaBloom: question.taxonomiaBloom ?? null,
  regiaoAnatomica: question.regiaoAnatomica ?? null,
  estruturaAlvo: question.estruturaAlvo ?? null,
  sistemaAnatomico: question.sistemaAnatomico ?? null,
  planoAnatomico: question.planoAnatomico ?? null,
  modalidade: question.modalidade ?? null,
  alternatives: mapApiAlternativesToFormAlternatives(question),
  createdAt: formatQuestionDate(question.criadoEm),
});

const mapValuesToQuestion = (values: QuestionFormValues, id: string): Question => {
  const now = new Date().toISOString();
  const correctAlternative = values.alternatives.find((alternative) => alternative.isCorrect);

  return {
    id,
    tema: getTopicFromName(values.topic),
    enunciado: values.statement,
    tipo: mapTypeToApi(values.type),
    dificuldade: mapDifficultyToApi(values.difficulty),
    imagem: 'https://placehold.co/600x400?text=AnatoQuizUp',
    alternativaCorreta: correctAlternative
      ? mapAlternativeLabelToApi(correctAlternative.label)
      : 'A',
    saibaMais: values.explanation || null,
    taxonomiaBloom: values.taxonomiaBloom || null,
    origemQuestao: values.origemQuestao || 'ELABORADA_POR_PROFESSOR',
    regiaoAnatomica: values.regiaoAnatomica?.trim() || null,
    estruturaAlvo: values.estruturaAlvo?.trim() || null,
    sistemaAnatomico: values.sistemaAnatomico?.trim() || null,
    planoAnatomico: values.planoAnatomico || null,
    modalidade: values.modalidade?.trim() || null,
    alternativas: values.alternatives.reduce<Question['alternativas']>((acc, alternative) => {
      return {
        ...acc,
        [mapAlternativeLabelToApi(alternative.label)]: alternative.text,
      };
    }, {}),
    status: 'ATIVO',
    criadoPorId: MOCK_PROFESSOR_ID,
    criadoEm: now,
    atualizadoEm: now,
    excluidoEm: null,
  };
};

const getSearchTerm = (params?: SearchQuestionsParams): string => (
  params?.q ?? params?.busca ?? params?.termo ?? ''
).trim().toLocaleLowerCase('pt-BR');

const filterQuestions = (params?: SearchQuestionsParams): Question[] => {
  const searchTerm = getSearchTerm(params);

  return questionsMock.filter((question) => {
    const matchesStatus = params?.status ? question.status === params.status : question.status === 'ATIVO';
    const matchesTopic = params?.tema
      ? question.tema.nome.toLocaleLowerCase('pt-BR').includes(params.tema.toLocaleLowerCase('pt-BR'))
      : true;
    const matchesType = params?.tipo ? question.tipo === params.tipo : true;
    const matchesDifficulty = params?.dificuldade ? question.dificuldade === params.dificuldade : true;
    const matchesSearchTerm = searchTerm
      ? [
          question.tema.nome,
          question.enunciado,
          question.tipo,
          question.dificuldade,
          question.alternativaCorreta,
          question.saibaMais ?? '',
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
  questionsMock.findIndex((question) => question.id === id)
);

const findQuestionById = (id: string): Question => {
  const question = questionsMock.find((item) => item.id === id);

  if (!question) {
    throw new Error('Questão não encontrada.');
  }

  return question;
};

export const listProfessorQuestionsMock = async (): Promise<ProfessorQuestion[]> => (
  filterQuestions().map(mapQuestionToProfessorQuestion)
);

export const createQuestionMock = async (
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  const question = mapValuesToQuestion(values, `question-mock-${String(mockSequence).padStart(3, '0')}`);
  mockSequence += 1;
  questionsMock = [question, ...questionsMock];
  return mapQuestionToProfessorQuestion(question);
};

export const updateQuestionMock = async (
  id: string,
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  const questionIndex = findQuestionIndexById(id);

  if (questionIndex < 0) {
    throw new Error('Questão não encontrada.');
  }

  const currentQuestion = questionsMock[questionIndex];
  const updatedQuestion = {
    ...mapValuesToQuestion(values, id),
    criadoEm: currentQuestion.criadoEm,
  };

  questionsMock = questionsMock.map((question) => (question.id === id ? updatedQuestion : question));
  return mapQuestionToProfessorQuestion(updatedQuestion);
};

export const deleteQuestionMock = async (id: string): Promise<void> => {
  await removerQuestaoMock(id);
};

export const listarQuestoesMock = async (
  params?: QuestionListParams,
): Promise<ListQuestionsResponse> => paginateQuestions(filterQuestions(params), params);

export const buscarQuestaoPorFiltroMock = async (
  params?: SearchQuestionsParams,
): Promise<ApiSuccessResponse<Question>> => {
  const [question] = filterQuestions(params);

  if (!question) {
    throw new Error('Questão não encontrada.');
  }

  return {
    mensagem: 'Questão encontrada com sucesso.',
    dados: cloneQuestion(question),
  };
};

export const buscarQuestaoPorIdMock = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => ({
  mensagem: 'Questão encontrada com sucesso.',
  dados: cloneQuestion(findQuestionById(id)),
});

export const atualizarQuestaoMock = async (
  id: string,
  payload: UpdateQuestionPayload,
): Promise<ApiSuccessResponse<Question>> => {
  const questionIndex = findQuestionIndexById(id);

  if (questionIndex < 0) {
    throw new Error('Questão não encontrada.');
  }

  const currentQuestion = questionsMock[questionIndex];
  const updatedQuestion: Question = {
    ...currentQuestion,
    tema: payload.tema ? getTopicFromName(payload.tema) : { ...currentQuestion.tema },
    enunciado: payload.enunciado ?? currentQuestion.enunciado,
    tipo: payload.tipo ?? currentQuestion.tipo,
    dificuldade: payload.dificuldade ?? currentQuestion.dificuldade,
    imagem: payload.imagem ?? currentQuestion.imagem,
    alternativaCorreta: payload.alternativaCorreta ?? currentQuestion.alternativaCorreta,
    saibaMais: payload.saibaMais ?? currentQuestion.saibaMais,
    taxonomiaBloom: payload.taxonomiaBloom ?? currentQuestion.taxonomiaBloom,
    origemQuestao: payload.origemQuestao ?? currentQuestion.origemQuestao,
    regiaoAnatomica: payload.regiaoAnatomica ?? currentQuestion.regiaoAnatomica,
    estruturaAlvo: payload.estruturaAlvo ?? currentQuestion.estruturaAlvo,
    sistemaAnatomico: payload.sistemaAnatomico ?? currentQuestion.sistemaAnatomico,
    planoAnatomico: payload.planoAnatomico ?? currentQuestion.planoAnatomico,
    modalidade: payload.modalidade ?? currentQuestion.modalidade,
    alternativas: payload.alternativas
      ? { ...payload.alternativas }
      : currentQuestion.alternativas
        ? { ...currentQuestion.alternativas }
        : null,
    atualizadoEm: new Date().toISOString(),
  };

  questionsMock[questionIndex] = updatedQuestion;

  return {
    mensagem: 'Questão atualizada com sucesso.',
    dados: cloneQuestion(updatedQuestion),
  };
};

export const removerQuestaoMock = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => {
  const questionIndex = findQuestionIndexById(id);

  if (questionIndex < 0) {
    throw new Error('Questão não encontrada.');
  }

  const now = new Date().toISOString();
  const removedQuestion: Question = {
    ...questionsMock[questionIndex],
    status: 'INATIVO',
    atualizadoEm: now,
    excluidoEm: now,
  };

  questionsMock[questionIndex] = removedQuestion;

  return {
    mensagem: 'Questão removida com sucesso.',
    dados: cloneQuestion(removedQuestion),
  };
};
