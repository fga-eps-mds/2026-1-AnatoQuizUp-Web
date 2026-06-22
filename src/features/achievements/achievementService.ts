import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  ListarConquistasParams,
  ProgressoConquista,
  RespostaDestaques,
  RespostaPaginada,
} from './types';

const CONQUISTAS_ENDPOINT = '/conquistas';

export const listarProgressoConquistas = async (
  params?: ListarConquistasParams,
): Promise<RespostaPaginada<ProgressoConquista>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<ProgressoConquista>>(
      `${CONQUISTAS_ENDPOINT}/meu-progresso`,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const buscarDetalheConquista = async (conquistaId: string): Promise<ProgressoConquista> => {
  try {
    const { data } = await httpClient.get<ProgressoConquista>(
      `${CONQUISTAS_ENDPOINT}/${conquistaId}`,
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const listarConquistasDestacadas = async () => {
  try {
    const { data } = await httpClient.get<RespostaDestaques>(`${CONQUISTAS_ENDPOINT}/destaques`);

    return data.dados;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const alterarDestaqueConquista = async (desbloqueioId: string, destaque: boolean) => {
  try {
    const { data } = await httpClient.patch(
      `${CONQUISTAS_ENDPOINT}/desbloqueios/${desbloqueioId}/destaque`,
      { destaque },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
