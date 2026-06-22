import { create } from 'zustand';

import type { ConquistaDesbloqueada } from '../types';

type AchievementState = {
  filaDesbloqueios: ConquistaDesbloqueada[];
  conquistaAtual: ConquistaDesbloqueada | null;
  adicionarDesbloqueios: (conquistas: ConquistaDesbloqueada[]) => void;
  avancarFila: () => void;
  limparFila: () => void;
};

export const useAchievementStore = create<AchievementState>((set) => ({
  filaDesbloqueios: [],
  conquistaAtual: null,
  adicionarDesbloqueios: (conquistas) =>
    set((state) => {
      if (conquistas.length === 0) return state;

      if (!state.conquistaAtual) {
        const [conquistaAtual, ...filaDesbloqueios] = conquistas;
        return {
          conquistaAtual: conquistaAtual ?? null,
          filaDesbloqueios,
        };
      }

      return {
        filaDesbloqueios: [...state.filaDesbloqueios, ...conquistas],
      };
    }),
  avancarFila: () =>
    set((state) => {
      const [conquistaAtual, ...filaDesbloqueios] = state.filaDesbloqueios;
      return {
        conquistaAtual: conquistaAtual ?? null,
        filaDesbloqueios,
      };
    }),
  limparFila: () => set({ conquistaAtual: null, filaDesbloqueios: [] }),
}));
