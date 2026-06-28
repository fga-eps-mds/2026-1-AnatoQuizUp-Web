// Cliente de API da entidade "Lista de questoes". Encapsula todas as chamadas
// HTTP relacionadas a listas (CRUD, vinculo de questoes, vinculo com turmas e
// geracao de PDF) e normaliza as respostas cruas da API para os tipos de dominio
// usados pela aplicacao, preenchendo defaults e formatando datas.
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

// Envelope padrao das respostas da API: mensagem opcional + payload em "dados".
type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

// Formato cru do vinculo lista-turma como vem da API (campos opcionais/variados).
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

// Formato cru de um vinculo lista-turma ja resumido pela API.
interface VinculoListaTurmaApi {
  id: string;
  listaQuestaoId: string;
  nome: string;
  quantidadeQuestoes: number;
  prazo: string | null;
  gabaritoLiberado: boolean;
}

// Formato cru de um item (questao) dentro de uma lista, com a questao aninhada.
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

// Formato cru de uma lista de questoes completa vinda da API.
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

/**
 * Normaliza a lista de turmas vinculadas, tolerando os varios formatos de id/nome
 * e descartando entradas sem id valido.
 * @param turmas vinculos crus vindos da API
 */
const normalizarTurmas = (turmas?: ListaTurmaApi[]): TurmaVinculada[] => (
  (turmas ?? []).map((vinculo) => ({
    id: vinculo.turma?.id ?? vinculo.id ?? vinculo.turmaId ?? '',
    nome: vinculo.turma?.nome ?? vinculo.nome ?? 'Turma sem nome',
  })).filter((turma) => turma.id)
);

/**
 * Normaliza os itens da lista em questoes de dominio e as ordena pelo campo `ordem`.
 * @param itens itens crus da lista vindos da API
 */
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

/**
 * Formata uma data ISO para o padrao curto pt-BR; vazio se ausente, original se invalida.
 * @param data data em formato ISO
 */
const formatarData = (data?: string) => {
  if (!data) return '';

  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime())) return data;

  return dataConvertida.toLocaleDateString('pt-BR');
};

/**
 * Converte uma lista crua da API no tipo de dominio, derivando quantidade de
 * questoes, status (PUBLICADA se tem turma, senao RASCUNHO) e datas formatadas.
 * @param lista lista crua da API
 */
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

// Converte o vinculo lista-turma cru no tipo de dominio (mapeamento direto).
const normalizarVinculoListaTurma = (vinculo: VinculoListaTurmaApi): VinculoListaTurma => ({
  id: vinculo.id,
  listaQuestaoId: vinculo.listaQuestaoId,
  nome: vinculo.nome,
  quantidadeQuestoes: vinculo.quantidadeQuestoes,
  prazo: vinculo.prazo,
  gabaritoLiberado: vinculo.gabaritoLiberado,
});

/**
 * Extrai, de uma lista que acabou de ser vinculada, o vinculo correspondente a
 * uma turma especifica, ja no tipo de dominio.
 * @param lista lista crua retornada apos o vinculo
 * @param turmaId turma cujo vinculo se deseja
 * @throws Error se o vinculo nao estiver presente na resposta
 */
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

// GET /lista — lista as listas do professor aplicando filtros opcionais.
export const listarListas = async (filtros?: FiltrosLista): Promise<ListaQuestao[]> => {
  const response = await httpClient.get<RespostaApi<ListaQuestaoApi[]>>('/lista', {
    params: filtros,
  });
  return response.data.dados.map(normalizarLista);
};

// GET /lista/:id — busca uma lista especifica por id.
export const buscarLista = async (id: string): Promise<ListaQuestao> => {
  const response = await httpClient.get<RespostaApi<ListaQuestaoApi>>(`/lista/${id}`);
  return normalizarLista(response.data.dados);
};

// POST /lista — cria uma nova lista.
export const criarLista = async (payload: CriarListaPayload): Promise<ListaQuestao> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>('/lista', payload);
  return normalizarLista(response.data.dados);
};

// PATCH /lista/:id — atualiza os dados de uma lista (ex.: nome).
export const atualizarLista = async (
  id: string,
  payload: AtualizarListaPayload,
): Promise<ListaQuestao> => {
  const response = await httpClient.patch<RespostaApi<ListaQuestaoApi>>(`/lista/${id}`, payload);
  return normalizarLista(response.data.dados);
};

// DELETE /lista/:id — exclui uma lista.
export const excluirLista = async (id: string): Promise<void> => {
  await httpClient.delete(`/lista/${id}`);
};

// POST /lista/:id/questoes — vincula um conjunto de questoes a lista.
export const vincularQuestoesLista = async (
  id: string,
  questoesIds: string[],
): Promise<ListaQuestao> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>(`/lista/${id}/questoes`, {
    questoesIds,
  });
  return normalizarLista(response.data.dados);
};

// DELETE /lista/:id/questoes/:questaoId — remove uma questao da lista.
export const desvincularQuestaoLista = async (
  id: string,
  questaoId: string,
): Promise<ListaQuestao> => {
  const response = await httpClient.delete<RespostaApi<ListaQuestaoApi>>(
    `/lista/${id}/questoes/${questaoId}`,
  );
  return normalizarLista(response.data.dados);
};

// PATCH /lista/:id/questoes/ordem — reordena as questoes conforme a sequencia de ids.
export const reordenarQuestoesLista = async (
  id: string,
  questoesIds: string[],
): Promise<ListaQuestao> => {
  const response = await httpClient.patch<RespostaApi<ListaQuestaoApi>>(`/lista/${id}/questoes/ordem`, {
    questoesIds,
  });
  return normalizarLista(response.data.dados);
};

// POST /lista/:id/turmas — vincula a lista a varias turmas de uma vez.
export const vincularTurmasLista = async (
  id: string,
  turmasIds: string[],
): Promise<ListaQuestao> => {
  const response = await httpClient.post<RespostaApi<ListaQuestaoApi>>(`/lista/${id}/turmas`, {
    turmasIds,
  });
  return normalizarLista(response.data.dados);
};

/**
 * POST /lista/:id/turmas — vincula a lista a uma turma especifica com prazo e
 * liberacao de gabarito, devolvendo apenas o vinculo criado.
 * @param listaId id da lista
 * @param turmaId id da turma
 * @param payload prazo/gabarito opcionais
 */
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

// PATCH /lista/:listaId/turmas/:turmaId — atualiza prazo/gabarito de um vinculo.
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

// GET /lista/turma/:turmaId/vinculos — lista as listas publicadas em uma turma.
export const listarVinculosDaTurma = async (turmaId: string): Promise<VinculoListaTurma[]> => {
  const response = await httpClient.get<RespostaApi<VinculoListaTurmaApi[]>>(
    `/lista/turma/${turmaId}/vinculos`,
  );
  return response.data.dados.map(normalizarVinculoListaTurma);
};

// DELETE /lista/:id/turmas/:turmaId — desvincula a lista de uma turma.
export const desvincularTurmaLista = async (
  id: string,
  turmaId: string,
): Promise<ListaQuestao> => {
  const response = await httpClient.delete<RespostaApi<ListaQuestaoApi>>(
    `/lista/${id}/turmas/${turmaId}`,
  );
  return normalizarLista(response.data.dados);
};

// GET /lista/:id/pdf — retorna o PDF da lista codificado em base64.
export const baixarPdfLista = async (listaId: string): Promise<string> => {
  const response = await httpClient.get<{ base64: string }>(`/lista/${listaId}/pdf`);
  return response.data.base64;
};
