import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { alterarDestaqueConquista } from '../../../../src/features/achievements/achievementService';
import type {
  ProgressoConquista,
  TierProgressoConquista,
} from '../../../../src/features/achievements/types';
import { AchievementHighlightsModal } from '../../../../src/features/achievements/ui/AchievementHighlightsModal';

jest.mock('../../../../src/features/achievements/achievementService', () => ({
  alterarDestaqueConquista: jest.fn(),
}));

const alterarDestaqueMock = jest.mocked(alterarDestaqueConquista);

const criarTier = (
  desbloqueioId: string,
  destaque = false,
): TierProgressoConquista => ({
  tier: 'BRONZE',
  objetivo: 5,
  desbloqueado: true,
  desbloqueioId,
  destaque,
  conquistadoEm: '2026-06-20T12:00:00.000Z',
  moedas: 10,
  item: null,
});

const criarConquista = (
  indice: number,
  destaque = false,
): ProgressoConquista => ({
  id: `conquista-${indice}`,
  nome: `Conquista ${indice}`,
  descricao: 'Descrição',
  tipoConquista: indice % 2 === 0 ? 'TOTAL_ACERTOS' : 'STREAK_ACERTOS',
  tema: null,
  valorProgresso: 5,
  proximoTier: 'PRATA',
  proximoObjetivo: 10,
  percentual: 50,
  tiers: [criarTier(`desbloqueio-${indice}`, destaque)],
});

describe('AchievementHighlightsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alterarDestaqueMock.mockResolvedValue({ mensagem: 'ok' });
  });

  it('exibe estado vazio e fecha pelo botão, Escape e fundo', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <AchievementHighlightsModal
        conquistas={[]}
        onClose={onClose}
        onSaved={jest.fn()}
      />,
    );

    expect(screen.getByText('Nenhuma conquista desbloqueada')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: 'Fechar gerenciamento de destaques',
      }),
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    const fundo = screen.getByRole('dialog').parentElement!;
    fireEvent.mouseDown(fundo);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('limita a seleção a três conquistas', async () => {
    const user = userEvent.setup();
    render(
      <AchievementHighlightsModal
        conquistas={[
          criarConquista(1),
          criarConquista(2),
          criarConquista(3),
          criarConquista(4),
        ]}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Conquista 1/i }));
    await user.click(screen.getByRole('button', { name: /Conquista 2/i }));
    await user.click(screen.getByRole('button', { name: /Conquista 3/i }));

    expect(screen.getByText('3 de 3 conquistas selecionadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conquista 4/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /Conquista 1/i }));
    expect(screen.getByText('2 de 3 conquistas selecionadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Conquista 4/i })).toBeEnabled();
  });

  it('persiste inclusões e remoções e devolve a seleção final', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();
    render(
      <AchievementHighlightsModal
        conquistas={[criarConquista(1, true), criarConquista(2)]}
        onClose={jest.fn()}
        onSaved={onSaved}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Conquista 1/i }));
    await user.click(screen.getByRole('button', { name: /Conquista 2/i }));
    await user.click(screen.getByRole('button', { name: 'Salvar destaques' }));

    await waitFor(() => {
      expect(alterarDestaqueMock).toHaveBeenNthCalledWith(
        1,
        'desbloqueio-1',
        false,
      );
      expect(alterarDestaqueMock).toHaveBeenNthCalledWith(
        2,
        'desbloqueio-2',
        true,
      );
    });
    expect(onSaved).toHaveBeenCalledWith(new Set(['desbloqueio-2']));
  });

  it('mostra o erro conhecido sem fechar o modal', async () => {
    const user = userEvent.setup();
    alterarDestaqueMock.mockRejectedValueOnce(new Error('Falha ao destacar'));
    render(
      <AchievementHighlightsModal
        conquistas={[criarConquista(1)]}
        onClose={jest.fn()}
        onSaved={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Conquista 1/i }));
    await user.click(screen.getByRole('button', { name: 'Salvar destaques' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao destacar',
    );
  });

  it('usa mensagem padrão para falhas não tipadas e bloqueia fechamento ao salvar', async () => {
    const user = userEvent.setup();
    let rejeitar!: (motivo: unknown) => void;
    alterarDestaqueMock.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejeitar = reject;
      }),
    );
    const onClose = jest.fn();
    render(
      <AchievementHighlightsModal
        conquistas={[criarConquista(1)]}
        onClose={onClose}
        onSaved={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Conquista 1/i }));
    await user.click(screen.getByRole('button', { name: 'Salvar destaques' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!);
    expect(onClose).not.toHaveBeenCalled();

    rejeitar('falha');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar as conquistas em destaque.',
    );
  });
});
