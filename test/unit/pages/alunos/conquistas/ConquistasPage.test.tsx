import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { listarProgressoConquistas } from '../../../../../src/features/achievements';
import type {
  ProgressoConquista,
  TierProgressoConquista,
} from '../../../../../src/features/achievements';
import { ConquistasPage } from '../../../../../src/pages/aluno/conquistas';

jest.mock('../../../../../src/features/achievements', () => ({
  listarProgressoConquistas: jest.fn(),
  AchievementCard: ({
    conquista,
    onSelect,
    carregando,
  }: {
    conquista?: ProgressoConquista;
    onSelect?: (conquista: ProgressoConquista) => void;
    carregando?: boolean;
  }) =>
    carregando ? (
      <div aria-label="Card carregando" />
    ) : (
      <button type="button" onClick={() => conquista && onSelect?.(conquista)}>
        Card {conquista?.nome}
      </button>
    ),
  AchievementMedal: ({ nome }: { nome: string }) => <span>Medalha {nome}</span>,
  AchievementProgress: ({
    valor,
    objetivo,
  }: {
    valor: number;
    objetivo: number | null;
  }) => (
    <span>
      Progresso {valor}/{objetivo ?? 'fim'}
    </span>
  ),
  AchievementDetailsModal: ({
    conquista,
    onClose,
  }: {
    conquista: ProgressoConquista;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="Detalhe">
      Detalhe {conquista.nome}
      <button type="button" onClick={onClose}>
        Fechar detalhe
      </button>
    </div>
  ),
  AchievementHighlightsModal: ({
    conquistas,
    onClose,
    onSaved,
  }: {
    conquistas: ProgressoConquista[];
    onClose: () => void;
    onSaved: (ids: Set<string>) => void;
  }) => (
    <div role="dialog" aria-label="Destaques">
      Destaques {conquistas.length}
      <button
        type="button"
        onClick={() => onSaved(new Set(['desbloqueio-1']))}
      >
        Confirmar destaques
      </button>
      <button type="button" onClick={onClose}>
        Fechar destaques
      </button>
    </div>
  ),
}));

const listarMock = jest.mocked(listarProgressoConquistas);

const criarTier = (
  dados: Partial<TierProgressoConquista> = {},
): TierProgressoConquista => ({
  tier: 'BRONZE',
  objetivo: 5,
  desbloqueado: false,
  desbloqueioId: null,
  destaque: false,
  conquistadoEm: null,
  moedas: 10,
  item: null,
  ...dados,
});

const criarConquista = (
  id: string,
  dados: Partial<ProgressoConquista> = {},
): ProgressoConquista => ({
  id,
  nome: `Conquista ${id}`,
  descricao: 'Descrição',
  tipoConquista: 'TOTAL_ACERTOS',
  tema: null,
  valorProgresso: 0,
  proximoTier: 'BRONZE',
  proximoObjetivo: 5,
  percentual: 0,
  tiers: [criarTier()],
  ...dados,
});

const desbloqueada = criarConquista('desbloqueada', {
  valorProgresso: 5,
  proximoTier: 'PRATA',
  proximoObjetivo: 10,
  percentual: 50,
  tiers: [
    criarTier({
      desbloqueado: true,
      desbloqueioId: 'desbloqueio-1',
      destaque: false,
    }),
  ],
});
const emProgresso = criarConquista('progresso', {
  valorProgresso: 4,
  percentual: 80,
});
const bloqueada = criarConquista('bloqueada');

const resposta = (dados: ProgressoConquista[]) => ({
  dados,
  metadados: {
    page: 1,
    limit: 100,
    total: dados.length,
    totalPages: dados.length ? 1 : 0,
  },
});

const renderPagina = (
  state?: { abrirConquistaId?: string; gerenciarDestaques?: boolean },
) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/aluno/conquistas',
          state: state ?? null,
        },
      ]}
    >
      <Routes>
        <Route path="/aluno/conquistas" element={<ConquistasPage />} />
        <Route path="/aluno/quiz/escolha" element={<div>Escolha de quiz</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ConquistasPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    listarMock.mockResolvedValue(
      resposta([desbloqueada, emProgresso, bloqueada]),
    );
  });

  it('exibe esqueletos durante o carregamento', () => {
    listarMock.mockImplementation(() => new Promise(() => {}));
    renderPagina();
    expect(screen.getAllByLabelText('Card carregando')).toHaveLength(6);
  });

  it('resume, filtra e abre os detalhes das conquistas', async () => {
    const user = userEvent.setup();
    renderPagina();

    expect(
      await screen.findByRole('button', {
        name: /Conquistas desbloqueadas/,
      }),
    ).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: /Em progresso/ })).toHaveTextContent(
      '2',
    );
    expect(screen.getByRole('button', { name: /Bloqueadas/ })).toHaveTextContent(
      '2',
    );
    expect(screen.getByText('Medalha Conquista progresso')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Em progresso/ }));
    expect(screen.getByText('Card Conquista progresso')).toBeInTheDocument();
    expect(screen.queryByText('Card Conquista bloqueada')).not.toBeInTheDocument();

    await user.click(screen.getByText('Card Conquista progresso'));
    expect(screen.getByRole('dialog', { name: 'Detalhe' })).toHaveTextContent(
      'Conquista progresso',
    );
    await user.click(screen.getByRole('button', { name: 'Fechar detalhe' }));
    expect(screen.queryByRole('dialog', { name: 'Detalhe' })).not.toBeInTheDocument();
  });

  it('gerencia os destaques e atualiza os tiers locais', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByText('Card Conquista desbloqueada');

    await user.click(
      screen.getByRole('button', { name: 'Gerenciar destaques' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Confirmar destaques' }),
    );

    expect(
      screen.getByText('Conquistas em destaque atualizadas.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Destaques' })).not.toBeInTheDocument();
  });

  it('fecha o gerenciamento sem salvar', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByText('Card Conquista desbloqueada');
    await user.click(
      screen.getByRole('button', { name: 'Gerenciar destaques' }),
    );
    await user.click(screen.getByRole('button', { name: 'Fechar destaques' }));
    expect(screen.queryByRole('dialog', { name: 'Destaques' })).not.toBeInTheDocument();
  });

  it('exibe erro conhecido e permite tentar novamente', async () => {
    const user = userEvent.setup();
    listarMock
      .mockRejectedValueOnce(new Error('Falha ao carregar conquistas'))
      .mockResolvedValueOnce(resposta([desbloqueada]));
    renderPagina();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao carregar conquistas',
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Card Conquista desbloqueada')).toBeInTheDocument();
  });

  it('usa mensagem padrão para falha não tipada', async () => {
    listarMock.mockRejectedValueOnce('falha');
    renderPagina();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar suas conquistas.',
    );
  });

  it('informa categorias vazias e conclusão de todos os desafios', async () => {
    const user = userEvent.setup();
    const completa = criarConquista('completa', {
      valorProgresso: 10,
      proximoTier: null,
      proximoObjetivo: null,
      percentual: 100,
      tiers: [criarTier({ desbloqueado: true })],
    });
    listarMock.mockResolvedValueOnce(resposta([completa]));
    renderPagina();

    expect(
      await screen.findByText('Todos os desafios disponíveis foram concluídos.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Em progresso/ }));
    expect(screen.getByText('Nenhuma conquista nesta categoria')).toBeInTheDocument();
  });

  it('carrega mais de seis conquistas', async () => {
    const user = userEvent.setup();
    const conquistas = Array.from({ length: 8 }, (_, indice) =>
      criarConquista(String(indice), {
        valorProgresso: 5,
        tiers: [criarTier({ desbloqueado: true })],
      }),
    );
    listarMock.mockResolvedValueOnce(resposta(conquistas));
    renderPagina();

    await screen.findByText('Card Conquista 0');
    expect(screen.getAllByText(/Card Conquista/)).toHaveLength(6);
    await user.click(
      screen.getByRole('button', { name: 'Carregar mais conquistas' }),
    );
    expect(screen.getAllByText(/Card Conquista/)).toHaveLength(8);
  });

  it('abre ações recebidas pelo estado da navegação', async () => {
    renderPagina({
      abrirConquistaId: 'desbloqueada',
      gerenciarDestaques: true,
    });

    expect(
      await screen.findByRole('dialog', { name: 'Detalhe' }),
    ).toHaveTextContent('Conquista desbloqueada');
    expect(screen.getByRole('dialog', { name: 'Destaques' })).toBeInTheDocument();
  });

  it('navega para continuar estudando', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByText('Card Conquista desbloqueada');
    await user.click(
      screen.getByRole('button', { name: 'Continuar estudando' }),
    );
    expect(screen.getByText('Escolha de quiz')).toBeInTheDocument();
  });

  it('não atualiza estado após desmontar durante a carga', async () => {
    let resolver!: (value: ReturnType<typeof resposta>) => void;
    const pendente = new Promise<ReturnType<typeof resposta>>((resolve) => {
      resolver = resolve;
    });
    listarMock.mockReturnValueOnce(pendente);
    const { unmount } = renderPagina();
    unmount();
    resolver(resposta([]));
    await pendente;
    await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(1));
  });
});
