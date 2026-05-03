jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { User } from '../../../entities/user/model/types';
import { HomeProfessorPage as HomePage } from './HomeProfessorPage';

const useAuthMock = useAuth as jest.Mock;

const user: User = {
  id: 'user-1',
  name: 'Ana Estudante',
  email: 'ana@unb.br',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  course: 'Medicina',
  institution: 'Universidade de Brasília',
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderHomePage = () =>
  render(
    <MemoryRouter initialEntries={['/home']}>
      <HomePage />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('HomePage', () => {
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

  it('renders the authenticated profile card and navigates to quizzes', async () => {
    const testUser = userEvent.setup();
    useAuthMock.mockReturnValue({ user, isAuthenticated: true });

    renderHomePage();

    expect(screen.getByText('Ana Estudante')).toBeInTheDocument();
    expect(screen.getByText(/Medicina \| UnB/i)).toBeInTheDocument();

    await testUser.click(screen.getByRole('button', { name: /Acessar Quizzes/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/quizzes');
  });
});
