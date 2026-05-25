import { render, waitFor } from '@testing-library/react';

import { StudentCoinsBootstrap } from './StudentCoinsBootstrap';

import { useAuth } from '../../../app/providers/AuthProvider';
import { buscarSaldoMoedas } from '../../random-quiz/randomQuizService';
import { useStudentCoinsStore } from '../model/useStudentCoinsStore';

jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../random-quiz/randomQuizService', () => ({
  buscarSaldoMoedas: jest.fn(),
}));

jest.mock('../model/useStudentCoinsStore', () => ({
  useStudentCoinsStore: jest.fn(),
}));

describe('StudentCoinsBootstrap', () => {
  const mockSetSaldoMoedas = jest.fn();
  const mockSetLoading = jest.fn();
  const mockSetError = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useStudentCoinsStore as jest.Mock).mockImplementation((selector) =>
      selector({
        saldoMoedas: 0,
        isLoading: false,
        error: null,
        setSaldoMoedas: mockSetSaldoMoedas,
        setLoading: mockSetLoading,
        setError: mockSetError,
        reset: mockReset,
      }),
    );
  });

  it('calls reset for non-student users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'ADMIN' },
    });

    render(<StudentCoinsBootstrap />);

    expect(mockReset).toHaveBeenCalled();
  });

  it('loads and stores saldo for students', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'STUDENT' },
    });

    (buscarSaldoMoedas as jest.Mock).mockResolvedValue({
      saldoMoedas: 250,
    });

    render(<StudentCoinsBootstrap />);

    await waitFor(() => {
      expect(mockSetSaldoMoedas).toHaveBeenCalledWith(250);
    });

    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockSetLoading).toHaveBeenCalledWith(false);

    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('stores error when request fails', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'STUDENT' },
    });

    (buscarSaldoMoedas as jest.Mock).mockRejectedValue(
      new Error('Erro de API'),
    );

    render(<StudentCoinsBootstrap />);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Erro de API');
    });

    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});