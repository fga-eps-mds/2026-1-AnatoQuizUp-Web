import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import type { User } from '../../entities/user/userStore';

const MOCK_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João José', 
  email: 'aluno@unb.br',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasília',
  period: 3
};

describe('App/Providers/AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('deve lançar um erro se useAuth for chamado fora do AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow('useAuth deve ser usado dentro de um AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('deve inicializar com o usuário nulo (deslogado)', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('deve logar o usuário e salvar o token no localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login('meu-token-secreto', MOCK_USER);
    });

    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.isAuthenticated).toBe(true);
    
    expect(setItemSpy).toHaveBeenCalledWith('access_token', 'meu-token-secreto');
  });

  it('deve deslogar o usuário e remover o token do localStorage', () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login('meu-token-secreto', MOCK_USER);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    expect(removeItemSpy).toHaveBeenCalledWith('acesse_token');
  });
});