import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  ListarAmigosSociaisParams,
  PerfilSocial,
  RespostaAmigosSociais,
  RespostaPerfilSocial,
} from './types';

export const listarAmigosSociais = async (
  params?: ListarAmigosSociaisParams,
): Promise<RespostaAmigosSociais> => {
  try {
    const { data } = await httpClient.get<RespostaAmigosSociais>('/amizade/amigos/perfis', {
      params,
    });

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const buscarPerfilSocial = async (usuarioId: string): Promise<PerfilSocial> => {
  try {
    const { data } = await httpClient.get<RespostaPerfilSocial>(`/perfis/${usuarioId}/social`);

    return data.dados;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
