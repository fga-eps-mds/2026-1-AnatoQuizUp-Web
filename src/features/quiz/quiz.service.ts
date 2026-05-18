import { httpClient } from "../../shared/api/httpClient";
import type { PaginationMetadata, QuestionListParams } from "../manage-questions";
import { extractErrorMessage } from "../manage-questions/model/questionService";
import type { ListQuizQuestionReponse, QuizQuestionAwnser, QuizQuestionFeedback } from "./types";

const QUIZ_ENDPOINT = '/quiz';

const EMPTY_METADATA: PaginationMetadata = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

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

const normalizeQuestionListResponse = (
  response?: Partial<ListQuizQuestionReponse>,
): ListQuizQuestionReponse => {
  const dados = Array.isArray(response?.dados) ? response.dados : [];

  return {
    dados,
    metadados: normalizeMetadata(response?.metadados, dados.length),
  };
};

export const buscarQuestoesQuiz = async (
  params?: QuestionListParams,
): Promise<ListQuizQuestionReponse> => {

  const { data } = await httpClient.get<ListQuizQuestionReponse>(QUIZ_ENDPOINT, { params });

  return normalizeQuestionListResponse(data);
};


export const responderQuestaoQuiz = async (
  values: QuizQuestionAwnser,
): Promise<QuizQuestionFeedback> => {

  try {
    const { data } = await httpClient.post<QuizQuestionFeedback>(
      QUIZ_ENDPOINT,
      values,
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};