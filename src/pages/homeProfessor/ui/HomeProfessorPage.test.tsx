jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { User } from '../../../entities/user/model/types';
import { HomeProfessorPage } from './HomeProfessorPage';

const useAuthMock = useAuth as jest.Mock;

const professor: User = {
  id: 'professor-1',
  name: 'Joana Professora',
  email: 'joana.professora@unb.br',
  role: 'PROFESSOR',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  institution: 'Universidade de Brasília',
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderHomePage = () =>
  render(
    <MemoryRouter initialEntries={['/professor/home']}>
      <HomeProfessorPage />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('HomeProfessorPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the unauthenticated call to action and navigates to login', async () => {
    const testUser = userEvent.setup();
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: false });

    renderHomePage();

    await testUser.click(screen.getByRole('button', { name: /Entrar agora/i }));

    expect(screen.getByText(/Domine a/i)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('renders the authenticated professor profile card', () => {
    useAuthMock.mockReturnValue({ user: professor, isAuthenticated: true });

    renderHomePage();

    expect(screen.getByText('Perfil do Professor')).toBeInTheDocument();
    expect(screen.getByText('Joana Professora')).toBeInTheDocument();
    expect(screen.getByText('joana.professora@unb.br')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Acessar Quizzes/i })).not.toBeInTheDocument();
  });
});
