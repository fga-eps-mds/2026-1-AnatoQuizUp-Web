import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      visivel: true,
    },
  }),
}));

jest.mock('../../../../../src/features/friendship', () => ({
  aceitarConvite: jest.fn(),
  alterarVisibilidade: jest.fn(),
  buscarColegas: jest.fn(),
  desfazerAmizade: jest.fn(),
  enviarSolicitacao: jest.fn(),
  listarConvitesEnviados: jest.fn(),
  listarConvitesRecebidos: jest.fn(),
  recusarConvite: jest.fn(),
}));

jest.mock('../../../../../src/features/social-profile', () => ({
  listarAmigosSociais: jest.fn(),
}));

import {
  aceitarConvite,
  alterarVisibilidade,
  buscarColegas,
  desfazerAmizade,
  enviarSolicitacao,
  listarConvitesEnviados,
  listarConvitesRecebidos,
  recusarConvite,
} from '../../../../../src/features/friendship';
import { listarAmigosSociais } from '../../../../../src/features/social-profile';
import { AmigosPage } from '../../../../../src/pages/amigosAluno/ui/AmigosPage';

const mocks = {
  aceitar: aceitarConvite as jest.Mock,
  privacidade: alterarVisibilidade as jest.Mock,
  buscar: buscarColegas as jest.Mock,
  desfazer: desfazerAmizade as jest.Mock,
  enviar: enviarSolicitacao as jest.Mock,
  enviados: listarConvitesEnviados as jest.Mock,
  recebidos: listarConvitesRecebidos as jest.Mock,
  recusar: recusarConvite as jest.Mock,
  amigos: listarAmigosSociais as jest.Mock,
};

const vazio = {
  dados: [],
  metadados: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

const amizade = {
  id: 'amizade-1',
  criadoEm: '2026-06-01',
  atualizadoEm: '2026-06-01',
  excluidoEm: null,
  usuarioOrigemId: 'test-user',
  usuarioDestinoId: 'amigo-1',
  statusAmizade: 'ATIVO',
  amigo: {
    id: 'amigo-1',
    nome: 'Rafael Oliveira',
    nickname: 'rafael',
    curso: 'Medicina',
    semestre: '4',
  },
  cosmeticos: [],
  conquistasDestacadas: [
    {
      desbloqueioId: 'desbloqueio-1',
      conquistaId: 'conquista-1',
      nome: 'Primeiros Passos',
      descricao: 'Acerte questões',
      tier: 'BRONZE',
      tipoConquista: 'TOTAL_ACERTOS',
      tema: null,
      conquistadoEm: '2026-06-01',
    },
  ],
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/aluno/amigos']}>
      <AmigosPage />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('AmigosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.buscar.mockResolvedValue(vazio);
    mocks.enviar.mockResolvedValue({ mensagem: 'Enviado' });
    mocks.enviados.mockResolvedValue(vazio);
    mocks.recebidos.mockResolvedValue(vazio);
    mocks.amigos.mockResolvedValue({ ...vazio, dados: [amizade] });
    mocks.aceitar.mockResolvedValue({ mensagem: 'Aceito' });
    mocks.recusar.mockResolvedValue({ mensagem: 'Recusado' });
    mocks.desfazer.mockResolvedValue({ mensagem: 'Removido' });
    mocks.privacidade.mockResolvedValue({ mensagem: 'Atualizado' });
  });

  it('carrega amigos pelo endpoint social agregado', async () => {
    renderPage();

    await waitFor(() => {
      expect(mocks.amigos).toHaveBeenCalledWith({ limit: 100 });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Meus amigos' }));
    expect(await screen.findByText('Rafael Oliveira')).toBeInTheDocument();
    expect(
      screen.getAllByLabelText('Primeiros Passos, tier Bronze'),
    ).not.toHaveLength(0);
  });

  it('busca colega por nome e envia solicitacao', async () => {
    mocks.buscar.mockResolvedValue({
      ...vazio,
      dados: [amizade.amigo],
    });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Buscar por nome ou nickname'), 'Rafael');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: 'Adicionar amigo' }));

    expect(mocks.buscar).toHaveBeenCalledWith({ nome: 'Rafael', limit: 10 });
    expect(mocks.enviar).toHaveBeenCalledWith('amigo-1');
    expect(await screen.findByText('Solicitacao pendente')).toBeInTheDocument();
  });

  it('lista e aceita convite recebido', async () => {
    mocks.recebidos.mockResolvedValue({
      ...vazio,
      dados: [{ ...amizade, statusAmizade: 'PENDENTE' }],
    });
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Convites' }));
    await user.click(await screen.findByRole('button', { name: 'Aceitar' }));

    expect(mocks.aceitar).toHaveBeenCalledWith('amizade-1');
  });

  it('desfaz amizade na aba de amigos', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Meus amigos' }));
    await user.click(await screen.findByRole('button', { name: 'Desfazer amizade' }));

    expect(mocks.desfazer).toHaveBeenCalledWith('amizade-1');
    await waitFor(() => {
      expect(screen.queryByText('Rafael Oliveira')).not.toBeInTheDocument();
    });
  });

  it('altera a privacidade da rede', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('switch', { name: 'Alternar privacidade da rede' }));

    expect(mocks.privacidade).toHaveBeenCalledWith(false);
    expect(await screen.findAllByText('Privado')).not.toHaveLength(0);
  });

  it('navega para o perfil social do amigo', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Meus amigos' }));
    await user.click(await screen.findByRole('button', { name: /Ver perfil/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/amigos/amigo-1');
  });
});
