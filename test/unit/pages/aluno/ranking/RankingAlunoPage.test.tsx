import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'Eu', nickname: 'eu', visivel: true } }),
}));

jest.mock('../../../../../src/features/profile-cosmetics', () => ({
  converterItensEquipadosParaSlots: jest.fn(() => ({})),
}));

jest.mock('../../../../../src/features/ranking', () => ({
  obterRankingGeral: jest.fn(),
  obterRankingAmigos: jest.fn(),
  RankingBoard: ({
    linhas,
    carregando,
    erro,
    mensagemVazio,
    usuarioAtual,
  }: {
    linhas: Array<{ nome: string }>;
    carregando: boolean;
    erro: string | null;
    mensagemVazio: string;
    usuarioAtual?: { nome: string } | null;
  }) => (
    <div data-testid="board">
      {carregando ? 'carregando' : null}
      {erro}
      {!carregando && !erro && linhas.length === 0 ? mensagemVazio : null}
      <span data-testid="linhas">{linhas.map((l) => l.nome).join(',')}</span>
      <span data-testid="atual">{usuarioAtual?.nome ?? ''}</span>
    </div>
  ),
}));

import { obterRankingAmigos, obterRankingGeral } from '../../../../../src/features/ranking';
import { RankingAlunoPage } from '../../../../../src/pages/aluno/ranking/ui/RankingAlunoPage';

const geralMock = obterRankingGeral as jest.Mock;
const amigosMock = obterRankingAmigos as jest.Mock;

const criarEntrada = (over: Record<string, unknown> = {}) => ({
  posicao: 1,
  usuarioId: 'u1',
  nome: 'Eu',
  nickname: null,
  curso: 'Medicina',
  semestre: '3',
  totalAcertos: 5,
  totalRespondidas: 6,
  taxaAcerto: 83,
  ehUsuarioAtual: true,
  cosmeticos: [],
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <RankingAlunoPage />
    </MemoryRouter>,
  );

describe('RankingAlunoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mostra a posicao do usuario no ranking geral', async () => {
    geralMock.mockResolvedValue({
      dados: [criarEntrada()],
      usuarioAtual: criarEntrada(),
      totalParticipantes: 10,
    });

    renderPage();

    await waitFor(() => expect(geralMock).toHaveBeenCalled());
    expect(await screen.findByText('1º')).toBeInTheDocument();
    expect(screen.getByText(/de 10/)).toBeInTheDocument();
  });

  test('mostra banner de perfil privado quando o usuario atual e nulo', async () => {
    geralMock.mockResolvedValue({ dados: [], usuarioAtual: null, totalParticipantes: 0 });

    renderPage();

    expect(await screen.findByText(/perfil está privado/i)).toBeInTheDocument();
  });

  test('troca para a aba de amigos e mostra dica quando esta sozinho', async () => {
    geralMock.mockResolvedValue({ dados: [], usuarioAtual: null, totalParticipantes: 0 });
    amigosMock.mockResolvedValue({
      dados: [criarEntrada()],
      usuarioAtual: criarEntrada(),
      totalParticipantes: 1,
    });

    renderPage();
    await waitFor(() => expect(geralMock).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Entre amigos'));

    await waitFor(() => expect(amigosMock).toHaveBeenCalled());
    expect(await screen.findByText(/Adicione amigos/i)).toBeInTheDocument();
  });

  test('monta detalhes e apelidos variados das linhas', async () => {
    geralMock.mockResolvedValue({
      dados: [
        criarEntrada({ usuarioId: 'u1', nome: 'Eu', ehUsuarioAtual: true, nickname: null, curso: 'Medicina', semestre: '3' }),
        criarEntrada({ usuarioId: 'b', nome: 'Bob', ehUsuarioAtual: false, nickname: 'bob', curso: 'Enfermagem', semestre: null }),
        criarEntrada({ usuarioId: 'c', nome: 'Cris', ehUsuarioAtual: false, nickname: null, curso: null, semestre: null }),
      ],
      usuarioAtual: criarEntrada(),
      totalParticipantes: 3,
    });

    renderPage();

    await waitFor(() => expect(geralMock).toHaveBeenCalled());
    expect(await screen.findByTestId('linhas')).toHaveTextContent('Eu,Bob,Cris');
  });

  test('mostra erro quando a busca falha', async () => {
    geralMock.mockRejectedValue(new Error('falhou ao carregar'));

    renderPage();

    expect(await screen.findByText('falhou ao carregar')).toBeInTheDocument();
  });
});
