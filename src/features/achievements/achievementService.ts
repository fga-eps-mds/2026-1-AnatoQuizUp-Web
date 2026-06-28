// Servico de conquistas (gamificacao). Le o progresso do aluno, o detalhe de uma
// conquista, as conquistas em destaque e alterna o destaque de um desbloqueio.
import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  ListarConquistasParams,
  ProgressoConquista,
  RespostaDestaques,
  RespostaPaginada,
} from './types';

// Prefixo base das rotas de conquistas.
const CONQUISTAS_ENDPOINT = '/conquistas';

// GET /conquistas/meu-progresso — progresso do aluno em todas as conquistas (paginado).
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

// GET /conquistas/:id — detalhe do progresso de uma conquista especifica.
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

// GET /conquistas/destaques — lista as conquistas marcadas como destaque no perfil.
export const listarConquistasDestacadas = async () => {
  try {
    const { data } = await httpClient.get<RespostaDestaques>(`${CONQUISTAS_ENDPOINT}/destaques`);

    return data.dados;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// PATCH /conquistas/desbloqueios/:id/destaque — marca/desmarca um desbloqueio como destaque.
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
