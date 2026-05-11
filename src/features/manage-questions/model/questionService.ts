import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import {
  atualizarQuestaoMock,
  buscarQuestaoPorFiltroMock,
  buscarQuestaoPorIdMock,
  listarQuestoesMock,
  removerQuestaoMock,
} from './mockQuestionService';
import type {
  ApiSuccessResponse,
  ListProfessorQuestionsPayload,
  ListQuestionsResponse,
  PaginationMetadata,
  Question,
  QuestionListParams,
  SearchQuestionsParams,
  UpdateQuestionPayload,
} from './types';

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
  response?: Partial<ListQuestionsResponse>,
): ListQuestionsResponse => {
  const dados = Array.isArray(response?.dados) ? response.dados : [];

  return {
    dados,
    metadados: normalizeMetadata(response?.metadados, dados.length),
  };
};

const toProfessorQuestionsPayload = (
  response: ListQuestionsResponse,
): ListProfessorQuestionsPayload => ({
  questoes: response.dados,
  total: response.metadados.total,
  metadados: response.metadados,
});

export const listarQuestoes = async (
  params?: QuestionListParams,
): Promise<ListQuestionsResponse> => {
  if (USE_MOCKS) {
    return normalizeQuestionListResponse(await listarQuestoesMock(params));
  }

  const { data } = await httpClient.get<ListQuestionsResponse>('/questoes', { params });

  return normalizeQuestionListResponse(data);
};

export const buscarQuestaoPorFiltro = async (
  params?: SearchQuestionsParams,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return buscarQuestaoPorFiltroMock(params);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Question>>('/questoes/busca', {
    params,
  });

  return data;
};

export const buscarQuestaoPorId = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return buscarQuestaoPorIdMock(id);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Question>>(`/questoes/${id}`);

  return data;
};

export const atualizarQuestao = async (
  id: string,
  payload: UpdateQuestionPayload,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return atualizarQuestaoMock(id, payload);
  }

  const { data } = await httpClient.put<ApiSuccessResponse<Question>>(`/questoes/${id}`, payload);

  return data;
};

export const removerQuestao = async (
  id: string,
): Promise<ApiSuccessResponse<Question>> => {
  if (USE_MOCKS) {
    return removerQuestaoMock(id);
  }

  const { data } = await httpClient.delete<ApiSuccessResponse<Question>>(`/questoes/${id}`);

  return data;
};

export const listarQuestoesProfessor = async (): Promise<ListProfessorQuestionsPayload> => (
  toProfessorQuestionsPayload(await listarQuestoes())
);
