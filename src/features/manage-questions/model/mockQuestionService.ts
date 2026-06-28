// Implementacao mock (em memoria) do servico de questoes, usada como fallback/
// desenvolvimento quando o backend nao esta disponivel. Mantem um array local de
// questoes e reproduz as operacoes da API real: listar, filtrar, paginar, criar,
// atualizar e remover (soft delete), alem de mapear entre o formato do formulario
// e o formato do dominio. Tudo e assincrono para imitar a assinatura da API real.
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

// Id ficticio de professor usado como autor de todas as questoes mock.
const MOCK_PROFESSOR_ID = 'cmozsfilw00034h52pm1r4ibs';

// Temas pre-definidos reutilizados pelas questoes de exemplo.
const CARDIOVASCULAR_TOPIC: QuestionTopic = {
  id: 'cmozy4dxz00004h3xbjzw5vdv',
  nome: 'Sistema Cardiovascular',
};

const IMAGE_TOPIC: QuestionTopic = {
  id: 'tema-imagem',
  nome: 'Imagem',
};

// Contador para gerar ids sequenciais de novas questoes criadas no mock.
let mockSequence = 3;

// "Banco de dados" em memoria: a lista mutavel de questoes de exemplo.
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

/**
 * Clona uma questao em profundidade (tema e alternativas), evitando que quem
 * recebe o objeto mutacione o estado interno do mock por referencia.
 * @param question questao a clonar
 */
const cloneQuestion = (question: Question): Question => ({
  ...question,
  tema: { ...question.tema },
  alternativas: question.alternativas ? { ...question.alternativas } : null,
});

/**
 * Resolve um tema a partir do nome: reaproveita o tema de uma questao existente
 * (comparacao case-insensitive pt-BR) ou cria um tema mock com id derivado do nome.
 * @param nome nome do tema
 */
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

/**
 * Formata uma data ISO para o padrao pt-BR (em UTC). Se invalida, devolve o original.
 * @param date data em formato ISO
 */
const formatQuestionDate = (date: string): string => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parsedDate);
};

// Converte o tipo interno (enum) para o rotulo exibido na UI do professor.
const mapTypeToProfessorQuestion = (type: Question['tipo']): ProfessorQuestion['type'] => (
  type === 'MULTIPLA_ESCOLHA' ? 'Múltipla escolha' : 'Verdadeiro/Falso'
);

// Converte a dificuldade interna (enum) para o rotulo exibido na UI.
const mapDifficultyToProfessorQuestion = (
  difficulty: Question['dificuldade'],
): ProfessorQuestion['difficulty'] => {
  if (difficulty === 'FACIL') return 'Fácil';
  if (difficulty === 'DIFICIL') return 'Difícil';
  return 'Médio';
};

// Caminho inverso: rotulo da UI -> tipo interno (enum) da API.
const mapTypeToApi = (type: QuestionFormValues['type']): Question['tipo'] => (
  type === 'Múltipla escolha' ? 'MULTIPLA_ESCOLHA' : 'CERTO_ERRADO'
);

// Rotulo de dificuldade da UI -> enum interno da API.
const mapDifficultyToApi = (difficulty: QuestionFormValues['difficulty']): Question['dificuldade'] => {
  if (difficulty === 'Fácil') return 'FACIL';
  if (difficulty === 'Difícil') return 'DIFICIL';
  return 'MEDIA';
};

/**
 * Mapeia o rotulo de alternativa do formulario para a chave da API. Em questoes
 * Verdadeiro/Falso, V vira C e F vira E (convencao do backend).
 * @param label rotulo da alternativa no formulario
 */
const mapAlternativeLabelToApi = (label: string): QuestionAlternativeKey => {
  if (label === 'V') return 'C';
  if (label === 'F') return 'E';
  return label as QuestionAlternativeKey;
};

/**
 * Converte o objeto de alternativas da API (chave -> texto) na lista de
 * alternativas usada pelo formulario, marcando qual e a correta.
 * @param question questao de origem
 */
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

