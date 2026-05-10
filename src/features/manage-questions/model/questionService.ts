import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import { listarQuestoesProfessorMock } from './mockQuestionService';
import type { ApiSuccessResponse, ListProfessorQuestionsPayload } from './types';

const EMPTY_QUESTIONS_PAYLOAD: ListProfessorQuestionsPayload = {
  questoes: [],
  total: 0,
};

const normalizeQuestionsPayload = (
  payload?: Partial<ListProfessorQuestionsPayload>,
): ListProfessorQuestionsPayload => {
  const questoes = Array.isArray(payload?.questoes) ? payload.questoes : [];

  return {
    questoes,
    total: typeof payload?.total === 'number' ? payload.total : questoes.length,
  };
};

export const listarQuestoesProfessor = async (): Promise<ListProfessorQuestionsPayload> => {
  if (USE_MOCKS) {
    const response = await listarQuestoesProfessorMock();
    return normalizeQuestionsPayload(response.dados);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<ListProfessorQuestionsPayload>>(
    '/questoes',
  );

  return normalizeQuestionsPayload(data.dados ?? EMPTY_QUESTIONS_PAYLOAD);
};
