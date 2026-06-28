// Cliente de API da entidade "Usuarios". Fornece a busca de alunos (paginada),
// a busca de varios usuarios por ids e a busca de um usuario publico por id.
import { httpClient } from '../../../shared/api/httpClient';
import type { ResultadoBuscaAlunos, UsuarioPublico, UsuarioResumo } from '../model/types';

// Envelope padrao das respostas (mensagem opcional + payload em "dados").
type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

// Parametros de busca de alunos (texto e paginacao).
interface BuscarAlunosParams {
  busca?: string;
  page?: number;
  limit?: number;
}

// GET /usuarios/alunos — busca alunos com filtro de texto e paginacao.
export const buscarAlunos = async (params?: BuscarAlunosParams) => {
  const response = await httpClient.get<ResultadoBuscaAlunos>('/usuarios/alunos', {
    params,
  });
  return response.data;
};

// GET /usuarios?ids=a,b,c — busca varios usuarios por id (curto-circuita se vazio).
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

// GET /usuarios/:id — busca o perfil publico de um usuario por id.
export const buscarUsuarioPorId = async (id: string): Promise<UsuarioPublico> => {
  const response = await httpClient.get<RespostaApi<UsuarioPublico>>(`/usuarios/${id}`);
  return response.data.dados;
};
