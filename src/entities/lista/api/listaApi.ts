import { httpClient } from '../../../shared/api/httpClient';
import type {
  AtualizarListaPayload,
  AtualizarVinculoListaTurmaPayload,
  CriarListaPayload,
  FiltrosLista,
  ListaQuestao,
  QuestaoVinculada,
  StatusLista,
  TurmaVinculada,
  VinculoListaTurma,
  VincularListaTurmaPayload,
} from '../model/types';

type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

interface ListaTurmaApi {
  id?: string;
  listaQuestaoId?: string;
  turmaId?: string;
  nome?: string;
  prazo?: string | null;
  gabaritoLiberado?: boolean;
  turma?: {
    id: string;
    nome: string;
  };
}

interface VinculoListaTurmaApi {
  id: string;
  listaQuestaoId: string;
  nome: string;
  quantidadeQuestoes: number;
  prazo: string | null;
  gabaritoLiberado: boolean;
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

const normalizarVinculoListaTurma = (vinculo: VinculoListaTurmaApi): VinculoListaTurma => ({
  id: vinculo.id,
  listaQuestaoId: vinculo.listaQuestaoId,
  nome: vinculo.nome,
  quantidadeQuestoes: vinculo.quantidadeQuestoes,
  prazo: vinculo.prazo,
  gabaritoLiberado: vinculo.gabaritoLiberado,
});

const normalizarVinculoDaLista = (
  lista: ListaQuestaoApi,
  turmaId: string,
): VinculoListaTurma => {
  const vinculo = lista.turmas?.find((item) => item.turmaId === turmaId || item.turma?.id === turmaId);

  if (!vinculo?.id) {
    throw new Error('Vinculo lista-turma nao encontrado na resposta da API.');
  }

  return {
    id: vinculo.id,
    listaQuestaoId: vinculo.listaQuestaoId ?? lista.id,
    nome: lista.nome,
    quantidadeQuestoes: lista.quantidadeQuestoes ?? lista.itens?.length ?? 0,
    prazo: vinculo.prazo ?? null,
    gabaritoLiberado: vinculo.gabaritoLiberado ?? false,
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

export const vincularListaTurma = async (
  listaId: string,
  turmaId: string,
  payload: VincularListaTurmaPayload = {},
): Promise<VinculoListaTurma> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>(`/lista/${listaId}/turmas`, {
    turmaId,
    ...payload,
  });
  return normalizarVinculoDaLista(response.data.dados, turmaId);
};

export const atualizarVinculoListaTurma = async (
  listaId: string,
  turmaId: string,
  payload: AtualizarVinculoListaTurmaPayload,
): Promise<VinculoListaTurma> => {
  const response = await httpClient.patch<RespostaApi<VinculoListaTurmaApi>>(
    `/lista/${listaId}/turmas/${turmaId}`,
    payload,
  );
  return normalizarVinculoListaTurma(response.data.dados);
};

export const listarVinculosDaTurma = async (turmaId: string): Promise<VinculoListaTurma[]> => {
  const response = await httpClient.get<RespostaApi<VinculoListaTurmaApi[]>>(
    `/lista/turma/${turmaId}/vinculos`,
  );
  return response.data.dados.map(normalizarVinculoListaTurma);
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

export const baixarPdfLista = async (listaId: string): Promise<string> => {
  const response = await httpClient.get<{ base64: string }>(`/lista/${listaId}/pdf`);
  return response.data.base64;
};
