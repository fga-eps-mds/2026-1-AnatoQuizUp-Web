import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {
  ConquistaDestacada,
  ProgressoConquista,
  TierProgressoConquista,
  TipoConquista,
} from '../../../../src/features/achievements';
import {
  AchievementCard,
  AchievementDetailsModal,
  AchievementHighlights,
  AchievementMedal,
  AchievementProgress,
  AchievementReward,
  AchievementTierBadge,
} from '../../../../src/features/achievements';
import {
  obterTierMaisAlto,
  ORDEM_TIERS,
} from '../../../../src/features/achievements/ui/achievementVisuals';

const item = {
  id: 'item-1',
  codigo: 'avatar-teste',
  nome: 'Avatar Teste',
  descricao: null,
  tipo: 'AVATAR' as const,
  valor: null,
  imagemUrl: '/avatar.png',
  previewImagemUrl: null,
};

const criarTier = (
  tier: TierProgressoConquista['tier'],
  dados: Partial<TierProgressoConquista> = {},
): TierProgressoConquista => ({
  tier,
  objetivo: tier === 'BRONZE' ? 5 : tier === 'PRATA' ? 10 : 20,
  desbloqueado: false,
  desbloqueioId: null,
  destaque: false,
  conquistadoEm: null,
  moedas: 10,
  item: null,
  ...dados,
});

const criarConquista = (
  dados: Partial<ProgressoConquista> = {},
): ProgressoConquista => ({
  id: 'conquista-1',
  nome: 'Primeiros Passos',
  descricao: 'Acerte questões para evoluir.',
  tipoConquista: 'TOTAL_ACERTOS',
  tema: null,
  valorProgresso: 3,
  proximoTier: 'BRONZE',
  proximoObjetivo: 5,
  percentual: 60,
  tiers: [
    criarTier('BRONZE'),
    criarTier('PRATA'),
    criarTier('OURO'),
  ],
  ...dados,
});

