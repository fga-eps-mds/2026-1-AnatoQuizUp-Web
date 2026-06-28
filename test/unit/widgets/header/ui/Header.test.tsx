jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../../src/features/profile-cosmetics', () => ({
  useEquippedCosmeticsStore: jest.fn((selector: (s: { cosmeticos: Record<string, never> }) => unknown) =>
    selector({ cosmeticos: {} }),
  ),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../../src/app/providers/AuthProvider';
import type { AuthState, Role, User } from '../../../../../src/entities/user/model/types';
import { useStudentCoinsStore } from '../../../../../src/features/student-coins/model/useStudentCoinsStore';
import { Header } from '../../../../../src/widgets/header/ui/Header';

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
    logout: jest.fn().mockResolvedValue(undefined),
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
  beforeEach(() => {
    useStudentCoinsStore.getState().reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render navigation when there is no authenticated user', () => {
    renderHeader({ user: null });

    expect(screen.queryByAltText('AnatoQuizUp')).not.toBeInTheDocument();
  });

  it('renders student navigation and logs out to the login route', async () => {
    const testUser = userEvent.setup();
    const logout = jest.fn().mockResolvedValue(undefined);

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true, logout });

    await testUser.click(screen.getByRole('button', { name: /Sair da conta/i }));

    expect(logout).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/login');
    });
  });

  it('renders ATP balance for students', () => {
    useStudentCoinsStore.getState().setSaldoMoedas(125);

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true });

    expect(screen.getByText('ATP')).toBeInTheDocument();
    expect(screen.getAllByText('125')).toHaveLength(2);
  });

  it('does not render ATP balance for professors', () => {
    useStudentCoinsStore.getState().setSaldoMoedas(125);

    renderHeader({ user: makeUser('PROFESSOR'), isAuthenticated: true });

    expect(screen.queryByText('ATP')).not.toBeInTheDocument();
    expect(screen.queryByText('125')).not.toBeInTheDocument();
  });

  // it('toggles professor student-view navigation state', async () => {
  //   const testUser = userEvent.setup();

  //   renderHeader({ user: makeUser('PROFESSOR'), isAuthenticated: true });

  //   await testUser.click(screen.getByRole('button', { name: /Ver como aluno/i }));

  //   expect(screen.getByRole('button', { name: /Sair da visão de aluno/i })).toHaveAttribute(
  //     'aria-current',
  //     'page',
  //   );
  // });

  it('navigates professors to the question bank', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('PROFESSOR'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Questões/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/professor/questoes');
  });

  it('renders the active admin users item', () => {
    renderHeader({ user: makeUser('ADMIN'), isAuthenticated: true }, '/admin/usuarios');

    expect(screen.getByRole('button', { name: /Gerenciar Usuários/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
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

  it('navigates professors to the turmas page', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('PROFESSOR'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Turmas/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/turmas');
  });

  it('does not render turmas item for admin', () => {
    renderHeader({ user: makeUser('ADMIN'), isAuthenticated: true }, '/turmas');

    expect(screen.queryByRole('button', { name: /Turmas/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Início/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gerenciar Usuários/i })).toBeInTheDocument();
  });

  it('navigates students to dashboard page', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true }, '/aluno/home');

    await testUser.click(screen.getByRole('button', { name: /Dashboard|Evolução/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/dashboard');
  });

  it('renders the active dashboard item for student', () => {
    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true }, '/aluno/dashboard');

    expect(screen.getByRole('button', { name: /Dashboard|Evolução/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates students to minhas turmas page', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Minhas Turmas/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/turmas');
  });

  it('renders the active minhas turmas item for student on detail route', () => {
    renderHeader(
      { user: makeUser('STUDENT'), isAuthenticated: true },
      '/aluno/turmas/turma-1',
    );

    expect(screen.getByRole('button', { name: /Minhas Turmas/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates students to amigos page', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Amigos/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/amigos');
  });

  it('renders the active amigos item for student', () => {
    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true }, '/aluno/amigos');

    expect(screen.getByRole('button', { name: /Amigos/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates students to profile page from the user card', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true }, '/aluno/home');

    await testUser.click(screen.getByRole('button', { name: /Meu Perfil/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/perfil');
  });

  it('marks the student profile card as active on profile routes', () => {
    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true }, '/aluno/perfil');

    expect(screen.getByRole('button', { name: /Meu Perfil/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('keeps professor user card static', () => {
    renderHeader({ user: makeUser('PROFESSOR'), isAuthenticated: true });

    expect(screen.queryByRole('button', { name: /Meu Perfil/i })).not.toBeInTheDocument();
    expect(screen.getByText('PROFESSOR')).toBeInTheDocument();
  });

  it('closes the mobile drawer when clicking the close button (X)', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Abrir menu/i }));
    expect(screen.getByRole('button', { name: /Fechar menu/i })).toBeInTheDocument();

    await testUser.click(screen.getByRole('button', { name: /Fechar menu/i }));

    expect(screen.queryByRole('button', { name: /Fechar menu/i })).not.toBeInTheDocument();
  });

  it('closes the mobile drawer automatically when a navigation item is selected', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true });

    await testUser.click(screen.getByRole('button', { name: /Abrir menu/i }));
    expect(screen.getByRole('button', { name: /Fechar menu/i })).toBeInTheDocument();

    const inicioButtons = screen.getAllByRole('button', { name: /Início/i });
    await testUser.click(inicioButtons[1]);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Fechar menu/i })).not.toBeInTheDocument();
    });
  });

  it('navigates to home when clicking the mobile logo', async () => {
    const testUser = userEvent.setup();

    renderHeader({ user: makeUser('STUDENT'), isAuthenticated: true }, '/outra-rota');

    const logos = screen.getAllByAltText('AnatoQuizUp');
    const mobileLogoButton = logos[0].closest('button');

    if (mobileLogoButton) {
      await testUser.click(mobileLogoButton);
    }

    expect(screen.getByTestId('location')).toHaveTextContent('/home');
  });
});
