import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import {
  atualizarQuestaoMock,
  buscarQuestaoPorFiltroMock,
  buscarQuestaoPorIdMock,
  createQuestionMock,
  deleteQuestionMock,
  listProfessorQuestionsMock,
  listarQuestoesMock,
  removerQuestaoMock,
  updateQuestionMock,
} from './mockQuestionService';
import type {
  ApiQuestionDifficulty,
  ApiQuestionType,
  ApiSuccessResponse,
  ListProfessorQuestionsPayload,
  ListQuestionsResponse,
  PaginationMetadata,
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

// Service de questoes do professor: fala com a API (ou mocks) e normaliza os dados
// do backend (campos em PT-BR/EN, formatos variados) para os tipos usados na UI.

// Alternativa como pode vir do backend: aceita tanto chaves PT-BR quanto EN.
type BackendQuestionAlternative = {
  id?: string;
  letra?: string;
  label?: string;
  texto?: string;
  text?: string;
  correta?: boolean;
  isCorrect?: boolean;
};

// Alternativas do backend: array ou objeto indexado por letra.
type BackendQuestionAlternatives =
  | BackendQuestionAlternative[]
  | Record<string, string | BackendQuestionAlternative | undefined>;

// Questao "crua" do backend, com nomes de campo possivelmente em PT-BR ou EN.
type BackendQuestion = Partial<Omit<Question, 'tema' | 'alternativas'>> & {
  id: string;
  tema?: string | Partial<QuestionTopic>;
  topic?: string;
  tags?: string[] | string;
  palavrasChave?: string[] | string;
  type?: string;
  difficulty?: string;
  origem?: string;
  origin?: string;
  statement?: string;
  explanation?: string;
  explicacao?: string;
  alternativas?: BackendQuestionAlternatives | null;
  alternatives?: BackendQuestionAlternatives | null;
  createdAt?: string;
  imagem?: string | null;
  image?: string | null;
};

// Endpoint base das questoes no backend.
const QUESTION_ENDPOINT = '/questoes';
// Texto padrao quando o professor nao informa a explicacao pedagogica.
const DEFAULT_PEDAGOGICAL_EXPLANATION = 'Explicação pedagógica não informada.';

// Metadados de paginacao padrao (usados como fallback).
const EMPTY_METADATA: PaginationMetadata = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

// Garante metadados de paginacao validos, preenchendo o que faltar com defaults.
const normalizeMetadata = (
  metadados?: Partial<PaginationMetadata>,
  totalFallback = 0,
): PaginationMetadata => ({
  page: typeof metadados?.page === 'number' ? metadados.page : EMPTY_METADATA.page,
  limit: typeof metadados?.limit === 'number' ? metadados.limit : EMPTY_METADATA.limit,
  total: typeof metadados?.total === 'number' ? metadados.total : totalFallback,
  totalPages:
    typeof metadados?.totalPages === 'number' ? metadados.totalPages : EMPTY_METADATA.totalPages,
});

// Normaliza a resposta de listagem: garante array de dados + metadados validos.
const normalizeQuestionListResponse = (
  response?: Partial<ListQuestionsResponse>,
): ListQuestionsResponse => {
  const dados = Array.isArray(response?.dados) ? response.dados : [];

  return {
    dados,
    metadados: normalizeMetadata(response?.metadados, dados.length),
  };
};

// Empacota a lista de questoes do professor no formato com total/metadados.
const toProfessorQuestionsPayload = (
  questions: ProfessorQuestion[],
): ListProfessorQuestionsPayload => ({
  questoes: questions,
  total: questions.length,
  metadados: {
    ...EMPTY_METADATA,
    total: questions.length,
    totalPages: Math.max(1, Math.ceil(questions.length / EMPTY_METADATA.limit)),
  },
});

// Converte o tipo exibido (PT-BR) para o codigo da API.
const mapTypeToApi = (type: QuestionFormValues['type']): ApiQuestionType => (
  type === 'Múltipla escolha' ? 'MULTIPLA_ESCOLHA' : 'CERTO_ERRADO'
);

// Converte a dificuldade exibida (PT-BR) para o codigo da API.
const mapDifficultyToApi = (difficulty: QuestionFormValues['difficulty']): ApiQuestionDifficulty => {
  if (difficulty === 'Fácil') return 'FACIL';
  if (difficulty === 'Difícil') return 'DIFICIL';
  return 'MEDIA';
};

// Converte o tipo vindo da API (varias grafias possiveis) para o rotulo da UI.
const mapTypeFromApi = (type?: string): ProfessorQuestion['type'] => (
  /certo_errado|verdadeiro|falso|true_false|vf/i.test(type ?? '')
    ? 'Verdadeiro/Falso'
    : 'Múltipla escolha'
);

// Converte a dificuldade vinda da API (varias grafias) para o rotulo da UI.
const mapDifficultyFromApi = (difficulty?: string): ProfessorQuestion['difficulty'] => {
  if (/facil|fácil|easy/i.test(difficulty ?? '')) return 'Fácil';
  if (/dificil|difícil|hard/i.test(difficulty ?? '')) return 'Difícil';
  return 'Médio';
};

// Formata uma data ISO para o padrao pt-BR (UTC); devolve o valor cru se invalida.
const formatDate = (date?: string) => {
  if (!date) return '';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(parsedDate);
};

// Normaliza tags: aceita array ou CSV e devolve sempre um array limpo.
const normalizeTags = (tags?: string[] | string): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
};

