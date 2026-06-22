import {
  alterarDestaqueConquista,
  buscarDetalheConquista,
  listarConquistasDestacadas,
  listarProgressoConquistas,
} from '../../../../src/features/achievements/achievementService';
import { httpClient } from '../../../../src/shared/api/httpClient';

jest.mock('../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock(
  '../../../../src/features/manage-questions/model/questionService',
  () => ({
    extractErrorMessage: jest.fn(() => 'Erro de conquistas'),
  }),
);

const getMock = jest.mocked(httpClient.get);
const patchMock = jest.mocked(httpClient.patch);

describe('achievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lista o progresso com paginação', async () => {
    const resposta = {
      dados: [],
      metadados: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
    getMock.mockResolvedValueOnce({ data: resposta });

    await expect(
      listarProgressoConquistas({ page: 1, limit: 20 }),
    ).resolves.toEqual(resposta);
    expect(getMock).toHaveBeenCalledWith('/conquistas/meu-progresso', {
      params: { page: 1, limit: 20 },
    });
  });

  it('busca o detalhe de uma conquista', async () => {
    const conquista = { id: 'conquista-1' };
    getMock.mockResolvedValueOnce({ data: conquista });

    await expect(buscarDetalheConquista('conquista-1')).resolves.toEqual(
      conquista,
    );
    expect(getMock).toHaveBeenCalledWith('/conquistas/conquista-1');
  });

  it('lista somente os destaques do aluno', async () => {
    const destaques = [{
      desbloqueioId: 'desbloqueio-1',
      conquistaId: 'conquista-1',
      nome: 'Primeiros passos',
      descricao: 'Acerte questões.',
      tier: 'BRONZE',
      tipoConquista: 'TOTAL_ACERTOS',
      tema: null,
      conquistadoEm: '2026-06-22T00:00:00.000Z',
    }];
    getMock.mockResolvedValueOnce({
      data: { mensagem: 'ok', dados: destaques },
    });

    await expect(listarConquistasDestacadas()).resolves.toEqual(destaques);
    expect(getMock).toHaveBeenCalledWith('/conquistas/destaques');
  });

  it('altera o destaque de um desbloqueio', async () => {
    const resposta = { mensagem: 'Destaque atualizado.' };
    patchMock.mockResolvedValueOnce({ data: resposta });

    await expect(
      alterarDestaqueConquista('desbloqueio-1', true),
    ).resolves.toEqual(resposta);
    expect(patchMock).toHaveBeenCalledWith(
      '/conquistas/desbloqueios/desbloqueio-1/destaque',
      { destaque: true },
    );
  });

  it.each([
    ['listar progresso', () => listarProgressoConquistas()],
    ['buscar detalhe', () => buscarDetalheConquista('conquista-1')],
    ['listar destaques', () => listarConquistasDestacadas()],
  ])('normaliza erro ao %s', async (_nome, executar) => {
    getMock.mockRejectedValueOnce(new Error('falha original'));
    await expect(executar()).rejects.toThrow('Erro de conquistas');
  });

  it('normaliza erro ao alterar um destaque', async () => {
    patchMock.mockRejectedValueOnce(new Error('falha original'));
    await expect(
      alterarDestaqueConquista('desbloqueio-1', false),
    ).rejects.toThrow('Erro de conquistas');
  });
});
