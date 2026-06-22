import type { ConquistaDesbloqueada } from '../../../../src/features/achievements';
import { useAchievementStore } from '../../../../src/features/achievements/model/useAchievementStore';

const criarDesbloqueio = (id: string): ConquistaDesbloqueada => ({
  conquistaId: `conquista-${id}`,
  desbloqueioId: `desbloqueio-${id}`,
  nome: `Conquista ${id}`,
  descricao: 'Descrição',
  tier: 'BRONZE',
  tipoConquista: 'TOTAL_ACERTOS',
  temaId: null,
  moedasConcedidas: 10,
  saldoMoedas: 100,
  itemConcedido: null,
});

describe('useAchievementStore', () => {
  beforeEach(() => {
    useAchievementStore.getState().limparFila();
  });

  it('ignora uma lista vazia', () => {
    const estadoAnterior = useAchievementStore.getState();
    estadoAnterior.adicionarDesbloqueios([]);
    expect(useAchievementStore.getState()).toMatchObject({
      conquistaAtual: null,
      filaDesbloqueios: [],
    });
  });

  it('exibe a primeira conquista e enfileira as demais', () => {
    const primeira = criarDesbloqueio('1');
    const segunda = criarDesbloqueio('2');

    useAchievementStore.getState().adicionarDesbloqueios([primeira, segunda]);

    expect(useAchievementStore.getState()).toMatchObject({
      conquistaAtual: primeira,
      filaDesbloqueios: [segunda],
    });
  });

  it('acrescenta novos desbloqueios ao final de uma fila ativa', () => {
    const primeira = criarDesbloqueio('1');
    const segunda = criarDesbloqueio('2');
    const terceira = criarDesbloqueio('3');

    useAchievementStore.getState().adicionarDesbloqueios([primeira, segunda]);
    useAchievementStore.getState().adicionarDesbloqueios([terceira]);

    expect(useAchievementStore.getState().filaDesbloqueios).toEqual([
      segunda,
      terceira,
    ]);
  });

  it('avança até esvaziar a fila', () => {
    const primeira = criarDesbloqueio('1');
    const segunda = criarDesbloqueio('2');
    useAchievementStore.getState().adicionarDesbloqueios([primeira, segunda]);

    useAchievementStore.getState().avancarFila();
    expect(useAchievementStore.getState()).toMatchObject({
      conquistaAtual: segunda,
      filaDesbloqueios: [],
    });

    useAchievementStore.getState().avancarFila();
    expect(useAchievementStore.getState()).toMatchObject({
      conquistaAtual: null,
      filaDesbloqueios: [],
    });
  });
});
