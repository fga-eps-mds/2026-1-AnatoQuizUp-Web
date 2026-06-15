import { render, screen, fireEvent } from '@testing-library/react';
import { HomeAdminPage } from '../../../../../src/pages/admin/ui/HomeAdminPage';
import { useAuth } from '../../../../../src/app/providers/AuthProvider';

const mockNavigate = jest.fn();

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HomeAdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a tela inicial do administrador com o primeiro nome do usuário', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        name: 'Genilson Junior',
      },
    });

    render(<HomeAdminPage />);

    expect(screen.getByText('Bem-vindo(a), Genilson!')).toBeInTheDocument();
    expect(screen.getByText('Aprovar Professores')).toBeInTheDocument();
    expect(screen.getByText('Monitorar Contas')).toBeInTheDocument();
    expect(screen.getByText('Este é o seu painel de controle do AnatoQuizUp. Aqui você possui acesso total para gerenciar a plataforma.')).toBeInTheDocument();
  });

  it('deve navegar para o dashboard administrativo ao clicar no botão principal', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        name: 'Genilson Junior',
      },
    });

    render(<HomeAdminPage />);

    const botaoDashboard = screen.getByRole('button', {
      name: /Acessar Gerenciamento de Usuários/i,
    });

    fireEvent.click(botaoDashboard);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('deve exibir Administrador quando o usuário não tiver nome', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<HomeAdminPage />);

    expect(screen.getByText('Bem-vindo(a), Administrador!')).toBeInTheDocument();
  });
});