// Store global (Zustand) do saldo de moedas ATP do aluno. Mantida em um unico
// lugar para que header, loja e personalizacao compartilhem o mesmo saldo e ele
// reflita compras em tempo real sem novos fetches.
import { create } from 'zustand';

// Estado e acoes da store: saldo, flags de carregamento/erro e os setters.
type StudentCoinsState = {
  saldoMoedas: number;
  isLoading: boolean;
  error: string | null;
  setSaldoMoedas: (saldoMoedas: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

// Hook da store com valores iniciais zerados e acoes de atualizacao/reset.
export const useStudentCoinsStore = create<StudentCoinsState>((set) => ({
  saldoMoedas: 0,
  isLoading: false,
  error: null,
  setSaldoMoedas: (saldoMoedas) => set({ saldoMoedas }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ saldoMoedas: 0, isLoading: false, error: null }),
}));
