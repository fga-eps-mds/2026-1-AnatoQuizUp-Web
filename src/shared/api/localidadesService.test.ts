/// <reference types="jest" />
/// <reference types="node" />

const getMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  getMock.mockReset();

  jest.doMock('../config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  jest.doMock('./httpClient', () => ({
    httpClient: {
      get: getMock,
    },
  }));

  return import('./localidadesService');
};

describe('localidadesService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns local states and cities when mocks are enabled', async () => {
    const { listarCidadesPorUf, listarEstados } = await loadService(true);

    await expect(listarEstados()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ sigla: 'DF' })]),
    );
    await expect(listarCidadesPorUf('df')).resolves.toEqual([{ nome: 'Brasilia', uf: 'DF' }]);
    expect(getMock).not.toHaveBeenCalled();
  });

  it('loads states and cities from the API when mocks are disabled', async () => {
    const { listarCidadesPorUf, listarEstados } = await loadService(false);
    getMock
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: [{ sigla: 'DF', nome: 'Distrito Federal' }] } })
      .mockResolvedValueOnce({ data: { mensagem: 'ok', dados: [{ nome: 'Brasilia', uf: 'DF' }] } });

    await expect(listarEstados()).resolves.toEqual([{ sigla: 'DF', nome: 'Distrito Federal' }]);
    await expect(listarCidadesPorUf('df')).resolves.toEqual([{ nome: 'Brasilia', uf: 'DF' }]);
    expect(getMock).toHaveBeenNthCalledWith(1, '/auth/alunos/localidades/estados');
    expect(getMock).toHaveBeenNthCalledWith(2, '/auth/alunos/localidades/estados/DF/cidades');
  });

  it('does not fall back to local states and cities when API data is empty', async () => {
    const { listarCidadesPorUf, listarEstados } = await loadService(false);
    getMock.mockResolvedValue({ data: { mensagem: 'ok' } });

    await expect(listarEstados()).resolves.toEqual([]);
    await expect(listarCidadesPorUf('df')).resolves.toEqual([]);
    expect(getMock).toHaveBeenCalledTimes(2);
  });
});
