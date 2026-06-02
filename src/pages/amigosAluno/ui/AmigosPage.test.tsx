import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock AuthProvider to prevent import.meta errors
jest.mock('../../../app/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      visivel: true,
    },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import {
  aceitarConvite,
  alterarVisibilidade,
  buscarColegas,
  desfazerAmizade,
  enviarSolicitacao,
  listarAmigos,
  listarConvitesEnviados,
  listarConvitesRecebidos,
  recusarConvite,
} from '../../../features/friendship';
import { AmigosPage } from './AmigosPage';

jest.mock('../../../features/friendship', () => ({
  aceitarConvite: jest.fn(),
  alterarVisibilidade: jest.fn(),
  buscarColegas: jest.fn(),
  desfazerAmizade: jest.fn(),
  enviarSolicitacao: jest.fn(),
  listarAmigos: jest.fn(),
  listarConvitesEnviados: jest.fn(),
  listarConvitesRecebidos: jest.fn(),
  recusarConvite: jest.fn(),
}));

const aceitarConviteMock = aceitarConvite as jest.Mock;
const alterarVisibilidadeMock = alterarVisibilidade as jest.Mock;
const buscarColegasMock = buscarColegas as jest.Mock;
const desfazerAmizadeMock = desfazerAmizade as jest.Mock;
const enviarSolicitacaoMock = enviarSolicitacao as jest.Mock;
const listarAmigosMock = listarAmigos as jest.Mock;
const listarConvitesEnviadosMock = listarConvitesEnviados as jest.Mock;
const listarConvitesRecebidosMock = listarConvitesRecebidos as jest.Mock;
const recusarConviteMock = recusarConvite as jest.Mock;

const conviteRecebido = {
  id: 'amizade-1',
  criadoEm: '2026-05-31T12:00:00.000Z',
  atualizadoEm: '2026-05-31T12:00:00.000Z',
  excluidoEm: null,
  usuarioOrigemId: 'aluno-1',
  usuarioDestinoId: 'aluno-logado',
  statusAmizade: 'PENDENTE',
  amigo: {
    id: 'aluno-1',
    nome: 'Isabela Costa',
    nickname: 'isabela',
    curso: 'Medicina',
    semestre: '5',
  },
};

const amizadeAtiva = {
  ...conviteRecebido,
  id: 'amizade-ativa-1',
  statusAmizade: 'ATIVO',
  amigo: {
    id: 'aluno-2',
    nome: 'Rafael Oliveira',
    nickname: 'rafael',
    curso: 'Medicina',
    semestre: '4',
  },
};