describe('componentes de conquistas', () => {
  it('calcula o tier mais alto desbloqueado', () => {
    expect(
      obterTierMaisAlto([
        criarTier('BRONZE', { desbloqueado: true }),
        criarTier('PRATA', { desbloqueado: true }),
        criarTier('OURO'),
      ]),
    ).toBe('PRATA');
    expect(obterTierMaisAlto([])).toBeNull();
    expect(ORDEM_TIERS).toEqual(['BRONZE', 'PRATA', 'OURO']);
  });

  it.each([
    ['TOTAL_ACERTOS', 'BRONZE', 'sm'],
    ['TOTAL_ACERTOS_TEMA', 'PRATA', 'md'],
    ['STREAK_ACERTOS', 'OURO', 'lg'],
    ['PERCENTUAL_ACERTO_TEMA', null, 'md'],
  ] as const)(
    'renderiza medalha %s no tier %s e tamanho %s',
    (tipo, tier, tamanho) => {
      render(
        <AchievementMedal
          tipo={tipo as TipoConquista}
          tier={tier}
          tamanho={tamanho}
          nome="Medalha"
        />,
      );
      expect(screen.getByRole('img')).toHaveAccessibleName(/Medalha, tier/i);
    },
  );

  it('diferencia medalhas bloqueadas e destacadas', () => {
    const { rerender } = render(
      <AchievementMedal
        tipo="TOTAL_ACERTOS"
        bloqueada
        destacada
        tamanho="lg"
        nome="Bloqueada"
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/bloqueada/i);

    rerender(
      <AchievementMedal
        tipo="TOTAL_ACERTOS"
        destacada
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(/Conquista/i);
  });

  it('usa uma medalha padrão quando recebe um tipo desconhecido', () => {
    render(
      <AchievementMedal
        tipo={'TIPO_DESCONHECIDO' as TipoConquista}
        nome="Conquista legada"
      />,
    );

    expect(screen.getByRole('img')).toHaveAccessibleName(/Conquista legada/i);
  });

  it('renderiza badges normal, atual e bloqueado', () => {
    const { rerender } = render(<AchievementTierBadge tier="BRONZE" />);
    expect(screen.getByText('Bronze')).toBeInTheDocument();

    rerender(<AchievementTierBadge tier="PRATA" atual />);
    expect(screen.getByText('Atual')).toBeInTheDocument();

    rerender(<AchievementTierBadge tier="OURO" bloqueado />);
    expect(screen.getByText('Ouro')).toBeInTheDocument();
  });

  it('renderiza progresso carregando, calculado, limitado e concluído', () => {
    const { rerender } = render(
      <AchievementProgress valor={0} objetivo={10} carregando />,
    );
    expect(screen.getByLabelText('Carregando progresso')).toBeInTheDocument();

    rerender(<AchievementProgress valor={5} objetivo={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    expect(screen.getByText('5 / 10')).toBeInTheDocument();

    rerender(
      <AchievementProgress
        valor={30}
        objetivo={10}
        percentual={140}
        compacto
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.queryByText(/concluído/)).not.toBeInTheDocument();

    rerender(
      <AchievementProgress valor={-1} objetivo={null} percentual={-20} />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('Completa')).toBeInTheDocument();

    rerender(<AchievementProgress valor={10} objetivo={null} concluido />);
    expect(screen.getByText('Todos os tiers foram conquistados.')).toBeInTheDocument();

    rerender(<AchievementProgress valor={10} objetivo={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renderiza todos os estados de recompensa', () => {
    const { container, rerender } = render(<AchievementReward carregando />);
    expect(screen.getByLabelText('Carregando recompensas')).toBeInTheDocument();

    rerender(<AchievementReward />);
    expect(screen.getByText('Sem recompensa adicional')).toBeInTheDocument();

    rerender(<AchievementReward moedas={25} compacto />);
    expect(screen.getByText('+25 ATP')).toBeInTheDocument();
    expect(screen.queryByText('Recompensa')).not.toBeInTheDocument();

    rerender(<AchievementReward item={item} />);
    expect(screen.getByText('Avatar Teste')).toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute('src', '/avatar.png');

    rerender(
      <AchievementReward
        moedas={50}
        item={{ ...item, imagemUrl: null, previewImagemUrl: '/preview.png' }}
        compacto
      />,
    );
    expect(screen.getByText('+50 ATP')).toBeInTheDocument();
    expect(screen.queryByText('Item exclusivo')).not.toBeInTheDocument();
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/preview.png',
    );
  });

  it('renderiza card em carregamento e compacto', () => {
    const { rerender } = render(<AchievementCard carregando compacto />);
    expect(screen.getByLabelText('Carregando conquista')).toBeInTheDocument();
    rerender(<AchievementCard />);
    expect(screen.getByLabelText('Carregando conquista')).toBeInTheDocument();
  });

  it('renderiza card bloqueado sem ação', () => {
    render(
      <AchievementCard
        conquista={criarConquista({
          valorProgresso: 0,
          percentual: 0,
        })}
      />,
    );
    expect(screen.getByText('Ainda não iniciada')).toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renderiza card em progresso com tema e permite seleção', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const conquista = criarConquista({
      tema: { id: 'tema-1', nome: 'Miologia' },
      tiers: [
        criarTier('BRONZE', {
          desbloqueado: true,
          desbloqueioId: 'desbloqueio-1',
          destaque: true,
        }),
        criarTier('PRATA'),
        criarTier('OURO'),
      ],
      proximoTier: 'PRATA',
      proximoObjetivo: 10,
    });

    render(
      <AchievementCard
        conquista={conquista}
        onSelect={onSelect}
        compacto
      />,
    );
    expect(screen.getByText(/Miologia/)).toBeInTheDocument();
    expect(screen.getByText(/Em progresso para prata/)).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(conquista);
  });

  it('renderiza uma conquista totalmente concluída', () => {
    const { rerender } = render(
      <AchievementCard
        conquista={criarConquista({
          proximoTier: null,
          proximoObjetivo: null,
          percentual: 100,
          tiers: [
            criarTier('BRONZE', { desbloqueado: true }),
            criarTier('PRATA', { desbloqueado: true }),
            criarTier('OURO', { desbloqueado: true }),
          ],
        })}
      />,
    );
    expect(screen.getByText('Conquista completa')).toBeInTheDocument();

    rerender(
      <AchievementCard
        conquista={criarConquista({
          proximoTier: null,
          proximoObjetivo: null,
          valorProgresso: 0,
          tiers: [],
        })}
      />,
    );
    expect(screen.getByText('Ainda não iniciada')).toBeInTheDocument();
  });

  it('renderiza destaques vazios e permite gerenciar', async () => {
    const user = userEvent.setup();
    const onManage = jest.fn();
    const { rerender } = render(
      <AchievementHighlights conquistas={[]} onManage={onManage} />,
    );
    expect(screen.getByText('Nenhuma conquista em destaque.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Gerenciar destaques' }));
    expect(onManage).toHaveBeenCalled();

    rerender(
      <AchievementHighlights
        conquistas={undefined as unknown as ConquistaDestacada[]}
      />,
    );
    expect(screen.getByText('Nenhuma conquista em destaque.')).toBeInTheDocument();

    const destaques: ConquistaDestacada[] = Array.from(
      { length: 4 },
      (_, indice) => ({
        desbloqueioId: `desbloqueio-${indice}`,
        conquistaId: `conquista-${indice}`,
        nome: `Destaque ${indice}`,
        descricao: 'Descrição',
        tier: indice % 2 === 0 ? 'BRONZE' : 'PRATA',
        tipoConquista: 'TOTAL_ACERTOS',
        tema: null,
        conquistadoEm: '2026-06-20T12:00:00.000Z',
      }),
    );
    rerender(<AchievementHighlights conquistas={destaques} compact />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByText('bronze')).not.toBeInTheDocument();

    rerender(<AchievementHighlights conquistas={destaques} />);
    expect(screen.getAllByText(/bronze|prata/)).toHaveLength(3);
  });

  it('fecha o detalhamento pelo botão, Escape e fundo', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const conquista = criarConquista({
      valorProgresso: 7,
      proximoTier: 'PRATA',
      proximoObjetivo: 10,
      percentual: 70,
      tiers: [
        criarTier('BRONZE', {
          desbloqueado: true,
          desbloqueioId: 'desbloqueio-1',
          destaque: true,
          item,
        }),
        criarTier('PRATA', {
          item: { ...item, id: 'item-2', imagemUrl: null },
        }),
        criarTier('OURO'),
      ],
    });
    const { rerender } = render(
      <AchievementDetailsModal conquista={conquista} onClose={onClose} />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Tier conquistado')).toBeInTheDocument();
    expect(screen.getByText('Seu próximo marco')).toBeInTheDocument();
    expect(screen.getByText('Disponível após o tier anterior')).toBeInTheDocument();
    expect(screen.getByText('Sem item exclusivo')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Fechar detalhes da conquista' }),
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    const fundo = screen.getByRole('dialog').parentElement!;
    fireEvent.mouseDown(screen.getByRole('dialog'));
    fireEvent.mouseDown(fundo);
    expect(onClose).toHaveBeenCalledTimes(3);

    rerender(
      <AchievementDetailsModal
        conquista={criarConquista({
          valorProgresso: 20,
          proximoTier: null,
          proximoObjetivo: null,
          percentual: 100,
          tiers: [
            criarTier('BRONZE', { desbloqueado: true }),
            criarTier('PRATA', { desbloqueado: true }),
            criarTier('OURO', { desbloqueado: true }),
          ],
        })}
        onClose={onClose}
      />,
    );
    expect(screen.getByText('Primeiros Passos')).toBeInTheDocument();
  });
});