// Normaliza uma alternativa do backend, com fallbacks de rotulo/texto.
const normalizeAlternative = (
  alternative: BackendQuestionAlternative,
  index: number,
): QuestionAlternative => ({
  id: alternative.id ?? String(index),
  label: alternative.label ?? alternative.letra ?? String.fromCharCode(65 + index),
  text: alternative.text ?? alternative.texto ?? '',
  isCorrect: Boolean(alternative.isCorrect ?? alternative.correta),
});

// Resolve o nome do tema, que pode vir como string, objeto {nome} ou campo topic.
const normalizeTopic = (tema?: BackendQuestion['tema'], topic?: string): string => {
  if (topic) return topic;
  if (typeof tema === 'string') return tema;
  return tema?.nome ?? '';
};

// Normaliza as alternativas (array ou objeto indexado) para a lista da UI.
// Para certo/errado (2 itens), mapeia as letras C/E para os rotulos V/F.
const normalizeAlternatives = (
  alternatives: BackendQuestionAlternatives | null | undefined,
  correctAlternative?: string,
): QuestionAlternative[] => {
  if (Array.isArray(alternatives)) {
    return alternatives.map((alternative, index) => normalizeAlternative(alternative, index));
  }

  if (!alternatives) return [];

  return Object.entries(alternatives)
    .filter(([, value]) => value !== undefined)
    .map(([label, value], index) => {
      if (typeof value === 'string') {
        const normalizedLabel = label === 'C' && correctAlternative && Object.keys(alternatives).length === 2
          ? 'V'
          : label === 'E' && correctAlternative && Object.keys(alternatives).length === 2
            ? 'F'
            : label;

        return {
          id: normalizedLabel,
          label: normalizedLabel,
          text: value,
          isCorrect: label === correctAlternative,
        };
      }

      const alternative = value ?? {};
      return normalizeAlternative({ ...alternative, letra: alternative.letra ?? label }, index);
    });
};

