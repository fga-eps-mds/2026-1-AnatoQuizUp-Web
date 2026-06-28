// Store global (Zustand) dos cosmeticos equipados pelo aluno, indexados por slot
// (tipo de item). Compartilhada entre header, perfil e personalizacao para que o
// avatar/identidade reflita a mesma configuracao em toda a aplicacao.
import { create } from 'zustand';

import type { ItemInventario, TipoItemLoja } from '../../loja';
import type { SlotsCosmeticos } from '../types';

// Estado e acoes da store: mapa de cosmeticos por slot, flags e setters.
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

// Estado inicial: nenhum cosmetico equipado, sem carga nem erro.
const estadoInicial = {
  cosmeticos: {},
  isLoading: false,
  error: null,
} satisfies Pick<EquippedCosmeticsState, 'cosmeticos' | 'isLoading' | 'error'>;

export const useEquippedCosmeticsStore = create<EquippedCosmeticsState>((set) => ({
  ...estadoInicial,
  // Substitui o conjunto inteiro de cosmeticos equipados de uma vez.
  setCosmeticos: (cosmeticos) => set({ cosmeticos }),
  // Equipa (item presente) ou desequipa (item ausente) um unico slot.
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
