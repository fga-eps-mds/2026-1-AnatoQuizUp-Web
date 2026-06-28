// Store global (Zustand) que controla a fila de modais de "conquista desbloqueada".
// Quando o aluno desbloqueia conquistas, elas entram numa fila e sao exibidas uma
// de cada vez: `conquistaAtual` e a que esta na tela; as demais aguardam na fila.
import { create } from 'zustand';

import type { ConquistaDesbloqueada } from '../types';

// Estado e acoes: a fila, a conquista atual e os comandos para enfileirar/avancar.
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
  // Enfileira novos desbloqueios; se nao ha modal aberto, ja exibe o primeiro.
  adicionarDesbloqueios: (conquistas) =>
    set((state) => {
      if (conquistas.length === 0) return state;

      // Nenhuma conquista em exibicao: a primeira vira a atual, o resto vai p/ fila.
      if (!state.conquistaAtual) {
        const [conquistaAtual, ...filaDesbloqueios] = conquistas;
        return {
          conquistaAtual: conquistaAtual ?? null,
          filaDesbloqueios,
        };
      }

      // Ja ha um modal aberto: apenas acrescenta ao fim da fila.
      return {
        filaDesbloqueios: [...state.filaDesbloqueios, ...conquistas],
      };
    }),
  // Fecha a conquista atual e promove a proxima da fila (se houver).
  avancarFila: () =>
    set((state) => {
      const [conquistaAtual, ...filaDesbloqueios] = state.filaDesbloqueios;
      return {
        conquistaAtual: conquistaAtual ?? null,
        filaDesbloqueios,
      };
    }),
  // Esvazia a fila e fecha qualquer modal aberto.
  limparFila: () => set({ conquistaAtual: null, filaDesbloqueios: [] }),
}));
