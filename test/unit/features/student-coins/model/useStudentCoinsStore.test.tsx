import { act } from '@testing-library/react';
import { useStudentCoinsStore } from '../../../../../src/features/student-coins/model/useStudentCoinsStore';

describe('useStudentCoinsStore', () => {
  beforeEach(() => {
    useStudentCoinsStore.getState().reset();
  });

  it('updates saldoMoedas', () => {
    act(() => {
      useStudentCoinsStore.getState().setSaldoMoedas(150);
    });

    expect(useStudentCoinsStore.getState().saldoMoedas).toBe(150);
  });

  it('updates loading state', () => {
    act(() => {
      useStudentCoinsStore.getState().setLoading(true);
    });

    expect(useStudentCoinsStore.getState().isLoading).toBe(true);
  });

  it('updates error state', () => {
    act(() => {
      useStudentCoinsStore.getState().setError('erro');
    });

    expect(useStudentCoinsStore.getState().error).toBe('erro');
  });

  it('resets state', () => {
    act(() => {
      const state = useStudentCoinsStore.getState();

      state.setSaldoMoedas(100);
      state.setLoading(true);
      state.setError('falha');
    });

    act(() => {
      useStudentCoinsStore.getState().reset();
    });

    expect(useStudentCoinsStore.getState()).toMatchObject({
      saldoMoedas: 0,
      isLoading: false,
      error: null,
    });
  });
});