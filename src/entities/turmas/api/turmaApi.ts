import { httpClient } from '../../../shared/api/httpClient';
import type { Turma, StatusTurma } from '../model/types';

interface FiltrosTurma {
  busca?: string;
  status?: StatusTurma;
}

export const listarTurmas = async (filtros?: FiltrosTurma) => {
  const response = await httpClient.get<{ mensagem: string; dados: Turma[] }>('/turmas', {
    params: filtros,
  });
  return response.data.dados;
};

export const excluirTurma = async (id: string) => {
  await httpClient.delete(`/turmas/${id}`);
};