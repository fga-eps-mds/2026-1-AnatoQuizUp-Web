import { buscarDashboardMacro } from './dashboardTurmaApi';
import { httpClient } from '../../../shared/api/httpClient';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('dashboardTurmaApi', () => {
  it('deve chamar a API e retornar os dados do macro dashboard', async () => {
    const mockData = { totalAlunos: 10, totalQuestoesRespondidas: 5, taxaMediaAcertos: 50, desempenhoPorTema: [] };
    
    (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await buscarDashboardMacro('turma-123');

    expect(httpClient.get).toHaveBeenCalledWith('/turmasDashboard/turma-123/macro');
    expect(result).toEqual(mockData);
  });
});