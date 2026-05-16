jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { User } from '../../../entities/user/model/types';
import { HomeAlunoPage } from './HomeAlunoPage';

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

const renderHomeAlunoPage = () =>
  render(
    <MemoryRouter initialEntries={['/aluno/home']}>
      <HomeAlunoPage />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('HomeAlunoPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the authenticated profile card with student data', () => {
    useAuthMock.mockReturnValue({ user, isAuthenticated: true });

    renderHomeAlunoPage();

    expect(screen.getByText('Ana Estudante')).toBeInTheDocument();
    expect(screen.getByText(/Medicina \| UnB/i)).toBeInTheDocument();
    
    expect(screen.getByText(/Como a plataforma funciona\?/i)).toBeInTheDocument();
  });

  it('navigates to quizzes when clicking the action button', async () => {
    const testUser = userEvent.setup();
    useAuthMock.mockReturnValue({ user, isAuthenticated: true });

    renderHomeAlunoPage();

    await testUser.click(screen.getByRole('button', { name: /Acessar Quizzes/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/questoes');
  });


  it('renders fallback metadata when user has no course', () => {
    const userWithoutCourse = { ...user, course: undefined };
    useAuthMock.mockReturnValue({ user: userWithoutCourse, isAuthenticated: true });

    renderHomeAlunoPage();

    expect(screen.getByText('UnB')).toBeInTheDocument();
    expect(screen.queryByText(/\|/)).not.toBeInTheDocument();
  });

  it('navigates to login when unauthenticated and onLogin is called', async () => {
    const testUser = userEvent.setup();
    useAuthMock.mockReturnValue({ user: null, isAuthenticated: false });

    renderHomeAlunoPage();

    const loginButton = screen.getByRole('button', { name: /login|entrar/i });
    await testUser.click(loginButton);

    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});