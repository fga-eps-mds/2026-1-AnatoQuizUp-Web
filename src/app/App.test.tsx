import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useAuth } from './providers/AuthProvider';

jest.mock('./providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth:jest.fn(),
}));

jest.mock('./layouts/AuthenticatedLayout', () => {
  const { Outlet } = jest.requireActual('react-router-dom');
  return {
    AuthenticatedLayout: () => (
      <div>
        <span>Authenticated layout</span>
        <Outlet />
      </div>
    ),
  };
});

jest.mock('../pages/login/index', () => ({
  LoginPage: () => <main>Login route</main>,
}));

jest.mock('../pages/home/index', () => ({
  HomePage: () => <main>Home route</main>,
}));

jest.mock('../pages/register/index', () => ({
  RegisterPage: () => <main>Register route</main>,
}));

jest.mock('../pages/forgot-password', () => ({
  ForgotPasswordPage: () => <main>Forgot password route</main>,
}));

jest.mock('../pages/reset-password', () => ({
  ResetPasswordPage: () => <main>Reset password route</main>,
}));

const renderAppAt = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login route', () => {
    renderAppAt('/login');

    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('renders the register route', () => {
    renderAppAt('/cadastro');

    expect(screen.getByText('Register route')).toBeInTheDocument();
  });

  it('renders the forgot password route', () => {
    renderAppAt('/esqueci-senha');

    expect(screen.getByText('Forgot password route')).toBeInTheDocument();
  });

  it('renders the reset password route', () => {
    renderAppAt('/redefinir-senha?token=token');

    expect(screen.getByText('Reset password route')).toBeInTheDocument();
  });

  it('redirects unknown routes to home inside the authenticated layout', () => {
    (useAuth as jest.Mock).mockReturnValue({ 
      isAuthenticated: true, 
      user: { role: 'STUDENT' } 
    });
    renderAppAt('/unknown');

    expect(screen.getByText('Authenticated layout')).toBeInTheDocument();
    expect(screen.getByText('Home route')).toBeInTheDocument();
  });
});
