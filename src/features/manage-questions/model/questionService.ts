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

type BackendQuestionAlternatives =
  | BackendQuestionAlternative[]
  | Record<string, string | BackendQuestionAlternative | undefined>;

type BackendQuestion = {
  id: string;
  tema?: string | { id?: string; nome?: string };
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
  alternativaCorreta?: string;
  explicacaoPedagogica?: string;
  alternativas?: BackendQuestionAlternatives;
  alternatives?: BackendQuestionAlternatives;
  criadoEm?: string;
  createdAt?: string;
};

const QUESTION_ENDPOINT = '/questoes';
const DEFAULT_QUESTION_IMAGE_URL = 'https://placehold.co/600x400?text=AnatoQuizUp';
const DEFAULT_PEDAGOGICAL_EXPLANATION = 'Explicação pedagógica não informada.';

const mapTypeToApi = (type: QuestionType) => (
  type === 'Múltipla escolha' ? 'MULTIPLA_ESCOLHA' : 'VERDADEIRO_FALSO'
);

// Futuro: reativar quando o backend persistir dificuldade na tabela de questoes.
// const mapDifficultyToApi = (difficulty: QuestionDifficulty) => {
//   if (difficulty === 'Fácil') return 'FACIL';
//   if (difficulty === 'Difícil') return 'DIFICIL';
//   return 'MEDIO';
// };

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

const normalizeTopic = (tema?: BackendQuestion['tema'], topic?: string): string => {
  if (topic) return topic;
  if (typeof tema === 'string') return tema;
  return tema?.nome ?? '';
};

const normalizeAlternatives = (
  alternatives: BackendQuestionAlternatives | undefined,
  correctAlternative?: string,
): QuestionAlternative[] => {
  if (Array.isArray(alternatives)) {
    return alternatives.map(normalizeAlternative);
  }

  if (!alternatives) return [];

  return Object.entries(alternatives)
    .filter(([, value]) => value !== undefined)
    .map(([label, value], index) => {
      if (typeof value === 'string') {
        return {
          id: label,
          label,
          text: value,
          isCorrect: label === correctAlternative,
        };
      }

      const alternative = value ?? {};
      return normalizeAlternative({ ...alternative, letra: alternative.letra ?? label }, index);
    });
};

const normalizeQuestion = (question: BackendQuestion): ProfessorQuestion => ({
  id: question.id,
  topic: normalizeTopic(question.tema, question.topic),
  tags: normalizeTags(question.tags),
  type: mapTypeFromApi(question.type ?? question.tipo),
  difficulty: mapDifficultyFromApi(question.difficulty ?? question.dificuldade),
  origin: question.origin ?? question.origem ?? 'Manual',
  statement: question.statement ?? question.enunciado ?? '',
  explanation: question.explanation ?? question.explicacao ?? question.explicacaoPedagogica ?? '',
  alternatives: normalizeAlternatives(
    question.alternatives ?? question.alternativas,
    question.alternativaCorreta,
  ),
  createdAt: formatDate(question.createdAt ?? question.criadoEm),
});

const mapAlternativeLabelToApi = (label: string) => {
  if (label === 'V') return 'C';
  if (label === 'F') return 'E';
  return label;
};

const mapValuesToPayload = (values: QuestionFormValues) => {
  const correctAlternative = values.alternatives.find((alternative) => alternative.isCorrect);

  return {
    tema: values.topic,
    // Futuro: reativar quando o backend persistir tags, dificuldade e origem.
    // tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    // dificuldade: mapDifficultyToApi(values.difficulty),
    // origem: values.origin || 'Manual',
    tipo: mapTypeToApi(values.type),
    imagem: DEFAULT_QUESTION_IMAGE_URL,
    enunciado: values.statement.trim(),
    alternativaCorreta: correctAlternative
      ? mapAlternativeLabelToApi(correctAlternative.label)
      : undefined,
    explicacaoPedagogica: values.explanation.trim() || DEFAULT_PEDAGOGICAL_EXPLANATION,
    alternativas: values.alternatives.reduce<Record<string, string>>((acc, alternative) => {
      acc[mapAlternativeLabelToApi(alternative.label)] = alternative.text.trim();
      return acc;
    }, {}),
  };
};

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
    const { data } = await httpClient.get<ApiSuccessResponse<BackendQuestion[]>>(QUESTION_ENDPOINT);
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
