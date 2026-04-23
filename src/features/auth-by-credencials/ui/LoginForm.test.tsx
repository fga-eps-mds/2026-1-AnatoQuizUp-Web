jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../model/authService', () => ({
  loginWithCredencials: jest.fn(),
}));

jest.mock('../../../shared/config/env', () => ({
  API_BASE_URL: 'https://api.test',
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { User } from '../../../entities/user/model/types';
import { loginWithCredencials } from '../model/authService';
import { LoginForm } from './LoginForm';

const useAuthMock = useAuth as jest.Mock;
const loginWithCredencialsMock = loginWithCredencials as jest.Mock;

const user: User = {
  id: 'user-1',
  name: 'Ana Estudante',
  email: 'ana@unb.br',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderLoginForm = () => {
  const login = jest.fn();
  useAuthMock.mockReturnValue({ login });

  const view = render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginForm />
      <LocationProbe />
    </MemoryRouter>,
  );

  const passwordInput = view.container.querySelector('input[type="password"]') as HTMLInputElement;

  return { ...view, login, passwordInput };
};

describe('LoginForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a validation error when required fields are empty', async () => {
    const testUser = userEvent.setup();

    renderLoginForm();

    await testUser.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(screen.getByText(/Campos obrigatórios/i)).toBeInTheDocument();
    expect(loginWithCredencialsMock).not.toHaveBeenCalled();
  });

  it('authenticates with credentials and redirects to home', async () => {
    const testUser = userEvent.setup();
    loginWithCredencialsMock.mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user,
    });

    const { login, passwordInput } = renderLoginForm();

    await testUser.type(screen.getByPlaceholderText('Aluno@UnB'), 'ana@unb.br');
    await testUser.type(passwordInput, 'secret');
    await testUser.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(loginWithCredencialsMock).toHaveBeenCalledWith('ana@unb.br', 'secret');
    expect(login).toHaveBeenCalledWith('access-token', 'refresh-token', user);
    expect(screen.getByTestId('location')).toHaveTextContent('/home');
  });

  it('shows the service error when authentication fails', async () => {
    const testUser = userEvent.setup();
    loginWithCredencialsMock.mockRejectedValueOnce(new Error('Email ou senha inválidos'));

    const { passwordInput } = renderLoginForm();

    await testUser.type(screen.getByPlaceholderText('Aluno@UnB'), 'ana@unb.br');
    await testUser.type(passwordInput, 'wrong');
    await testUser.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(await screen.findByText('Email ou senha inválidos')).toBeInTheDocument();
  });

  it('navigates to the admin login route', async () => {
    const testUser = userEvent.setup();

    renderLoginForm();

    await testUser.click(screen.getByRole('button', { name: /Entrar como Administrador/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/admin/login');
  });

  it('starts the Microsoft login flow', async () => {
    const testUser = userEvent.setup();

    renderLoginForm();

    await testUser.click(screen.getByRole('button', { name: /Entrar como Professor/i }));

    expect(screen.getByRole('button', { name: /Entrar como Professor/i })).toBeInTheDocument();
  });
});
