import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../providers/AuthProvider';
import React from 'react';

jest.mock('../providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

describe('App/Router/ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Página de Login</div>} />
          <Route path="/home" element={<div data-testid="home-page">Página Home</div>} />
          <Route path="/rota-protegida" element={ui} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve redirecionar para /login se o usuário NÃO estiver autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, user: null });

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="conteudo-secreto">Conteúdo Secreto</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('conteudo-secreto')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo se o usuário estiver autenticado e não tiver restrição de Role', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'STUDENT' },
    });

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="conteudo-secreto">Conteúdo Secreto</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('conteudo-secreto')).toBeInTheDocument();
  });

  it('deve redirecionar para /home se o usuário estiver logado, mas não tiver a Role necessária', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'STUDENT' },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['PROFESSOR']}>
        <div data-testid="painel-professor">Painel do Professor</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId('painel-professor')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo se o usuário logado tiver a Role necessária', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'PROFESSOR' },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={['PROFESSOR', 'ADMIN']}>
        <div data-testid="painel-professor">Painel do Professor</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('painel-professor')).toBeInTheDocument();
  });
});