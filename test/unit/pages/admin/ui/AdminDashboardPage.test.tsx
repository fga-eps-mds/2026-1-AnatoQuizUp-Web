import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminDashboardPage } from '../../../../../src/pages/admin/ui/AdminDashboardPage';
import { useAuth } from '../../../../../src/app/providers/AuthProvider';
import { listarUsuariosAdmin, alterarStatusUsuarioAdmin } from '../../../../../src/features/admin/adminService';
import type { AdminUsuario } from '../../../../../src/features/admin/types';

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../../src/features/admin/adminService', () => ({
  listarUsuariosAdmin: jest.fn(),
  alterarStatusUsuarioAdmin: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockListarUsuariosAdmin = listarUsuariosAdmin as jest.Mock;
const mockAlterarStatusUsuarioAdmin = alterarStatusUsuarioAdmin as jest.Mock;

describe('AdminDashboardPage', () => {
  const usuarioPendente: AdminUsuario = {
    id: 'usuario-1',
    nome: 'Professor Pendente',
    email: 'professor@unb.br',
    papel: 'PROFESSOR',
    status: 'PENDING',
    criadoEm: '2026-05-25T00:00:00.000Z',
  };

  const usuarioAtivo: AdminUsuario = {
    id: 'usuario-2',
    nome: 'Aluno Ativo',
    email: 'aluno@unb.br',
    papel: 'ALUNO',
    status: 'ACTIVE',
    criadoEm: '2026-05-25T00:00:00.000Z',
  };

  const usuarioInativo: AdminUsuario = {
    id: 'usuario-3',
    nome: 'Admin Atual',
    email: 'admin@unb.br',
    papel: 'ADMINISTRADOR',
    status: 'INACTIVE',
    criadoEm: '2026-05-25T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: {
        email: 'admin@unb.br',
      },
    });
  });

  it('deve carregar e exibir usuários administrativos', async () => {
    mockListarUsuariosAdmin.mockResolvedValue({
      dados: [usuarioPendente, usuarioAtivo, usuarioInativo],
      total: 3,
      page: 1,
      limit: 100,
    });

    render(<AdminDashboardPage />);

    expect(screen.getByText('Sincronizando contas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Professor Pendente')).toBeInTheDocument();
      expect(screen.getByText('Aluno Ativo')).toBeInTheDocument();
      expect(screen.getByText('Admin Atual')).toBeInTheDocument();
    });

    expect(screen.getByText('Painel de Administração')).toBeInTheDocument();
    expect(screen.getByText('Aprovações Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Professores/Alunos Ativos')).toBeInTheDocument();
    expect(screen.getByText('Total de Contas')).toBeInTheDocument();
    expect(screen.getByText('Sua Conta')).toBeInTheDocument();

    expect(mockListarUsuariosAdmin).toHaveBeenCalledWith(1, 100);
  });

  it('deve filtrar usuários por aba e por texto de busca', async () => {
    mockListarUsuariosAdmin.mockResolvedValue({
      dados: [usuarioPendente, usuarioAtivo, usuarioInativo],
      total: 3,
      page: 1,
      limit: 100,
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Professor Pendente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Pendentes/i }));

    expect(screen.getByText('Professor Pendente')).toBeInTheDocument();
    expect(screen.queryByText('Aluno Ativo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Ativos$/i }));

    expect(screen.getByText('Aluno Ativo')).toBeInTheDocument();
    expect(screen.queryByText('Professor Pendente')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Inativos$/i }));

    expect(screen.getByText('Admin Atual')).toBeInTheDocument();
    expect(screen.queryByText('Aluno Ativo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Todos$/i }));

    const inputBusca = screen.getByPlaceholderText('Buscar por nome ou e-mail...');
    fireEvent.change(inputBusca, { target: { value: 'professor' } });

    expect(screen.getByText('Professor Pendente')).toBeInTheDocument();
    expect(screen.queryByText('Aluno Ativo')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Atual')).not.toBeInTheDocument();
  });

  it('deve ativar usuário com sucesso', async () => {
    mockListarUsuariosAdmin.mockResolvedValue({
      dados: [usuarioPendente],
      total: 1,
      page: 1,
      limit: 100,
    });

    mockAlterarStatusUsuarioAdmin.mockResolvedValue({
      mensagem: 'Status atualizado',
      dados: {
        ...usuarioPendente,
        status: 'ACTIVE',
      },
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Professor Pendente')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ativar/i }));

    await waitFor(() => {
      expect(mockAlterarStatusUsuarioAdmin).toHaveBeenCalledWith('usuario-1', 'ACTIVE');
      expect(screen.getByText('Status do usuário atualizado com sucesso.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }));

    expect(screen.queryByText('Status do usuário atualizado com sucesso.')).not.toBeInTheDocument();
  });

  it('deve exibir erro ao falhar na alteração de status', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockListarUsuariosAdmin.mockResolvedValue({
      dados: [usuarioAtivo],
      total: 1,
      page: 1,
      limit: 100,
    });

    mockAlterarStatusUsuarioAdmin.mockRejectedValue(new Error('Erro ao alterar'));

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Aluno Ativo')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Bloquear/i }));

    await waitFor(() => {
      expect(mockAlterarStatusUsuarioAdmin).toHaveBeenCalledWith('usuario-2', 'INACTIVE');
      expect(screen.getByText('Não foi possível alterar o status do usuário.')).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('deve exibir erro ao falhar no carregamento de usuários', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockListarUsuariosAdmin.mockRejectedValue(new Error('Erro ao carregar'));

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Falha ao sincronizar lista de usuários com o servidor.')).toBeInTheDocument();
      expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('deve exibir tela vazia quando a resposta não possuir usuários', async () => {
    mockListarUsuariosAdmin.mockResolvedValue({
      dados: [],
      total: 0,
      page: 1,
      limit: 100,
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument();
    });
  });

  it('deve aceitar resposta alternativa com resultados e normalizar status e papéis', async () => {
    const usuarioComRole = {
      id: 'usuario-4',
      nome: 'Usuario Role',
      email: 'role@unb.br',
      role: 'PROFESSOR',
      status: 'ATIVO',
      criadoEm: '2026-05-25T00:00:00.000Z',
    } as unknown as AdminUsuario;

    const usuarioComPerfil = {
      id: 'usuario-5',
      nome: 'Usuario Perfil',
      email: 'perfil@unb.br',
      perfil: 'ALUNO',
      status: 'PENDENTE',
      criadoEm: '2026-05-25T00:00:00.000Z',
    } as unknown as AdminUsuario;

    const usuarioIndefinido = {
      id: 'usuario-6',
      nome: 'Usuario Indefinido',
      email: 'indefinido@unb.br',
      status: 'BLOQUEADO',
      criadoEm: '2026-05-25T00:00:00.000Z',
    } as unknown as AdminUsuario;

    mockListarUsuariosAdmin.mockResolvedValue({
      resultados: [usuarioComRole, usuarioComPerfil, usuarioIndefinido],
    });

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Usuario Role')).toBeInTheDocument();
      expect(screen.getByText('Usuario Perfil')).toBeInTheDocument();
      expect(screen.getByText('Usuario Indefinido')).toBeInTheDocument();
    });

    expect(screen.getByText('PROFESSOR')).toBeInTheDocument();
    expect(screen.getByText('ALUNO')).toBeInTheDocument();
    expect(screen.getByText('INDEFINIDO')).toBeInTheDocument();

    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });
});