jest.mock('../../../shared/config/env', () => ({
  API_BASE_URL: 'http://localhost:4000/api/v1',
  USE_MOCKS: false,
}));

import { httpClient } from '../../../shared/api/httpClient';
import { listarListas, excluirLista } from './listaApi';

jest.mock('../../../shared/api/httpClient');
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('listaApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarListas', () => {
    it('deve buscar e normalizar as listas corretamente', async () => {
      const mockRetornoApi = {
        data: {
          mensagem: 'Listas recuperadas com sucesso.',
          dados: [
            {
              id: '1',
              nome: 'Lista Teste',
              quantidadeQuestoes: 10,
              status: 'PUBLICADA' as const,
              turmas: [{ id: 't1', nome: 'Turma A' }],
              criadoEm: '2026-05-22T19:57:18.617Z',
              atualizadoEm: '2026-05-22T19:57:18.617Z',
            },
          ],
        },
      };

      mockedHttpClient.get.mockResolvedValueOnce(mockRetornoApi);

      const resultado = await listarListas({ status: 'PUBLICADA' });

      expect(mockedHttpClient.get).toHaveBeenCalledWith('/lista', {
        params: { status: 'PUBLICADA' },
      });

      expect(resultado).toEqual([
        {
          id: '1',
          nome: 'Lista Teste',
          quantidadeQuestoes: 10,
          status: 'PUBLICADA',
          turmas: [{ id: 't1', nome: 'Turma A' }],
          criadoEm: new Date('2026-05-22T19:57:18.617Z').toLocaleDateString('pt-BR'),
        },
      ]);
    });
  });

  describe('excluirLista', () => {
    it('deve chamar o endpoint de delete com o id correto', async () => {
      mockedHttpClient.delete.mockResolvedValueOnce({});

      await excluirLista('123');

      expect(mockedHttpClient.delete).toHaveBeenCalledWith('/lista/123');
    });
  });
});