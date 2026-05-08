import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import {
  createQuestionMock,
  deleteQuestionMock,
  listProfessorQuestionsMock,
  updateQuestionMock,
} from './mockQuestionService';
import type {
  ProfessorQuestion,
  QuestionAlternative,
  QuestionDifficulty,
  QuestionFormValues,
  QuestionType,
} from './types';

type ApiSuccessResponse<T> = {
  mensagem?: string;
  dados?: T;
};

type BackendQuestionAlternative = {
  id?: string;
  letra?: string;
  label?: string;
  texto?: string;
  text?: string;
  correta?: boolean;
  isCorrect?: boolean;
};

type BackendQuestion = {
  id: string;
  tema?: string;
  topic?: string;
  tags?: string[] | string;
  tipo?: string;
  type?: string;
  dificuldade?: string;
  difficulty?: string;
  origem?: string;
  origin?: string;
  enunciado?: string;
  statement?: string;
  explicacao?: string;
  explanation?: string;
  alternativas?: BackendQuestionAlternative[];
  alternatives?: BackendQuestionAlternative[];
  criadoEm?: string;
  createdAt?: string;
};

const QUESTION_ENDPOINT = '/questoes';
const PROFESSOR_ACTIVE_QUESTIONS_ENDPOINT = '/questoes/professor/ativas';

const mapTypeToApi = (type: QuestionType) => (
  type === 'Múltipla escolha' ? 'MULTIPLA_ESCOLHA' : 'VERDADEIRO_FALSO'
);

const mapDifficultyToApi = (difficulty: QuestionDifficulty) => {
  if (difficulty === 'Fácil') return 'FACIL';
  if (difficulty === 'Difícil') return 'DIFICIL';
  return 'MEDIO';
};

const mapTypeFromApi = (type?: string): QuestionType => (
  /verdadeiro|falso|true_false|vf/i.test(type ?? '')
    ? 'Verdadeiro/Falso'
    : 'Múltipla escolha'
);

const mapDifficultyFromApi = (difficulty?: string): QuestionDifficulty => {
  if (/facil|fácil|easy/i.test(difficulty ?? '')) return 'Fácil';
  if (/dificil|difícil|hard/i.test(difficulty ?? '')) return 'Difícil';
  return 'Médio';
};

const formatDate = (date?: string) => {
  if (!date) return '';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
};

const normalizeTags = (tags?: string[] | string): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
};

const normalizeAlternative = (
  alternative: BackendQuestionAlternative,
  index: number,
): QuestionAlternative => ({
  id: alternative.id ?? String(index),
  label: alternative.label ?? alternative.letra ?? String.fromCharCode(65 + index),
  text: alternative.text ?? alternative.texto ?? '',
  isCorrect: Boolean(alternative.isCorrect ?? alternative.correta),
});

const normalizeQuestion = (question: BackendQuestion): ProfessorQuestion => ({
  id: question.id,
  topic: question.topic ?? question.tema ?? '',
  tags: normalizeTags(question.tags),
  type: mapTypeFromApi(question.type ?? question.tipo),
  difficulty: mapDifficultyFromApi(question.difficulty ?? question.dificuldade),
  origin: question.origin ?? question.origem ?? 'Manual',
  statement: question.statement ?? question.enunciado ?? '',
  explanation: question.explanation ?? question.explicacao ?? '',
  alternatives: (question.alternatives ?? question.alternativas ?? []).map(normalizeAlternative),
  createdAt: formatDate(question.createdAt ?? question.criadoEm),
});

const mapValuesToPayload = (values: QuestionFormValues) => ({
  tema: values.topic,
  tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  tipo: mapTypeToApi(values.type),
  dificuldade: mapDifficultyToApi(values.difficulty),
  origem: values.origin || 'Manual',
  enunciado: values.statement.trim(),
  explicacao: values.explanation.trim() || null,
  alternativas: values.alternatives.map((alternative) => ({
    letra: alternative.label,
    texto: alternative.text.trim(),
    correta: alternative.isCorrect,
  })),
});

const extractErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'Nao foi possivel conectar ao servidor. Tente novamente.';
  }

  const data = error.response.data as {
    message?: string;
    mensagem?: string;
    erro?: { mensagem?: string };
  };

  return data.erro?.mensagem ?? data.mensagem ?? data.message ?? 'Nao foi possivel processar a questao.';
};

export const listProfessorQuestions = async (): Promise<ProfessorQuestion[]> => {
  if (USE_MOCKS) return listProfessorQuestionsMock();

  try {
    const { data } = await httpClient.get<ApiSuccessResponse<BackendQuestion[]>>(
      PROFESSOR_ACTIVE_QUESTIONS_ENDPOINT,
    );
    return (data.dados ?? []).map(normalizeQuestion);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const createQuestion = async (values: QuestionFormValues): Promise<ProfessorQuestion> => {
  if (USE_MOCKS) return createQuestionMock(values);

  try {
    const { data } = await httpClient.post<ApiSuccessResponse<BackendQuestion>>(
      QUESTION_ENDPOINT,
      mapValuesToPayload(values),
    );
    return normalizeQuestion(data.dados ?? ({ id: crypto.randomUUID(), ...mapValuesToPayload(values) } as BackendQuestion));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateQuestion = async (
  id: string,
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  if (USE_MOCKS) return updateQuestionMock(id, values);

  try {
    const { data } = await httpClient.put<ApiSuccessResponse<BackendQuestion>>(
      `${QUESTION_ENDPOINT}/${id}`,
      mapValuesToPayload(values),
    );
    return normalizeQuestion(data.dados ?? ({ id, ...mapValuesToPayload(values) } as BackendQuestion));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteQuestion = async (id: string): Promise<void> => {
  if (USE_MOCKS) return deleteQuestionMock(id);

  try {
    await httpClient.delete(`${QUESTION_ENDPOINT}/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
