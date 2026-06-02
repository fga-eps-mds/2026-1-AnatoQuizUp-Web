import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  BuscarColegasParams,
  EnviarSolicitacaoResponse,
  ListarAmigosParams,
  ListarConvitesParams,
  MensagemResponse,
  RespostaPaginada,
  ResumoAmigo,
  ResumoAmizade,
} from './types';

const AMIZADE_ENDPOINT = '/amizade';

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
