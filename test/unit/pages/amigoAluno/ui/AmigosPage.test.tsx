import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
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

jest.mock('../../../../../src/features/profile-cosmetics', () => ({
  buscarEquipadosDe: jest.fn(),
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
} from '../../../../../src/features/friendship';
import type {
  ItemInventario,
  TipoItemLoja,
} from '../../../../../src/features/loja';
import { buscarEquipadosDe } from '../../../../../src/features/profile-cosmetics';
import { AmigosPage } from '../../../../../src/pages/amigosAluno/ui/AmigosPage';

jest.mock('../../../../../src/features/friendship', () => ({
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
const buscarEquipadosDeMock = buscarEquipadosDe as jest.Mock;

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

const criarCosmetico = (
  tipo: TipoItemLoja,
  dados: Partial<ItemInventario> = {},
): ItemInventario => ({
  id: `item-${tipo.toLowerCase()}`,
  codigo: `codigo-${tipo.toLowerCase()}`,
  nome: `Item ${tipo}`,
  descricao: null,
  tipo,
  precoMoedas: 100,
  valor: null,
  imagemUrl: null,
  previewImagemUrl: null,
  ativo: true,
  ...dados,
});

function criarDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderAmigos = () =>
  render(
    <MemoryRouter initialEntries={['/aluno/amigos']}>
      <AmigosPage />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('AmigosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    buscarEquipadosDeMock.mockResolvedValue({});
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

  it('renderiza a pagina de rede do aluno', async () => {
    renderAmigos();

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
    await waitFor(() => {
      expect(buscarEquipadosDeMock).toHaveBeenCalledTimes(2);
    });
  });

  it('alterna entre as abas da tela', async () => {
    const user = userEvent.setup();

    renderAmigos();

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

    renderAmigos();

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(buscarColegas).toHaveBeenCalledWith({ nome: 'Lucas', limit: 10 });
    expect(await screen.findByText('Lucas Mendes')).toBeInTheDocument();
    expect(screen.getByText('@lucas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adicionar amigo/i })).toBeInTheDocument();
  });

  it('busca colegas por nickname quando termo começa com arroba', async () => {
    const user = userEvent.setup();

    renderAmigos();

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

    renderAmigos();

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));
    await user.click(await screen.findByRole('button', { name: /Adicionar amigo/i }));

    expect(enviarSolicitacao).toHaveBeenCalledWith('aluno-1');
    expect(await screen.findByRole('button', { name: /Solicitacao pendente/i })).toBeDisabled();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
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

    renderAmigos();

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

    renderAmigos();

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

    renderAmigos();

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

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Aceitar/i }));

    expect(aceitarConvite).toHaveBeenCalledWith('amizade-1');
    await waitFor(() => {
      expect(screen.queryByText('Isabela Costa')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum convite pendente/i)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
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

    renderAmigos();

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

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Recusar/i }));

    expect(recusarConvite).toHaveBeenCalledWith('amizade-1');
    await waitFor(() => {
      expect(screen.queryByText('Isabela Costa')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum convite pendente/i)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
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

    renderAmigos();

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

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));
    await screen.findByText('Rafael Oliveira');
    await user.click(screen.getByRole('button', { name: /Desfazer amizade/i }));

    expect(desfazerAmizade).toHaveBeenCalledWith('amizade-ativa-1');
    await waitFor(() => {
      expect(screen.queryByText('Rafael Oliveira')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Nenhum amigo adicionado/i)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
  });

  it('altera privacidade para perfil privado', async () => {
    const user = userEvent.setup();

    renderAmigos();

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

    renderAmigos();

    await user.click(screen.getByRole('switch', { name: /Alternar privacidade da rede/i }));

    expect(alterarVisibilidade).toHaveBeenCalledWith(false);
    expect(await screen.findByText('Falha ao salvar privacidade')).toBeInTheDocument();
    expect(screen.getByText('Perfil visivel')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /Alternar privacidade da rede/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('nao adiciona amigo duplicado quando ja existe na lista', async () => {
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
    listarConvitesRecebidosMock.mockResolvedValue({
      dados: [amizadeAtiva],
      metadados: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Rafael Oliveira');
    await user.click(screen.getByRole('button', { name: /Aceitar/i }));

    await waitFor(() => {
      expect(screen.queryByText('Nenhum amigo adicionado')).not.toBeInTheDocument();
    });
  });

  it('trata erro ao aceitar convite', async () => {
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
    aceitarConviteMock.mockRejectedValue(new Error('Erro ao aceitar convite'));

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Aceitar/i }));

    expect(await screen.findByText('Erro ao aceitar convite')).toBeInTheDocument();
    expect(screen.getByText('Isabela Costa')).toBeInTheDocument();
  });

  it('trata erro ao recusar convite', async () => {
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
    recusarConviteMock.mockRejectedValue(new Error('Erro ao recusar convite'));

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Convites/i }));
    await screen.findByText('Isabela Costa');
    await user.click(screen.getByRole('button', { name: /Recusar/i }));

    expect(await screen.findByText('Erro ao recusar convite')).toBeInTheDocument();
    expect(screen.getByText('Isabela Costa')).toBeInTheDocument();
  });

  it('trata erro ao desfazer amizade', async () => {
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
    desfazerAmizadeMock.mockRejectedValue(new Error('Erro ao desfazer amizade'));

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));
    await screen.findByText('Rafael Oliveira');
    await user.click(screen.getByRole('button', { name: /Desfazer amizade/i }));

    expect(await screen.findByText('Erro ao desfazer amizade')).toBeInTheDocument();
    expect(screen.getByText('Rafael Oliveira')).toBeInTheDocument();
  });

  it('trata erro ao buscar colegas', async () => {
    const user = userEvent.setup();
    buscarColegasMock.mockRejectedValue(new Error('Erro na busca'));

    renderAmigos();

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(await screen.findByText('Erro na busca')).toBeInTheDocument();
  });

  it('trata erro ao enviar solicitacao de amizade', async () => {
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
    enviarSolicitacaoMock.mockRejectedValue(new Error('Erro ao enviar solicitacao'));

    renderAmigos();

    await user.type(screen.getByLabelText(/Buscar por nome ou nickname/i), 'Lucas');
    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));
    await user.click(await screen.findByRole('button', { name: /Adicionar amigo/i }));

    expect(await screen.findByText('Erro ao enviar solicitacao')).toBeInTheDocument();
  });

  it('nao realiza busca quando termo esta vazio', async () => {
    const user = userEvent.setup();

    renderAmigos();

    await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

    expect(buscarColegas).not.toHaveBeenCalled();
  });

  describe('cosmeticos nos cards de amigos', () => {
    it('busca cosmeticos dos amigos em uma unica chamada em lote', async () => {
      const outraAmizade = {
        ...amizadeAtiva,
        id: 'amizade-ativa-2',
        amigo: {
          ...amizadeAtiva.amigo,
          id: 'aluno-3',
          nome: 'Carlos Lima',
          nickname: 'carlos',
        },
      };
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeAtiva, outraAmizade],
        metadados: { page: 1, limit: 100, total: 2, totalPages: 1 },
      });

      renderAmigos();

      await waitFor(() => {
        expect(buscarEquipadosDeMock).toHaveBeenCalledWith([
          'aluno-2',
          'aluno-3',
        ]);
      });

      const chamadasDoLote = buscarEquipadosDeMock.mock.calls.filter(
        ([ids]) => Array.isArray(ids) && ids.includes('aluno-2'),
      );
      expect(chamadasDoLote).toHaveLength(1);
    });

    it('busca cosmeticos dos remetentes de convites em lote', async () => {
      listarConvitesRecebidosMock.mockResolvedValue({
        dados: [conviteRecebido],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      renderAmigos();

      await waitFor(() => {
        expect(buscarEquipadosDeMock).toHaveBeenCalledWith(['aluno-1']);
      });
    });

    it('busca cosmeticos dos resultados da pesquisa em lote', async () => {
      const user = userEvent.setup();
      buscarColegasMock.mockResolvedValue({
        dados: [
          {
            id: 'aluno-3',
            nome: 'Carlos Lima',
            nickname: 'carlos',
            curso: 'Medicina',
            semestre: '2',
          },
        ],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      renderAmigos();

      await user.type(
        screen.getByLabelText(/Buscar por nome ou nickname/i),
        'Carlos',
      );
      await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

      await waitFor(() => {
        expect(buscarEquipadosDeMock).toHaveBeenCalledWith(['aluno-3']);
      });
    });

    it('mantem a pagina funcional quando a busca de cosmeticos falha', async () => {
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeAtiva],
        metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });
      buscarEquipadosDeMock.mockRejectedValue(new Error('Sem conexão'));
      const user = userEvent.setup();

      renderAmigos();

      await user.click(screen.getByRole('button', { name: /Meus amigos/i }));
      expect(await screen.findByText('Rafael Oliveira')).toBeInTheDocument();
      expect(screen.queryByText('Sem conexão')).not.toBeInTheDocument();
    });

    it('renderiza avatar, moldura e titulo equipados no card', async () => {
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeAtiva],
        metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });
      buscarEquipadosDeMock.mockResolvedValue({
        'aluno-2': {
          AVATAR: criarCosmetico('AVATAR', {
            nome: 'Avatar do Rafael',
            imagemUrl: '/avatar-rafael.png',
          }),
          MOLDURA: criarCosmetico('MOLDURA', {
            nome: 'Moldura Dourada',
            valor: '#f59e0b',
          }),
          TITULO: criarCosmetico('TITULO', {
            nome: 'Veterano dos Ossos',
          }),
        },
      });
      const user = userEvent.setup();

      renderAmigos();

      await user.click(screen.getByRole('button', { name: /Meus amigos/i }));

      expect(
        await screen.findByRole('img', { name: 'Avatar do Rafael' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Moldura Moldura Dourada')).toBeInTheDocument();
      expect(screen.getByText('Veterano dos Ossos')).toBeInTheDocument();
    });

    it('usa iniciais como fallback quando o amigo nao tem cosmeticos', async () => {
      const amizadeSemNickname = {
        ...amizadeAtiva,
        amigo: {
          ...amizadeAtiva.amigo,
          nickname: null,
        },
      };
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeSemNickname],
        metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });
      const user = userEvent.setup();

      renderAmigos();

      await user.click(screen.getByRole('button', { name: /Meus amigos/i }));

      expect(await screen.findByText('RO')).toBeInTheDocument();
    });

    it('renderiza cosmeticos nos cards de convite e resultado da busca', async () => {
      const user = userEvent.setup();
      listarConvitesRecebidosMock.mockResolvedValue({
        dados: [conviteRecebido],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      buscarColegasMock.mockResolvedValue({
        dados: [
          {
            id: 'aluno-3',
            nome: 'Carlos Lima',
            nickname: null,
            curso: 'Medicina',
            semestre: '2',
          },
        ],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      buscarEquipadosDeMock.mockImplementation(async (ids: string[]) => {
        if (ids.includes('aluno-1')) {
          return {
            'aluno-1': {
              ICONE_PERFIL: criarCosmetico('ICONE_PERFIL', {
                nome: 'Icone da Isabela',
                imagemUrl: '/icone-isabela.png',
              }),
            },
          };
        }

        if (ids.includes('aluno-3')) {
          return {
            'aluno-3': {
              TITULO: criarCosmetico('TITULO', {
                nome: 'Explorador Anatomico',
              }),
            },
          };
        }

        return {};
      });

      renderAmigos();

      await user.click(screen.getByRole('button', { name: /Convites/i }));
      expect(
        await screen.findByRole('img', { name: 'Icone da Isabela' }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Buscar colegas/i }));
      await user.type(
        screen.getByLabelText(/Buscar por nome ou nickname/i),
        'Carlos',
      );
      await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

      expect(await screen.findByText('Explorador Anatomico')).toBeInTheDocument();
    });

    it('mantem resultados quando a busca de cosmeticos dos colegas falha', async () => {
      const user = userEvent.setup();
      buscarColegasMock.mockResolvedValue({
        dados: [
          {
            id: 'aluno-3',
            nome: 'Carlos Lima',
            nickname: 'carlos',
            curso: 'Medicina',
            semestre: '2',
          },
        ],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      buscarEquipadosDeMock.mockImplementation(async (ids: string[]) => {
        if (ids.includes('aluno-3')) {
          throw new Error('Falha visual');
        }

        return {};
      });

      renderAmigos();

      await user.type(
        screen.getByLabelText(/Buscar por nome ou nickname/i),
        'Carlos',
      );
      await user.click(screen.getByRole('button', { name: /^Buscar$/i }));

      expect(await screen.findByText('Carlos Lima')).toBeInTheDocument();
      expect(screen.queryByText('Falha visual')).not.toBeInTheDocument();
    });

    it('ignora resposta de cosmeticos depois de desmontar a pagina', async () => {
      const respostaCosmeticos = criarDeferred<Record<string, never>>();
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeAtiva],
        metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });
      listarConvitesRecebidosMock.mockResolvedValue({
        dados: [conviteRecebido],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
      buscarEquipadosDeMock.mockReturnValue(respostaCosmeticos.promise);

      const { unmount } = renderAmigos();

      await waitFor(() => {
        expect(buscarEquipadosDeMock).toHaveBeenCalledWith(['aluno-1']);
        expect(buscarEquipadosDeMock).toHaveBeenCalledWith(['aluno-2']);
      });
      unmount();

      respostaCosmeticos.resolve({});
      await respostaCosmeticos.promise;
      await Promise.resolve();

      expect(buscarEquipadosDeMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('navegacao pelos cards de amigos', () => {
    it('navega pelo card de um resultado da busca', async () => {
      const user = userEvent.setup();
      buscarColegasMock.mockResolvedValue({
        dados: [
          {
            id: 'aluno-3',
            nome: 'Carlos Lima',
            nickname: 'carlos',
            curso: 'Medicina',
            semestre: '2',
          },
        ],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      renderAmigos();

      await user.type(
        screen.getByLabelText(/Buscar por nome ou nickname/i),
        'Carlos',
      );
      await user.click(screen.getByRole('button', { name: /^Buscar$/i }));
      await user.click(await screen.findByText('Carlos Lima'));

      expect(screen.getByTestId('location')).toHaveTextContent(
        '/aluno/amigos/aluno-3',
      );
    });

    it('navega pelo card de um convite recebido', async () => {
      const user = userEvent.setup();
      listarConvitesRecebidosMock.mockResolvedValue({
        dados: [conviteRecebido],
        metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      renderAmigos();

      await user.click(screen.getByRole('button', { name: /Convites/i }));
      await user.click(await screen.findByText('Isabela Costa'));

      expect(screen.getByTestId('location')).toHaveTextContent(
        '/aluno/amigos/aluno-1',
      );
    });

    it('navega pelo card de uma amizade ativa', async () => {
      const user = userEvent.setup();
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeAtiva],
        metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });

      renderAmigos();

      await user.click(screen.getByRole('button', { name: /Meus amigos/i }));
      await user.click(await screen.findByText('Rafael Oliveira'));

      expect(screen.getByTestId('location')).toHaveTextContent(
        '/aluno/amigos/aluno-2',
      );
    });

    it('passa amizadeId no state ao navegar por uma amizade ativa', async () => {
      const user = userEvent.setup();
      const StateCapture = () => {
        const estadoNavegacao = useLocation().state;
        return (
          <span data-testid="navigation-state">
            {JSON.stringify(estadoNavegacao)}
          </span>
        );
      };
      listarAmigosMock.mockResolvedValue({
        dados: [amizadeAtiva],
        metadados: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });

      render(
        <MemoryRouter initialEntries={['/aluno/amigos']}>
          <Routes>
            <Route path="/aluno/amigos" element={<AmigosPage />} />
            <Route path="/aluno/amigos/:id" element={<StateCapture />} />
          </Routes>
        </MemoryRouter>,
      );

      await user.click(screen.getByRole('button', { name: /Meus amigos/i }));
      await user.click(await screen.findByText('Rafael Oliveira'));

      expect(screen.getByTestId('navigation-state')).toHaveTextContent(
        '{"amizadeId":"amizade-ativa-1"}',
      );
    });
  });
});
