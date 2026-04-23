import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthProvider';
import type { User } from '../../entities/user/model/types';

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
      <span>{auth.user?.name ?? 'no-user'}</span>
      <button type="button" onClick={() => auth.login('access-token', 'refresh-token', user)}>
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
    jest.restoreAllMocks();
  });

  it('stores tokens and exposes the authenticated user on login', async () => {
    const testUser = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('anonymous')).toBeInTheDocument();

    await testUser.click(screen.getByRole('button', { name: 'login' }));

    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('Ana Estudante')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBe('access-token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
  });

  it('clears tokens and user state on logout', async () => {
    const testUser = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await testUser.click(screen.getByRole('button', { name: 'login' }));
    await testUser.click(screen.getByRole('button', { name: 'logout' }));

    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(screen.getByText('no-user')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('rejects useAuth outside of AuthProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<AuthConsumer />)).toThrow('useAuth deve ser usado dentro de um AuthProvider');
  });
});
