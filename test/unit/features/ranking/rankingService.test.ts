import { httpClient } from '../../../../src/shared/api/httpClient';
import {
  obterListasDaTurma,
  obterRankingAmigos,
  obterRankingGeral,
  obterRankingLista,
  obterRankingTurma,
} from '../../../../src/features/ranking/rankingService';

jest.mock('../../../../src/shared/api/httpClient', () => ({
  httpClient: { get: jest.fn() },
}));

jest.mock('../../../../src/features/manage-questions/model/questionService', () => ({
  extractErrorMessage: jest.fn(() => 'Erro simulado pelo mock'),
}));

const get = httpClient.get as jest.Mock;

describe('rankingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('obterRankingGeral sem limite nao envia params', async () => {
    get.mockResolvedValue({ data: { dados: [], usuarioAtual: null, totalParticipantes: 0 } });

    const resultado = await obterRankingGeral();

    expect(get).toHaveBeenCalledWith('/ranking/geral', { params: undefined });
    expect(resultado.totalParticipantes).toBe(0);
  });

  test('obterRankingGeral com limite envia params', async () => {
    get.mockResolvedValue({ data: { dados: [], usuarioAtual: null, totalParticipantes: 0 } });

    await obterRankingGeral(50);

    expect(get).toHaveBeenCalledWith('/ranking/geral', { params: { limite: 50 } });
  });

  test('obterRankingAmigos chama o endpoint correto', async () => {
    get.mockResolvedValue({ data: { dados: [], usuarioAtual: null, totalParticipantes: 0 } });

    await obterRankingAmigos();

    expect(get).toHaveBeenCalledWith('/ranking/amigos');
  });

  test('obterRankingTurma usa o id da turma', async () => {
    get.mockResolvedValue({ data: { turmaId: 't1', totalAlunos: 0, dados: [] } });

    await obterRankingTurma('t1');

    expect(get).toHaveBeenCalledWith('/ranking/turmas/t1');
  });

  test('obterRankingLista usa turma e lista', async () => {
    get.mockResolvedValue({
      data: { turmaId: 't1', listaTurmaId: 'l1', nomeLista: 'L', totalQuestoes: 0, dados: [] },
    });

    await obterRankingLista('t1', 'l1');

    expect(get).toHaveBeenCalledWith('/ranking/listas/t1/l1');
  });

  test('obterListasDaTurma mapeia apenas id e nome da lista', async () => {
    get.mockResolvedValue({
      data: [{ listaTurmaId: 'lt1', nomeLista: 'Lista A', totalAlunos: 5 }],
    });

    const resultado = await obterListasDaTurma('t1');

    expect(get).toHaveBeenCalledWith('/turmasDashboard/t1/listas');
    expect(resultado).toEqual([{ listaTurmaId: 'lt1', nomeLista: 'Lista A' }]);
  });

  test('propaga mensagem de erro em todas as funcoes', async () => {
    get.mockRejectedValue(new Error('falha'));

    await expect(obterRankingGeral()).rejects.toThrow('Erro simulado pelo mock');
    await expect(obterRankingAmigos()).rejects.toThrow('Erro simulado pelo mock');
    await expect(obterRankingTurma('t')).rejects.toThrow('Erro simulado pelo mock');
    await expect(obterRankingLista('t', 'l')).rejects.toThrow('Erro simulado pelo mock');
    await expect(obterListasDaTurma('t')).rejects.toThrow('Erro simulado pelo mock');
  });
});
