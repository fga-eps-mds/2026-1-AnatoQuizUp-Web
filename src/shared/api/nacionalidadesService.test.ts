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

  return import('./nacionalidadesService');
};

describe('nacionalidadesService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns local nationalities when mocks are enabled', async () => {
    const { listarNacionalidades } = await loadService(true);

    await expect(listarNacionalidades()).resolves.toEqual(['Brasileiro(a)', 'Estrangeiro(a)']);
    expect(getMock).not.toHaveBeenCalled();
  });

  it('loads nationalities from the API when mocks are disabled', async () => {
    const { listarNacionalidades } = await loadService(false);
    const nacionalidades = ['Brasileiro(a)', 'Estrangeiro(a)'];
    getMock.mockResolvedValueOnce({ data: { mensagem: 'ok', dados: nacionalidades } });

    await expect(listarNacionalidades()).resolves.toEqual(nacionalidades);
    expect(getMock).toHaveBeenCalledWith('/auth/alunos/nacionalidades');
  });

  it('does not fall back to local nationalities when API data is empty', async () => {
    const { listarNacionalidades } = await loadService(false);
    getMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await expect(listarNacionalidades()).resolves.toEqual([]);
  });
});
