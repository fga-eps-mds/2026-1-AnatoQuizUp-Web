// Cliente de API da resolucao de listas pelo aluno. Agrupa as chamadas do fluxo
// de responder uma lista: listar as listas da turma, abrir os detalhes, salvar
// respostas automaticamente (autosave), submeter e baixar o PDF do aluno.
import { httpClient } from '../../../shared/api/httpClient';
import type { DetalhesListaAluno, ResumoListaAluno } from '../model/types';

// Envelope padrao das respostas (mensagem opcional + payload em "dados").
interface RespostaApi<T> {
  mensagem?: string;
  dados: T;
}

export const resolucaoListaApi = {

  // GET /listasAluno — lista as listas disponiveis para o aluno (filtros opcionais).
  listar: async (turmaId: string, status?: string, busca?: string) => {
    const res = await httpClient.get<RespostaApi<ResumoListaAluno[]>>('/listasAluno', {
      params: { turmaId, status, busca }
    });
    return res.data.dados;
  },

  // GET /listasAluno/:id — detalhes de uma lista (questoes e respostas salvas).
  buscarDetalhes: async (listaTurmaId: string) => {
    const res = await httpClient.get<RespostaApi<DetalhesListaAluno>>(`/listasAluno/${listaTurmaId}`);
    return res.data.dados;
  },

  // POST /listasAluno/:id/autosave — salva a alternativa marcada de uma questao.
  autosave: async (listaTurmaId: string, questaoId: string, alternativaMarcada: string) => {
    const res = await httpClient.post<RespostaApi<null>>(`/listasAluno/${listaTurmaId}/autosave`, {
      questaoId,
      alternativaMarcada
    });
    return res.data;
  },

  // POST /listasAluno/:id/submeter — finaliza e entrega a lista.
  submeter: async (listaTurmaId: string) => {
    const res = await httpClient.post<RespostaApi<null>>(`/listasAluno/${listaTurmaId}/submeter`);
    return res.data;
  },

  // GET /listasAluno/:id/pdf — PDF da lista do aluno, em base64.
  baixarPdfAluno: async (listaTurmaId: string): Promise<string> => {
    const response = await httpClient.get<{ base64: string }>(`/listasAluno/${listaTurmaId}/pdf`);
    return response.data.base64;
  },
};