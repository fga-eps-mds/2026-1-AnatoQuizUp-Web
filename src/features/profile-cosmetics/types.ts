import type { InventarioItem, ItemInventario, TipoItemLoja } from '../loja';

export type SlotsCosmeticos = Partial<Record<TipoItemLoja, ItemInventario>>;

export type EquipadosPorUsuario = Record<string, SlotsCosmeticos>;

export type RespostaEquipados = {
  dados: InventarioItem[];
};

export type RespostaEquipadosLote = {
  dados: Record<string, InventarioItem[]>;
};

export const converterEquipadosParaSlots = (
  registros: InventarioItem[],
): SlotsCosmeticos =>
  registros.reduce<SlotsCosmeticos>((slots, registro) => {
    if (registro.equipado) {
      slots[registro.item.tipo] = registro.item;
    }

    return slots;
  }, {});
