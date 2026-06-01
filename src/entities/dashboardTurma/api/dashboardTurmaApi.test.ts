import { buscarDashboardMacro, buscarDesempenhoIndividual } from './dashboardTurmaApi';
import { httpClient } from '../../../shared/api/httpClient';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('dashboardTurmaApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar a API e retornar os dados do macro dashboard', async () => {
    const mockData = { totalAlunos: 10, totalQuestoesRespondidas: 5, taxaMediaAcertos: 50, desempenhoPorTema: [] };

    (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await buscarDashboardMacro('turma-123');

    expect(httpClient.get).toHaveBeenCalledWith('/turmasDashboard/turma-123/macro');
    expect(result).toEqual(mockData);
  });

  describe('buscarDesempenhoIndividual', () => {
    it('deve fazer GET para /turmasDashboard/:id/individual e retornar os dados', async () => {
      const mockData = {
        alunos: [
          {
            alunoId: 'aluno-1',
            totalRespondidas: 10,
            totalAcertos: 8,
            taxaAcerto: 80,
            ultimaAtividade: '2026-05-30T10:00:00.000Z',
            desempenhoPorTema: [],
          },
        ],
      };

      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const result = await buscarDesempenhoIndividual('turma-123');

      expect(httpClient.get).toHaveBeenCalledWith('/turmasDashboard/turma-123/individual');
      expect(result).toEqual(mockData);
    });

    it('deve retornar lista vazia de alunos quando não há dados', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({ data: { alunos: [] } });

      const result = await buscarDesempenhoIndividual('turma-456');

      expect(httpClient.get).toHaveBeenCalledWith('/turmasDashboard/turma-456/individual');
      expect(result.alunos).toHaveLength(0);
    });
  });
});