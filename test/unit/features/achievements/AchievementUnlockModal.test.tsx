import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { ConquistaDesbloqueada } from '../../../../src/features/achievements';
import { useAchievementStore } from '../../../../src/features/achievements/model/useAchievementStore';
import { AchievementUnlockModal } from '../../../../src/features/achievements/ui/AchievementUnlockModal';
import { useStudentCoinsStore } from '../../../../src/features/student-coins/model/useStudentCoinsStore';

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

const criarConquista = (
  id: string,
  itemConcedido: ConquistaDesbloqueada['itemConcedido'] = null,
): ConquistaDesbloqueada => ({
  conquistaId: `conquista-${id}`,
  desbloqueioId: `desbloqueio-${id}`,
  nome: `Conquista ${id}`,
  descricao: 'Você atingiu um novo marco.',
  tier: 'BRONZE',
  tipoConquista: 'TOTAL_ACERTOS',
  temaId: null,
  moedasConcedidas: 25,
  saldoMoedas: 150,
  itemConcedido,
});

describe('AchievementUnlockModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useAchievementStore.getState().limparFila();
    useStudentCoinsStore.getState().reset();
  });

  it('não renderiza sem conquista ativa', () => {
    const { container } = render(<AchievementUnlockModal />);
    expect(container).toBeEmptyDOMElement();
  });

  it('exibe a conquista, atualiza o saldo e continua a fila', async () => {
    const user = userEvent.setup();
    localStorage.setItem('achievement_sound_enabled', 'false');
    useAchievementStore.getState().adicionarDesbloqueios([
      criarConquista('1'),
      criarConquista('2'),
      criarConquista('3'),
    ]);

    render(<AchievementUnlockModal />);

    expect(
      screen.getByRole('dialog', {
        name: 'Nova conquista desbloqueada!',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Mais 2 conquistas aguardando')).toBeInTheDocument();
    expect(useStudentCoinsStore.getState().saldoMoedas).toBe(150);

    await user.click(
      screen.getByRole('button', { name: 'Continuar estudando' }),
    );
    expect(screen.getByText('Conquista 2')).toBeInTheDocument();
    expect(screen.getByText('Mais 1 conquista aguardando')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Fechar notificação de conquista',
      }),
    );
    expect(screen.getByText('Conquista 3')).toBeInTheDocument();
  });

  it('navega para o detalhe da conquista e avança a fila', async () => {
    const user = userEvent.setup();
    localStorage.setItem('achievement_sound_enabled', 'false');
    useAchievementStore
      .getState()
      .adicionarDesbloqueios([criarConquista('detalhe')]);
    render(<AchievementUnlockModal />);

    await user.click(screen.getByRole('button', { name: /Ver conquista/i }));

    expect(navigateMock).toHaveBeenCalledWith('/aluno/conquistas', {
      state: { abrirConquistaId: 'conquista-detalhe' },
    });
    expect(
      screen.queryByRole('dialog', {
        name: 'Nova conquista desbloqueada!',
      }),
    ).not.toBeInTheDocument();
  });

  it('alterna e persiste a preferência de som', async () => {
    const user = userEvent.setup();
    localStorage.setItem('achievement_sound_enabled', 'false');
    useAchievementStore.getState().adicionarDesbloqueios([criarConquista('1')]);
    render(<AchievementUnlockModal />);

    await user.click(screen.getByRole('button', { name: 'Ativar som' }));
    expect(localStorage.getItem('achievement_sound_enabled')).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Desativar som' }),
    ).toBeInTheDocument();
  });

  it('reproduz som quando disponível e tolera falha da API de áudio', () => {
    const close = jest.fn().mockResolvedValue(undefined);
    const oscillator = {
      type: '',
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };
    const gain = {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };
    const AudioContextMock = jest.fn(() => ({
      currentTime: 0,
      destination: {},
      createOscillator: () => oscillator,
      createGain: () => gain,
      close,
    }));
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: AudioContextMock,
    });

    useAchievementStore.getState().adicionarDesbloqueios([
      criarConquista('som', {
        id: 'item-1',
        codigo: 'avatar',
        nome: 'Avatar',
        descricao: null,
        tipo: 'AVATAR',
        valor: null,
        imagemUrl: null,
        previewImagemUrl: null,
      }),
    ]);
    const { unmount } = render(<AchievementUnlockModal />);

    expect(AudioContextMock).toHaveBeenCalled();
    expect(oscillator.start).toHaveBeenCalledTimes(3);
    unmount();

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: jest.fn(() => {
        throw new Error('áudio indisponível');
      }),
    });
    useAchievementStore.getState().limparFila();
    useAchievementStore.getState().adicionarDesbloqueios([criarConquista('falha')]);
    expect(() => render(<AchievementUnlockModal />)).not.toThrow();
  });
});
