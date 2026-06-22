import type { InventarioItem, ItemInventario, TipoItemLoja } from '../loja';

export type SlotsCosmeticos = Partial<Record<TipoItemLoja, ItemInventario>>;

export type EquipadosPorUsuario = Record<string, SlotsCosmeticos>;

export type RespostaEquipados = {
  dados: ItemInventario[];
};

export const converterEquipadosParaSlots = (registros: InventarioItem[]): SlotsCosmeticos =>
  registros.reduce<SlotsCosmeticos>((slots, registro) => {
    if (registro.equipado) {
      slots[registro.item.tipo] = registro.item;
    }

    return slots;
  }, {});

export const converterItensEquipadosParaSlots = (itens: ItemInventario[]): SlotsCosmeticos =>
  itens.reduce<SlotsCosmeticos>((slots, item) => {
    slots[item.tipo] = item;
    return slots;
  }, {});
