import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  OpcaoListaTurma,
  RankingAlunoResposta,
  RankingListaResposta,
  RankingTurmaResposta,
} from './types';

export const obterRankingGeral = async (limite?: number): Promise<RankingAlunoResposta> => {
  try {
    const { data } = await httpClient.get<RankingAlunoResposta>('/ranking/geral', {
      params: limite ? { limite } : undefined,
    });
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const obterRankingAmigos = async (): Promise<RankingAlunoResposta> => {
  try {
    const { data } = await httpClient.get<RankingAlunoResposta>('/ranking/amigos');
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const obterRankingTurma = async (turmaId: string): Promise<RankingTurmaResposta> => {
  try {
    const { data } = await httpClient.get<RankingTurmaResposta>(`/ranking/turmas/${turmaId}`);
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const obterRankingLista = async (
  turmaId: string,
  listaTurmaId: string,
): Promise<RankingListaResposta> => {
  try {
    const { data } = await httpClient.get<RankingListaResposta>(
      `/ranking/listas/${turmaId}/${listaTurmaId}`,
    );
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Lista as listas vinculadas a uma turma, reaproveitando o dashboard de turma
 * (que ja expoe listaTurmaId + nomeLista). Usado para o seletor de listas no
 * ranking do professor.
 */
export const obterListasDaTurma = async (turmaId: string): Promise<OpcaoListaTurma[]> => {
  try {
    const { data } = await httpClient.get<Array<{ listaTurmaId: string; nomeLista: string }>>(
      `/turmasDashboard/${turmaId}/listas`,
    );
    return data.map((item) => ({ listaTurmaId: item.listaTurmaId, nomeLista: item.nomeLista }));
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