// Converte uma questao crua do backend no modelo ProfessorQuestion usado na UI,
// resolvendo cada campo com seus possiveis nomes alternativos.
const normalizeQuestion = (question: BackendQuestion): ProfessorQuestion => ({
  id: question.id,
  topic: normalizeTopic(question.tema, question.topic),
  tags: normalizeTags(question.palavrasChave ?? question.tags),
  type: mapTypeFromApi(question.type ?? question.tipo),
  difficulty: mapDifficultyFromApi(question.difficulty ?? question.dificuldade),
  origemQuestao: question.origemQuestao ?? 'ELABORADA_POR_PROFESSOR',
  statement: question.statement ?? question.enunciado ?? '',
  explanation: question.explanation ?? question.explicacao ?? question.saibaMais ?? '',
  taxonomiaBloom: question.taxonomiaBloom ?? null,
  regiaoAnatomica: question.regiaoAnatomica ?? null,
  image: question.image ?? question.imagem ?? null,
  alternatives: normalizeAlternatives(
    question.alternatives ?? question.alternativas,
    question.alternativaCorreta,
  ),
  createdAt: formatDate(question.createdAt ?? question.criadoEm),
});

// Converte o rotulo da UI (V/F) para a letra esperada pela API (C/E).
const mapAlternativeLabelToApi = (label: string): QuestionAlternativeKey => {
  if (label === 'V') return 'C';
  if (label === 'F') return 'E';
  return label as QuestionAlternativeKey;
};

// Monta o FormData (multipart) do create/update, incluindo imagem e alternativas.
const buildFormData = (values: QuestionFormValues): FormData => {
  const formData = new FormData();
  
  formData.append('tema', values.topic);
  formData.append('tipo', mapTypeToApi(values.type));
  formData.append('dificuldade', mapDifficultyToApi(values.difficulty));
  formData.append('enunciado', values.statement.trim());
  
  const explanation = values.explanation.trim() || DEFAULT_PEDAGOGICAL_EXPLANATION;
  formData.append('saibaMais', explanation);
  formData.append('origemQuestao', values.origemQuestao || '');
  formData.append('taxonomiaBloom', values.taxonomiaBloom || '');
  formData.append('regiaoAnatomica', (values.regiaoAnatomica || '').trim());
  formData.append('palavrasChave', (values.tags || '').trim());

  // Gabarito: envia a letra (na convencao da API) da alternativa correta.
  const correctAlternative = values.alternatives.find((alt) => alt.isCorrect);
  if (correctAlternative) {
    formData.append('alternativaCorreta', mapAlternativeLabelToApi(correctAlternative.label));
  }

  // Envia cada alternativa preenchida no formato alternativas[<letra>].
  values.alternatives.forEach((alt) => {
    if (alt.text.trim()) {
      formData.append(`alternativas[${mapAlternativeLabelToApi(alt.label)}]`, alt.text.trim());
    }
  });

  // Imagem so e anexada quando o usuario selecionou um novo arquivo.
  if (values.image instanceof File) {
    formData.append('imagem', values.image);
  }

  return formData;
};

// Extrai uma mensagem de erro amigavel de um erro do Axios (varios formatos de payload).
export const extractErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }

  const data = error.response.data as {
    message?: string;
    mensagem?: string;
    erro?: { mensagem?: string };
  };

  return data.erro?.mensagem ?? data.mensagem ?? data.message ?? 'Não foi possível processar a questão.';
};

// Lista questoes (paginada). Em modo mock, usa os dados locais.
export const listarQuestoes = async (
  params?: QuestionListParams,
): Promise<ListQuestionsResponse> => {
  if (USE_MOCKS) {
    return normalizeQuestionListResponse(await listarQuestoesMock(params));
  }

  const { data } = await httpClient.get<ListQuestionsResponse>(QUESTION_ENDPOINT, { params });

  return normalizeQuestionListResponse(data);
};

// Busca uma questao por filtros (tema/dificuldade/tipo/texto).
export const buscarQuestaoPorFiltro = async (
  params?: SearchQuestionsParams,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return buscarQuestaoPorFiltroMock(params);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Question>>(`${QUESTION_ENDPOINT}/busca`, {
    params: mapQuestionFiltersToApiParams(params),
  });

  return data;
};

// Busca uma questao especifica pelo id.
export const buscarQuestaoPorId = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return buscarQuestaoPorIdMock(id);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Question>>(`${QUESTION_ENDPOINT}/${id}`);

  return data;
};

