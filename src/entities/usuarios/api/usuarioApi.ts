import { httpClient } from '../../../shared/api/httpClient';
import type { ResultadoBuscaAlunos, UsuarioPublico, UsuarioResumo } from '../model/types';

type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

interface BuscarAlunosParams {
  busca?: string;
  page?: number;
  limit?: number;
}

export const buscarAlunos = async (params?: BuscarAlunosParams) => {
  const response = await httpClient.get<ResultadoBuscaAlunos>('/usuarios/alunos', {
    params,
  });
  return response.data;
};

export const buscarUsuariosPorIds = async (ids: string[]) => {
  if (ids.length === 0) {
    return [];
  }

  const response = await httpClient.get<RespostaApi<UsuarioResumo[]>>('/usuarios', {
    params: {
      ids: ids.join(','),
    },
  });

  return response.data.dados;
};

export const buscarUsuarioPorId = async (id: string): Promise<UsuarioPublico> => {
  const response = await httpClient.get<RespostaApi<UsuarioPublico>>(`/usuarios/${id}`);
  return response.data.dados;
};
