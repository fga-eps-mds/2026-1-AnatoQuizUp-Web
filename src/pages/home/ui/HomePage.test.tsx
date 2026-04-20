import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';

import { useAuth } from '../../../app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

describe('Pages/HomePage', () => {
  const mockNavigate = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('deve renderizar a tela de boas-vindas se o usuário NÃO estiver logado', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    });

    render(<HomePage />);

    expect(screen.getByText(/anatomia humana/i)).toBeInTheDocument();
    expect(screen.getByText(/com quizzes gamificados/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /entrar agora/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('deve renderizar o perfil do aluno se ele ESTIVER logado', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Pedro Cabeceira', course: 'Engenharia de Software' },
      logout: mockLogout,
    });

    render(<HomePage />);

    expect(screen.getByText('Pedro Cabeceira')).toBeInTheDocument();
    expect(screen.getByText(/engenharia de software/i)).toBeInTheDocument();
    
    expect(screen.getByText('P')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /acessar quizzes/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/quizzes');
  });

  it('deve deslogar o usuário ao clicar em Sair da Conta', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Pedro Cabeceira', course: 'Engenharia de Software' },
      logout: mockLogout,
    });

    render(<HomePage />);

    fireEvent.click(screen.getByRole('button', { name: /sair da conta/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});