// Atualiza uma questao via payload JSON (sem upload de imagem).
export const atualizarQuestao = async (
  id: string,
  payload: UpdateQuestionPayload,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return atualizarQuestaoMock(id, payload);
  }

  const { data } = await httpClient.put<ApiSuccessResponse<Question>>(
    `${QUESTION_ENDPOINT}/${id}`,
    payload,
  );

  return data;
};

// Remove uma questao pelo id (retorna a resposta da API).
export const removerQuestao = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return removerQuestaoMock(id);
  }

  const { data } = await httpClient.delete<ApiSuccessResponse<Question>>(`${QUESTION_ENDPOINT}/${id}`);

  return data;
};

// Normaliza os filtros de busca: unifica os varios aliases de texto (q/busca/termo)
// no campo "tema" esperado pela API e remove os aliases redundantes.
const mapQuestionFiltersToApiParams = (
  params?: SearchQuestionsParams,
): SearchQuestionsParams | undefined => {
  if (!params) return undefined;

  const normalizedParams: SearchQuestionsParams = {
    ...params,
    tipo: params.tipo,
    dificuldade: params.dificuldade,
  };

  const searchText = params.tema ?? params.q ?? params.busca ?? params.termo;

  if (searchText) {
    normalizedParams.tema = searchText;
  }

  delete normalizedParams.q;
  delete normalizedParams.busca;
  delete normalizedParams.termo;

  return normalizedParams;
};

// Lista as questoes do professor ja normalizadas; usa o endpoint de busca quando
// ha filtros e a listagem simples caso contrario.
export const listProfessorQuestions = async (
  params?: SearchQuestionsParams,
): Promise<ProfessorQuestion[]> => {
  if (USE_MOCKS) return listProfessorQuestionsMock();

  try {
    const apiParams = mapQuestionFiltersToApiParams(params);
    // Com filtros vai para /busca; sem filtros, lista tudo.
    const hasFilters = apiParams && Object.keys(apiParams).length > 0;
    const endpoint = hasFilters ? `${QUESTION_ENDPOINT}/busca` : QUESTION_ENDPOINT;
    const { data } = hasFilters
      ? await httpClient.get<ListQuestionsResponse>(endpoint, { params: apiParams })
      : await httpClient.get<ListQuestionsResponse>(endpoint);
    return normalizeQuestionListResponse(data).dados.map((question) => normalizeQuestion(question));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Cria uma questao (multipart, com imagem opcional) e devolve ja normalizada.
export const createQuestion = async (
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  if (USE_MOCKS) return createQuestionMock(values);

  const formData = buildFormData(values);

  try {
    const { data } = await httpClient.post<ApiSuccessResponse<Question>>(
      QUESTION_ENDPOINT,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return normalizeQuestion(
      data.dados ?? ({ id: crypto.randomUUID() } as BackendQuestion),
    );
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Atualiza uma questao (multipart, com imagem opcional) e devolve ja normalizada.
export const updateQuestion = async (
  id: string,
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  if (USE_MOCKS) return updateQuestionMock(id, values);

  const formData = buildFormData(values);

  try {
    const { data } = await httpClient.put<ApiSuccessResponse<Question>>(
      `${QUESTION_ENDPOINT}/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return normalizeQuestion(data.dados ?? ({ id } as BackendQuestion));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Exclui uma questao pelo id; lanca Error com mensagem amigavel em caso de falha.
export const deleteQuestion = async (id: string): Promise<void> => {
  if (USE_MOCKS) return deleteQuestionMock(id);

  try {
    await httpClient.delete(`${QUESTION_ENDPOINT}/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// Lista as questoes do professor ja no formato com total/metadados.
export const listarQuestoesProfessor = async (): Promise<ListProfessorQuestionsPayload> => (
  toProfessorQuestionsPayload(await listProfessorQuestions())
);
