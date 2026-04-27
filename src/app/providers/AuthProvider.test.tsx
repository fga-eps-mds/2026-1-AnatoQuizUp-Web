jest.mock('../../features/auth-by-credencials/model/authService.ts', () => ({
  getAuthenticatedUser: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthProvider';
import type { User } from '../../entities/user/model/types';
import { getAuthenticatedUser } from '../../features/auth-by-credencials/model/authService.ts';

const getAuthenticatedUserMock = getAuthenticatedUser as jest.Mock;

const user: User = {
  id: 'user-1',
  name: 'Ana Estudante',
  email: 'ana@unb.br',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasília',
  period: 3,
};

const AuthConsumer = () => {
  const auth = useAuth();

  return (
    <div>
      <span>{auth.isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <span>{auth.isLoading ? 'loading' : 'loaded'}</span>
      <span>{auth.user?.name ?? 'no-user'}</span>
      <button type="button" onClick={() => void auth.login('access-token', 'refresh-token')}>
        login
      </button>
      <button type="button" onClick={auth.logout}>
        logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  afterEach(() => {
    localStorage.clear();
    getAuthenticatedUserMock.mockReset();
    jest.restoreAllMocks();
  });

  it('stores tokens and exposes the authenticated user on login', async () => {
    const testUser = userEvent.setup();
    getAuthenticatedUserMock.mockResolvedValueOnce(user);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('anonymous')).toBeInTheDocument();

    await testUser.click(screen.getByRole('button', { name: 'login' }));

    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('Ana Estudante')).toBeInTheDocument();
    expect(getAuthenticatedUserMock).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('access_token')).toBe('access-token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
  });

  it('clears tokens and user state on logout', async () => {
    const testUser = userEvent.setup();
    getAuthenticatedUserMock.mockResolvedValueOnce(user);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await testUser.click(screen.getByRole('button', { name: 'login' }));
    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    await testUser.click(screen.getByRole('button', { name: 'logout' }));

    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(screen.getByText('no-user')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('restores the authenticated user when there is a stored token', async () => {
    localStorage.setItem('access_token', 'stored-access-token');
    getAuthenticatedUserMock.mockResolvedValueOnce(user);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('loaded')).toBeInTheDocument();
    expect(screen.getByText('Ana Estudante')).toBeInTheDocument();
  });

  it('clears stored tokens when session restoration fails', async () => {
    localStorage.setItem('access_token', 'invalid-access-token');
    localStorage.setItem('refresh_token', 'invalid-refresh-token');
    getAuthenticatedUserMock.mockRejectedValueOnce(new Error('Sessao expirada'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByText('loaded')).toBeInTheDocument();
    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('rejects useAuth outside of AuthProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<AuthConsumer />)).toThrow('useAuth deve ser usado dentro de um AuthProvider');
  });
});
