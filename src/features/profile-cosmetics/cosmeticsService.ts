import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  EquipadosPorUsuario,
  RespostaEquipados,
  RespostaEquipadosLote,
  SlotsCosmeticos,
} from './types';
import { converterEquipadosParaSlots } from './types';

const EQUIPADOS_ENDPOINT = '/loja/equipados';

const normalizarIds = (ids: string[]): string[] => [
  ...new Set(ids.map((id) => id.trim()).filter(Boolean)),
];

export const buscarEquipados = async (): Promise<SlotsCosmeticos> => {
  try {
    const { data } = await httpClient.get<RespostaEquipados>(EQUIPADOS_ENDPOINT);

    return converterEquipadosParaSlots(data.dados);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const buscarEquipadosDe = async (
  ids: string[],
): Promise<EquipadosPorUsuario> => {
  const idsNormalizados = normalizarIds(ids);

  if (idsNormalizados.length === 0) {
    return {};
  }

  try {
    const { data } = await httpClient.get<RespostaEquipadosLote>(
      `${EQUIPADOS_ENDPOINT}/lote`,
      {
        params: {
          usuarioIds: idsNormalizados.join(','),
        },
      },
    );

    return Object.fromEntries(
      idsNormalizados.map((id) => [
        id,
        converterEquipadosParaSlots(data.dados[id] ?? []),
      ]),
    );
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
