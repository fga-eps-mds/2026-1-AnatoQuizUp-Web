import { httpClient } from '../../shared/api/httpClient';
import type { HistoricoQuizResponse } from './types';

export type BuscarHistoricoParams = {
  page: number;
  limit: number;
  tema?: string;
  dificuldade?: string;
};

export const buscarHistoricoQuiz = async (params: BuscarHistoricoParams): Promise<HistoricoQuizResponse> => {
  const { data } = await httpClient.get<HistoricoQuizResponse>('/quiz/historico', { params });
  return data;
};