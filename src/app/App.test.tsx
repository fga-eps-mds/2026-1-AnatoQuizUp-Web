import type { ReactNode } from 'react';

jest.mock('./providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
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

import { render, screen } from '@testing-library/react';
import { App } from './App';

const renderAppAt = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('App', () => {
  it('renders the login route', () => {
    renderAppAt('/login');

    expect(screen.getByText('Login route')).toBeInTheDocument();
  });

  it('renders the register route', () => {
    renderAppAt('/cadastro');

    expect(screen.getByText('Register route')).toBeInTheDocument();
  });

  it('redirects unknown routes to home inside the authenticated layout', () => {
    renderAppAt('/unknown');

    expect(screen.getByText('Authenticated layout')).toBeInTheDocument();
    expect(screen.getByText('Home route')).toBeInTheDocument();
  });
});
