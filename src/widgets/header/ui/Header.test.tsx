jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { AuthState, Role, User } from '../../../entities/user/model/types';
import { Header } from './Header';

const useAuthMock = useAuth as jest.Mock;

const makeUser = (role: Role): User => ({
  id: `${role.toLowerCase()}-1`,
  name: `${role} User`,
  email: `${role.toLowerCase()}@unb.br`,
  role,
  status: 'ACTIVE',
  authProvider: 'LOCAL',
});

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderHeader = (auth: Partial<AuthState>, route = '/home') => {
  useAuthMock.mockReturnValue({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    ...auth,
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Header />
      <LocationProbe />
    </MemoryRouter>,
  );
};

describe('Header', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render navigation when there is no authenticated user', () => {
    renderHeader({ user: null });

    expect(screen.queryByAltText('AnatoQuizUp')).not.toBeInTheDocument();
  });

  it('renders student navigation and logs out to the login route', async () => {
    const testUser = userEvent.setup();
    const logout = jest.fn();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true, logout });

    await testUser.click(screen.getByRole('button', { name: /Sair da conta/i }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('toggles professor student-view navigation state', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('PROFESSOR'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Ver como aluno/i }));

    expect(screen.getByRole('button', { name: /Sair da visão de aluno/i })).toHaveAttribute('aria-current', 'page');
  });

  it('renders the active admin users item', () => {
    renderHeader({ user: makeUser('ADMIN'), isAuthenticated: true }, '/admin/usuarios');

    expect(screen.getByRole('button', { name: /Gerenciar Usuários/i })).toHaveAttribute('aria-current', 'page');
  });

  it('opens and closes the mobile drawer', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Abrir menu/i }));
    expect(screen.getByRole('button', { name: /Fechar menu/i })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Fechar menu/i })).not.toBeInTheDocument();
    });
  });
});
