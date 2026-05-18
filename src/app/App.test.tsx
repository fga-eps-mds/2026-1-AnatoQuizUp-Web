import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

jest.mock('../shared/config/env', () => ({
  env: {
    VITE_API_URL: 'http://localhost:3333',
  },
}));

jest.mock('./providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAuth: jest.fn().mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { role: 'PROFESSOR' }, 
  }),
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

jest.mock('../pages/professor-register', () => ({
  ProfessorRegisterPage: () => <main>Professor register route</main>,
}));

jest.mock('../pages/forgot-password', () => ({
  ForgotPasswordPage: () => <main>Forgot password route</main>,
}));

jest.mock('../pages/reset-password', () => ({
  ResetPasswordPage: () => <main>Reset password route</main>,
}));

jest.mock('../pages/homeAluno/index', () => ({
  HomeAlunoPage: () => <main>Student home route</main>,
}));

jest.mock('../pages/homeProfessor', () => ({
  HomeProfessorPage: () => <main>Professor home route</main>,
}));

jest.mock('../pages/questao', () => ({
  QuestionsPage: () => <main>Questions route</main>,
}));

jest.mock('../pages/professor/criar-questao', () => ({
  CreateQuestionPage: () => <main>Create question route</main>,
}));

jest.mock('../pages/turma/ui/TurmaPage', () => ({
  TurmasPage: () => <main>Turmas route</main>,
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

  it('renders the professor register route', () => {
    renderAppAt('/professor/cadastro');
    expect(screen.getByText('Professor register route')).toBeInTheDocument();
  });

  it('renders the forgot password route', () => {
    renderAppAt('/esqueci-senha');
    expect(screen.getByText('Forgot password route')).toBeInTheDocument();
  });

  it('renders the reset password route', () => {
    renderAppAt('/redefinir-senha?token=token');
    expect(screen.getByText('Reset password route')).toBeInTheDocument();
  });

  it('renders the turmas route', () => {
    renderAppAt('/turmas');
    expect(screen.getByText('Turmas route')).toBeInTheDocument();
  });

  it('redirects unknown routes to the public home route', () => {
    renderAppAt('/unknown');
    expect(screen.getByText('Home route')).toBeInTheDocument();
  });
});