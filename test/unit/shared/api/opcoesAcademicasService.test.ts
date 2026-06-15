/// <reference types="jest" />
/// <reference types="node" />

const getMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  getMock.mockReset();

  jest.doMock('../../../../src/shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  jest.doMock('../../../../src/shared/api/httpClient', () => ({
    httpClient: {
      get: getMock,
    },
  }));

  return import('../../../../src/shared/api/opcoesAcademicasService');
};

describe('opcoesAcademicasService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns local academic options when mocks are enabled', async () => {
    const { listarOpcoesAcademicas } = await loadService(true);

    await expect(listarOpcoesAcademicas()).resolves.toEqual(
      expect.objectContaining({
        escolaridades: expect.arrayContaining(['Graduação']),
        instituicoes: expect.arrayContaining(['Universidade de Brasilia']),
        cursos: expect.arrayContaining(['Medicina']),
        periodos: expect.arrayContaining(['1o Periodo']),
      }),
    );
    expect(getMock).not.toHaveBeenCalled();
  });

  it('loads academic options from the API when mocks are disabled', async () => {
    const { listarOpcoesAcademicas } = await loadService(false);
    const opcoes = {
      escolaridades: ['Graduação'],
      instituicoes: ['Universidade de Brasilia'],
      cursos: ['Medicina'],
      periodos: ['1o Periodo'],
      naoSeAplica: 'Não se aplica',
    };
    getMock.mockResolvedValueOnce({ data: { mensagem: 'ok', dados: opcoes } });

    await expect(listarOpcoesAcademicas()).resolves.toEqual(opcoes);
    expect(getMock).toHaveBeenCalledWith('/autenticacao/alunos/opcoes-academicas');
  });

  it('does not fall back to local academic options when API data is empty', async () => {
    const { listarOpcoesAcademicas } = await loadService(false);
    getMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await expect(listarOpcoesAcademicas()).resolves.toEqual({
      escolaridades: [],
      instituicoes: [],
      cursos: [],
      periodos: [],
      naoSeAplica: '',
    });
  });
  it('normalizes malformed academic options (non-arrays and nulls) to empty default values', async () => {
    const { listarOpcoesAcademicas } = await loadService(false);
    
    const malformedDados = {
      escolaridades: null, 
      instituicoes: 'apenas-uma-string',
      cursos: { tipo: 'objeto-aleatorio' }, 
      periodos: undefined, 
      naoSeAplica: null, 
    };
    
    getMock.mockResolvedValueOnce({ data: { mensagem: 'ok', dados: malformedDados } });

    await expect(listarOpcoesAcademicas()).resolves.toEqual({
      escolaridades: [],
      instituicoes: [],
      cursos: [],
      periodos: [],
      naoSeAplica: '',
    });
  });

  it('throws an error if the API request fails', async () => {
    const { listarOpcoesAcademicas } = await loadService(false);
    getMock.mockRejectedValueOnce(new Error('Erro de conexão com a API'));

    await expect(listarOpcoesAcademicas()).rejects.toThrow('Erro de conexão com a API');
  });
});
