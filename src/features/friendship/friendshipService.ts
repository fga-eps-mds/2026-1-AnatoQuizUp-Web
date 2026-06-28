// Servico de amizades. Reune todas as chamadas a API de amizade: buscar colegas,
// enviar/aceitar/recusar convites, listar convites e amigos, desfazer amizade,
// alterar a visibilidade do perfil e buscar o perfil publico de um usuario.
// Toda chamada uniformiza os erros via extractErrorMessage para mensagens amigaveis.
import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  BuscarColegasParams,
  EnviarSolicitacaoResponse,
  ListarAmigosParams,
  ListarConvitesParams,
  MensagemResponse,
  PerfilPublico,
  RespostaPaginada,
  ResumoAmigo,
  ResumoAmizade,
} from './types';

// Prefixo base de todas as rotas de amizade.
const AMIZADE_ENDPOINT = '/amizade';

// Envelope da resposta do perfil publico (mensagem + dados).
type RespostaPerfilPublico = {
  mensagem: string;
  dados: PerfilPublico;
};

// GET /amizade/busca — busca colegas por nome ou nickname (paginado).
export const buscarColegas = async (
  params?: BuscarColegasParams,
): Promise<RespostaPaginada<ResumoAmigo>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<ResumoAmigo>>(
      `${AMIZADE_ENDPOINT}/busca`,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// POST /amizade — envia uma solicitacao de amizade para o usuario informado.
export const enviarSolicitacao = async (
  id: string,
): Promise<EnviarSolicitacaoResponse> => {
  try {
    const { data } = await httpClient.post<EnviarSolicitacaoResponse>(
      AMIZADE_ENDPOINT,
      { id },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// GET /amizade/convites/recebidos — lista os convites pendentes recebidos.
export const listarConvitesRecebidos = async (
  params?: ListarConvitesParams,
): Promise<RespostaPaginada<ResumoAmizade>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<ResumoAmizade>>(
      `${AMIZADE_ENDPOINT}/convites/recebidos`,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// GET /amizade/convites/enviados — lista os convites pendentes enviados.
export const listarConvitesEnviados = async (
  params?: ListarConvitesParams,
): Promise<RespostaPaginada<ResumoAmizade>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<ResumoAmizade>>(
      `${AMIZADE_ENDPOINT}/convites/enviados`,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// PATCH /amizade/aceitar — aceita um convite de amizade pelo id.
export const aceitarConvite = async (id: string): Promise<MensagemResponse> => {
  try {
    const { data } = await httpClient.patch<MensagemResponse>(
      `${AMIZADE_ENDPOINT}/aceitar`,
      { id },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// PATCH /amizade/recusar — recusa um convite de amizade pelo id.
export const recusarConvite = async (id: string): Promise<MensagemResponse> => {
  try {
    const { data } = await httpClient.patch<MensagemResponse>(
      `${AMIZADE_ENDPOINT}/recusar`,
      { id },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// GET /amizade — lista as amizades confirmadas (paginado).
export const listarAmigos = async (
  params?: ListarAmigosParams,
): Promise<RespostaPaginada<ResumoAmizade>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<ResumoAmizade>>(
      AMIZADE_ENDPOINT,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// DELETE /amizade — desfaz uma amizade (id no corpo da requisicao).
export const desfazerAmizade = async (id: string): Promise<MensagemResponse> => {
  try {
    const { data } = await httpClient.delete<MensagemResponse>(
      AMIZADE_ENDPOINT,
      { data: { id } },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// PATCH /amizade/visibilidade — define se o perfil aparece para outros alunos.
export const alterarVisibilidade = async (
  visivel: boolean,
): Promise<MensagemResponse> => {
  try {
    const { data } = await httpClient.patch<MensagemResponse>(
      `${AMIZADE_ENDPOINT}/visibilidade`,
      { visivel },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// GET /usuarios/:id/perfil — busca o perfil publico de um usuario especifico.
export const buscarPerfilPublico = async (id: string): Promise<PerfilPublico> => {
  try {
    const { data } = await httpClient.get<RespostaPerfilPublico>(
      `/usuarios/${id}/perfil`,
    );

    return data.dados;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
