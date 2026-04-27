jest.mock('../../features/auth-by-credencials/model/authService.ts', () => ({
  getAuthenticatedUser: jest.fn(),
  logoutSession: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthProvider';
import type { User } from '../../entities/user/model/types';
import {
  getAuthenticatedUser,
  logoutSession,
} from '../../features/auth-by-credencials/model/authService.ts';

const getAuthenticatedUserMock = getAuthenticatedUser as jest.Mock;
const logoutSessionMock = logoutSession as jest.Mock;

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
      <button
        type="button"
        onClick={() => void auth.login('access-token', 'refresh-token').catch(() => undefined)}
      >
        login
      </button>
      <button type="button" onClick={() => void auth.logout()}>
        logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  afterEach(() => {
    localStorage.clear();
    getAuthenticatedUserMock.mockReset();
    logoutSessionMock.mockReset();
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

  it('starts loaded when there is no stored token', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('loaded')).toBeInTheDocument();
    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(getAuthenticatedUserMock).not.toHaveBeenCalled();
  });

  it('clears tokens and keeps login rejected when authenticated user load fails after login', async () => {
    const testUser = userEvent.setup();
    getAuthenticatedUserMock.mockRejectedValueOnce(new Error('Sessao invalida'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await testUser.click(screen.getByRole('button', { name: 'login' }));

    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(screen.getByText('no-user')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('clears tokens and user state on logout', async () => {
    const testUser = userEvent.setup();
    getAuthenticatedUserMock.mockResolvedValueOnce(user);
    logoutSessionMock.mockResolvedValueOnce(undefined);

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
    expect(logoutSessionMock).toHaveBeenCalledWith('refresh-token');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('clears local session even when backend logout fails', async () => {
    const testUser = userEvent.setup();
    getAuthenticatedUserMock.mockResolvedValueOnce(user);
    logoutSessionMock.mockRejectedValueOnce(new Error('erro no logout'));

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

  it('does not call backend logout when there is no refresh token', async () => {
    const testUser = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await testUser.click(screen.getByRole('button', { name: 'logout' }));

    expect(logoutSessionMock).not.toHaveBeenCalled();
    expect(screen.getByText('anonymous')).toBeInTheDocument();
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
