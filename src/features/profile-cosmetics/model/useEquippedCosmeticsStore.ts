import { create } from 'zustand';

import type { ItemInventario, TipoItemLoja } from '../../loja';
import type { SlotsCosmeticos } from '../types';

export type EquippedCosmeticsState = {
  cosmeticos: SlotsCosmeticos;
  isLoading: boolean;
  error: string | null;
  setCosmeticos: (cosmeticos: SlotsCosmeticos) => void;
  setCosmetico: (tipo: TipoItemLoja, item?: ItemInventario) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const estadoInicial = {
  cosmeticos: {},
  isLoading: false,
  error: null,
} satisfies Pick<EquippedCosmeticsState, 'cosmeticos' | 'isLoading' | 'error'>;

export const useEquippedCosmeticsStore = create<EquippedCosmeticsState>((set) => ({
  ...estadoInicial,
  setCosmeticos: (cosmeticos) => set({ cosmeticos }),
  setCosmetico: (tipo, item) =>
    set((state) => {
      const cosmeticos = { ...state.cosmeticos };

      if (item) {
        cosmeticos[tipo] = item;
      } else {
        delete cosmeticos[tipo];
      }

      return { cosmeticos };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...estadoInicial, cosmeticos: {} }),
}));
