jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { User } from '../../../entities/user/model/types';
import { HomePage } from './HomePage'; 

const useAuthMock = useAuth as jest.Mock;

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

    expect(screen.getByText(/Domine a/i)).toBeInTheDocument();

    await testUser.click(screen.getByRole('button', { name: /Entrar agora/i }));
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('redirects to /professor/home when the user is a PROFESSOR', () => {
    useAuthMock.mockReturnValue({ 
      user: { role: 'PROFESSOR' } as User, 
      isAuthenticated: true 
    });

    renderHomePage();

    expect(screen.getByTestId('location')).toHaveTextContent('/professor/home');
  });

  it('redirects to /aluno/home when the user is a STUDENT', () => {
    useAuthMock.mockReturnValue({ 
      user: { role: 'STUDENT' } as User, 
      isAuthenticated: true 
    });

    renderHomePage();

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/home');
  });
});