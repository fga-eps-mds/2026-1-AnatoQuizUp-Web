import { httpClient } from '../../../shared/api/httpClient';
import type { DetalhesListaAluno, ResumoListaAluno } from '../model/types';

interface RespostaApi<T> {
  mensagem?: string;
  dados: T;
}

export const resolucaoListaApi = {
  listar: async (status?: string, busca?: string) => {
    const res = await httpClient.get<RespostaApi<ResumoListaAluno[]>>('/listasAluno', {
      params: { status, busca }
    });
    return res.data.dados;
  },

  buscarDetalhes: async (listaTurmaId: string) => {
    const res = await httpClient.get<RespostaApi<DetalhesListaAluno>>(`/listasAluno/${listaTurmaId}`);
    return res.data.dados;
  },

  autosave: async (listaTurmaId: string, questaoId: string, alternativaMarcada: string) => {
    const res = await httpClient.post<RespostaApi<null>>(`/listasAluno/${listaTurmaId}/autosave`, {
      questaoId,
      alternativaMarcada
    });
    return res.data;
  },

  submeter: async (listaTurmaId: string) => {
    const res = await httpClient.post<RespostaApi<null>>(`/listasAluno/${listaTurmaId}/submeter`);
    return res.data;
  },

  baixarPdfAluno: async (listaTurmaId: string): Promise<string> => {
    const response = await httpClient.get<{ base64: string }>(`/listasAluno/${listaTurmaId}/pdf`);
    return response.data.base64;
  },
};