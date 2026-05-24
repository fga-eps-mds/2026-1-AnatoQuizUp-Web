import { create } from 'zustand';

type StudentCoinsState = {
  saldoMoedas: number;
  isLoading: boolean;
  error: string | null;
  setSaldoMoedas: (saldoMoedas: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useStudentCoinsStore = create<StudentCoinsState>((set) => ({
  saldoMoedas: 0,
  isLoading: false,
  error: null,
  setSaldoMoedas: (saldoMoedas) => set({ saldoMoedas }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ saldoMoedas: 0, isLoading: false, error: null }),
}));
