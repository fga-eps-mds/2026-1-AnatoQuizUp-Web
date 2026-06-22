import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import { buscarPerfilSocial } from '../social-profile/socialProfileService';
import type { EquipadosPorUsuario, RespostaEquipados, SlotsCosmeticos } from './types';
import { converterItensEquipadosParaSlots } from './types';

const EQUIPADOS_ENDPOINT = '/inventario/meuPerfil';

export const buscarEquipados = async (): Promise<SlotsCosmeticos> => {
  try {
    const { data } = await httpClient.get<RespostaEquipados>(EQUIPADOS_ENDPOINT);

    return converterItensEquipadosParaSlots(data.dados);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Compatibilidade temporaria para consumidores antigos.
 * Novas telas devem usar os endpoints agregados de perfil social.
 */
export const buscarEquipadosDe = async (ids: string[]): Promise<EquipadosPorUsuario> => {
  const idsNormalizados = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  const perfis = await Promise.all(
    idsNormalizados.map(async (id) => [id, await buscarPerfilSocial(id)] as const),
  );

  return Object.fromEntries(
    perfis.map(([id, perfil]) => [id, converterItensEquipadosParaSlots(perfil.cosmeticos)]),
  );
};
