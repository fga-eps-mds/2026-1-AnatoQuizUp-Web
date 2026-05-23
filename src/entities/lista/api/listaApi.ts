import { httpClient } from '../../../shared/api/httpClient';
import type {
  AtualizarListaPayload,
  CriarListaPayload,
  FiltrosLista,
  ListaQuestao,
  QuestaoVinculada,
  StatusLista,
  TurmaVinculada,
} from '../model/types';

type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

interface ListaTurmaApi {
  id?: string;
  turmaId?: string;
  nome?: string;
  turma?: {
    id: string;
    nome: string;
  };
}

interface ListaQuestaoItemApi {
  id: string;
  questaoId: string;
  ordem: number;
  questao?: {
    id: string;
    enunciado: string;
    tipoQuestao?: string;
    dificuldade?: string;
    tema?: {
      id: string;
      nome: string;
    };
  };
}

interface ListaQuestaoApi {
  id: string;
  nome: string;
  quantidadeQuestoes?: number;
  status?: StatusLista;
  turmas?: ListaTurmaApi[];
  itens?: ListaQuestaoItemApi[];
  criadoEm: string;
  atualizadoEm?: string;
}

const normalizarTurmas = (turmas?: ListaTurmaApi[]): TurmaVinculada[] => (
  (turmas ?? []).map((vinculo) => ({
    id: vinculo.turma?.id ?? vinculo.id ?? vinculo.turmaId ?? '',
    nome: vinculo.turma?.nome ?? vinculo.nome ?? 'Turma sem nome',
  })).filter((turma) => turma.id)
);

const normalizarQuestoes = (itens?: ListaQuestaoItemApi[]): QuestaoVinculada[] => (
  (itens ?? [])
    .map((item) => ({
      id: item.questao?.id ?? item.questaoId,
      enunciado: item.questao?.enunciado ?? 'Questao sem enunciado',
      tema: item.questao?.tema?.nome,
      tipo: item.questao?.tipoQuestao,
      dificuldade: item.questao?.dificuldade,
      ordem: item.ordem,
    }))
    .sort((a, b) => a.ordem - b.ordem)
);

const formatarData = (data?: string) => {
  if (!data) return '';

  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime())) return data;

  return dataConvertida.toLocaleDateString('pt-BR');
};

const normalizarLista = (lista: ListaQuestaoApi): ListaQuestao => {
  const turmas = normalizarTurmas(lista.turmas);
  const questoes = normalizarQuestoes(lista.itens);

  return {
    id: lista.id,
    nome: lista.nome,
    quantidadeQuestoes: lista.quantidadeQuestoes ?? questoes.length,
    turmas,
    status: lista.status ?? (turmas.length > 0 ? 'PUBLICADA' : 'RASCUNHO'),
    criadoEm: formatarData(lista.criadoEm),
    atualizadoEm: formatarData(lista.atualizadoEm),
    questoes,
  };
};

export const listarListas = async (filtros?: FiltrosLista): Promise<ListaQuestao[]> => {
  const response = await httpClient.get<RespostaApi<ListaQuestaoApi[]>>('/lista', {
    params: filtros,
  });
  return response.data.dados.map(normalizarLista);
};

export const buscarLista = async (id: string): Promise<ListaQuestao> => {
  const response = await httpClient.get<RespostaApi<ListaQuestaoApi>>(`/lista/${id}`);
  return normalizarLista(response.data.dados);
};

export const criarLista = async (payload: CriarListaPayload): Promise<ListaQuestao> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>('/lista', payload);
  return normalizarLista(response.data.dados);
};

export const atualizarLista = async (
  id: string,
  payload: AtualizarListaPayload,
): Promise<ListaQuestao> => {
  const response = await httpClient.patch<RespostaApi<ListaQuestaoApi>>(`/lista/${id}`, payload);
  return normalizarLista(response.data.dados);
};

export const excluirLista = async (id: string): Promise<void> => {
  await httpClient.delete(`/lista/${id}`);
};

export const vincularQuestoesLista = async (
  id: string,
  questoesIds: string[],
): Promise<ListaQuestao> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>(`/lista/${id}/questoes`, {
    questoesIds,
  });
  return normalizarLista(response.data.dados);
};

export const desvincularQuestaoLista = async (
  id: string,
  questaoId: string,
): Promise<ListaQuestao> => {
  const response = await httpClient.delete<RespostaApi<ListaQuestaoApi>>(
    `/lista/${id}/questoes/${questaoId}`,
  );
  return normalizarLista(response.data.dados);
};

export const reordenarQuestoesLista = async (
  id: string,
  questoesIds: string[],
): Promise<ListaQuestao> => {
  const response = await httpClient.patch<RespostaApi<ListaQuestaoApi>>(`/lista/${id}/questoes/ordem`, {
    questoesIds,
  });
  return normalizarLista(response.data.dados);
};

export const vincularTurmasLista = async (
  id: string,
  turmasIds: string[],
): Promise<ListaQuestao> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>(`/lista/${id}/turmas`, {
    turmasIds,
  });
  return normalizarLista(response.data.dados);
};

export const desvincularTurmaLista = async (
  id: string,
  turmaId: string,
): Promise<ListaQuestao> => {
  const response = await httpClient.delete<RespostaApi<ListaQuestaoApi>>(
    `/lista/${id}/turmas/${turmaId}`,
  );
  return normalizarLista(response.data.dados);
};