/**
 * Converte uma questao do dominio para o formato consumido pela tela do professor.
 * @param question questao do dominio
 */
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
  alternatives: mapApiAlternativesToFormAlternatives(question),
  createdAt: formatQuestionDate(question.criadoEm),
});

/**
 * Constroi uma questao do dominio a partir dos valores do formulario, ja
 * resolvendo tema, tipo, dificuldade, alternativa correta e timestamps.
 * @param values valores preenchidos no formulario
 * @param id id a atribuir a questao
 */
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

/**
 * Normaliza o termo de busca aceitando os varios nomes de parametro (q/busca/termo).
 * @param params parametros de busca
 */
const getSearchTerm = (params?: SearchQuestionsParams): string => (
  params?.q ?? params?.busca ?? params?.termo ?? ''
).trim().toLocaleLowerCase('pt-BR');

/**
 * Filtra as questoes aplicando status, tema, tipo, dificuldade e termo de busca.
 * Por padrao retorna apenas questoes ATIVO. O termo busca em varios campos juntos.
 * @param params filtros opcionais
 */
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

/**
 * Pagina uma lista de questoes e devolve dados + metadados (page/limit/total).
 * Defaults: pagina 1 e limite 10; clona cada questao retornada.
 * @param questions lista ja filtrada
 * @param params pagina e limite desejados
 */
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

// Indice da questao no array mock, ou -1 se nao existir.
const findQuestionIndexById = (id: string): number => (
  questionsMock.findIndex((question) => question.id === id)
);

/**
 * Busca uma questao por id e lanca erro se nao encontrar.
 * @param id id da questao
 * @throws Error quando a questao nao existe
 */
const findQuestionById = (id: string): Question => {
  const question = questionsMock.find((item) => item.id === id);

  if (!question) {
    throw new Error('Questão não encontrada.');
  }

  return question;
};

// Lista todas as questoes ativas ja no formato da UI do professor.
export const listProfessorQuestionsMock = async (): Promise<ProfessorQuestion[]> => (
  filterQuestions().map(mapQuestionToProfessorQuestion)
);

/**
 * Cria uma nova questao a partir do formulario, inserindo-a no inicio da lista.
 * @param values valores do formulario
 */
export const createQuestionMock = async (
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  const question = mapValuesToQuestion(values, `question-mock-${String(mockSequence).padStart(3, '0')}`);
  mockSequence += 1;
  questionsMock = [question, ...questionsMock];
  return mapQuestionToProfessorQuestion(question);
};

/**
 * Atualiza uma questao existente preservando sua data de criacao original.
 * @param id id da questao
 * @param values novos valores do formulario
 * @throws Error se a questao nao existir
 */
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

// Remove (soft delete) uma questao; delega ao removerQuestaoMock e ignora o retorno.
export const deleteQuestionMock = async (id: string): Promise<void> => {
  await removerQuestaoMock(id);
};

// Lista questoes filtradas e paginadas (formato da API real).
export const listarQuestoesMock = async (
  params?: QuestionListParams,
): Promise<ListQuestionsResponse> => paginateQuestions(filterQuestions(params), params);

/**
 * Retorna a primeira questao que casa com os filtros informados.
 * @param params filtros de busca
 * @throws Error se nenhuma questao casar
 */
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

// Busca uma questao por id (clonada) no formato de resposta da API.
export const buscarQuestaoPorIdMock = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => ({
  mensagem: 'Questão encontrada com sucesso.',
  dados: cloneQuestion(findQuestionById(id)),
});

/**
 * Atualiza parcialmente uma questao (payload com campos opcionais), mantendo os
 * valores atuais para os campos nao informados.
 * @param id id da questao
 * @param payload campos a sobrescrever
 * @throws Error se a questao nao existir
 */
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

/**
 * Remove uma questao por soft delete: marca status INATIVO e preenche excluidoEm,
 * sem apaga-la fisicamente do array.
 * @param id id da questao
 * @throws Error se a questao nao existir
 */
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