describe('AmigosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    buscarColegasMock.mockResolvedValue({
      dados: [],
      metadados: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
    enviarSolicitacaoMock.mockResolvedValue({
      mensagem: 'Solicitação enviada com sucesso',
    });
    listarConvitesRecebidosMock.mockResolvedValue({
      dados: [],
      metadados: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
    listarConvitesEnviadosMock.mockResolvedValue({
      dados: [],
      metadados: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
    listarAmigosMock.mockResolvedValue({
      dados: [],
      metadados: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
    aceitarConviteMock.mockResolvedValue({
      mensagem: 'Convite aceito com sucesso',
    });
    recusarConviteMock.mockResolvedValue({
      mensagem: 'Convite recusado com sucesso',
    });
    desfazerAmizadeMock.mockResolvedValue({
      mensagem: 'Amizade desfeita com sucesso',
    });
    alterarVisibilidadeMock.mockResolvedValue({
      mensagem: 'Visibilidade alterada com sucesso',
    });
  });

  it('renderiza a pagina de rede do aluno', () => {
    render(<AmigosPage />);

    expect(screen.getByRole('heading', { name: /Minha Rede/i })).toBeInTheDocument();
    expect(screen.getByText(/Busque colegas, gerencie convites/i)).toBeInTheDocument();
    expect(screen.getByText('amigos')).toBeInTheDocument();
    expect(screen.getByText('convites pendentes')).toBeInTheDocument();
    expect(screen.getByText('Perfil visivel')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /Alternar privacidade da rede/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('button', { name: /Buscar colegas/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /Buscar colegas/i })).toBeInTheDocument();
    expect(listarAmigos).toHaveBeenCalledWith({ limit: 100 });
  });

  it('alterna entre as abas da tela', async () => {
    const user = userEvent.setup();

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Convites/i }));

    expect(screen.getByRole('button', { name: /Convites/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /Convites recebidos/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));

    expect(screen.getByRole('button', { name: /Meus amigos/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /Meus amigos/i })).toBeInTheDocument();
  });

  it('busca colegas por nome', async () => {
    const user = userEvent.setup();
    buscarColegasMock.mockResolvedValue({
      dados: [
        {
          id: 'aluno-1',
          nome: 'Lucas Mendes',
          nickname: 'lucas',
          curso: 'Medicina',
          semestre: '3',
        },
      ],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(buscarColegas).toHaveBeenCalledWith({ nome: 'Lucas', limit: 10 });
    expect(await screen.findByText('Lucas Mendes')).toBeInTheDocument();
    expect(screen.getByText('@lucas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar amigo/i })).toBeInTheDocument();
  });

  it('busca colegas por nickname quando termo começa com arroba', async () => {
    const user = userEvent.setup();

    render(<AmigosPage />);

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), '@maria');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(buscarColegas).toHaveBeenCalledWith({ nickname: 'maria', limit: 10 });
  });

  it('envia convite de amizade para colega encontrado', async () => {
    const user = userEvent.setup();
    buscarColegasMock.mockResolvedValue({
      dados: [
        {
          id: 'aluno-1',
          nome: 'Lucas Mendes',
          nickname: 'lucas',
          curso: 'Medicina',
          semestre: '3',
        },
      ],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));
    await user.click(await screen.findByRole('button', { name: /Adicionar amigo/i }));

    expect(enviarSolicitacao).toHaveBeenCalledWith('aluno-1');
    expect(await screen.findByRole('button', { name: /Solicitacao pendente/i })).toBeDisabled();
  });

  it('mostra solicitacao pendente quando colega buscado ja tem convite enviado', async () => {
    const user = userEvent.setup();
    buscarColegasMock.mockResolvedValue({
      dados: [
        {
          id: 'aluno-1',
          nome: 'Lucas Mendes',
          nickname: 'lucas',
          curso: 'Medicina',
          semestre: '3',
        },
      ],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    listarConvitesEnviadosMock.mockResolvedValue({
      dados: [
        {
          ...conviteRecebido,
          id: 'amizade-enviada-1',
          usuarioOrigemId: 'aluno-logado',
          usuarioDestinoId: 'aluno-1',
          amigo: {
            id: 'aluno-1',
            nome: 'Lucas Mendes',
            nickname: 'lucas',
            curso: 'Medicina',
            semestre: '3',
          },
        },
      ],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await waitFor(() => {
      expect(listarConvitesEnviados).toHaveBeenCalledWith({ limit: 100 });
    });
    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(await screen.findByText('Lucas Mendes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Solicitacao pendente/i })).toBeDisabled();
    expect(enviarSolicitacao).not.toHaveBeenCalled();
  });

  it('mostra estado vazio quando nao encontrar colegas', async () => {
    const user = userEvent.setup();

    render(<AmigosPage />);

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Inexistente');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(await screen.findByText(/Nenhum colega encontrado/i)).toBeInTheDocument();
  });

  it('lista convites recebidos na aba de convites', async () => {
    const user = userEvent.setup();
    listarConvitesRecebidosMock.mockResolvedValue({
      dados: [conviteRecebido],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Convites/i }));

    expect(listarConvitesRecebidos).toHaveBeenCalledWith({ limit: 10 });
    expect(await screen.findByText('Isabela Costa')).toBeInTheDocument();
    expect(screen.getByText('@isabela')).toBeInTheDocument();
    expect(screen.getByText('1 pendentes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceitar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recusar/i })).toBeInTheDocument();
  });

  it('aceita convite recebido e remove da lista', async () => {
    const user = userEvent.setup();
    listarConvitesRecebidosMock.mockResolvedValue({
      dados: [conviteRecebido],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Aceitar/i }));

    expect(aceitarConvite).toHaveBeenCalledWith('amizade-1');
    await waitFor(() => {
      expect(screen.queryByText('Isabela Costa')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum convite pendente/i)).toBeInTheDocument();
  });

  it('adiciona convite aceito na lista de amigos localmente', async () => {
    const user = userEvent.setup();
    listarConvitesRecebidosMock.mockResolvedValue({
      dados: [conviteRecebido],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Aceitar/i }));
    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));

    expect(await screen.findByText('Isabela Costa')).toBeInTheDocument();
    expect(screen.getByText('1 amigos')).toBeInTheDocument();
  });

  it('recusa convite recebido e remove da lista', async () => {
    const user = userEvent.setup();
    listarConvitesRecebidosMock.mockResolvedValue({
      dados: [conviteRecebido],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Recusar/i }));

    expect(recusarConvite).toHaveBeenCalledWith('amizade-1');
    await waitFor(() => {
      expect(screen.queryByText('Isabela Costa')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum convite pendente/i)).toBeInTheDocument();
  });

  it('lista amigos na aba meus amigos', async () => {
    const user = userEvent.setup();
    listarAmigosMock.mockResolvedValue({
      dados: [amizadeAtiva],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));

    expect(listarAmigos).toHaveBeenCalledWith({ limit: 100 });
    expect(await screen.findByText('Rafael Oliveira')).toBeInTheDocument();
    expect(screen.getByText('@rafael')).toBeInTheDocument();
    expect(screen.getByText('1 amigos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desfazer amizade/i })).toBeInTheDocument();
  });

  it('desfaz amizade e remove amigo da lista', async () => {
    const user = userEvent.setup();
    listarAmigosMock.mockResolvedValue({
      dados: [amizadeAtiva],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));
    await screen.findByText('Rafael Oliveira');
    await user.click(screen.getByRole('button', { name: /Desfazer amizade/i }));

    expect(desfazerAmizade).toHaveBeenCalledWith('amizade-ativa-1');
    await waitFor(() => {
      expect(screen.queryByText('Rafael Oliveira')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum amigo adicionado/i)).toBeInTheDocument();
  });

  it('altera privacidade para perfil privado', async () => {
    const user = userEvent.setup();

    render(<AmigosPage />);

    await user.click(screen.getByRole('switch', { name: /Alternar privacidade da rede/i }));

    expect(alterarVisibilidade).toHaveBeenCalledWith(false);
    expect(screen.getByText('Perfil privado')).toBeInTheDocument();
    expect(screen.getAllByText('Privado')).toHaveLength(2);
    expect(screen.getByRole('switch', { name: /Alternar privacidade da rede/i })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('restaura estado de privacidade quando a atualizacao falha', async () => {
    const user = userEvent.setup();
    alterarVisibilidadeMock.mockRejectedValue(new Error('Falha ao salvar privacidade'));

    render(<AmigosPage />);

    await user.click(screen.getByRole('switch', { name: /Alternar privacidade da rede/i }));

    expect(alterarVisibilidade).toHaveBeenCalledWith(false);
    expect(await screen.findByText('Falha ao salvar privacidade')).toBeInTheDocument();
    expect(screen.getByText('Perfil visivel')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /Alternar privacidade da rede/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});
