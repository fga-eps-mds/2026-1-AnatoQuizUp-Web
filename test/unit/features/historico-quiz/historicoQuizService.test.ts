import { httpClient } from '../../../../src/shared/api/httpClient';
import { buscarHistoricoQuiz } from '../../../../src/features/historico-quiz/historicoQuizService';
import type { HistoricoQuizResponse } from '../../../../src/features/historico-quiz/types';

jest.mock('../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('historicoQuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar histórico do quiz com os parâmetros corretos', async () => {
    const mockResponse: HistoricoQuizResponse = {
      dados: [
        {
          id: '1',
          criadoEm: '2026-05-23T15:00:00.000Z',
          respostaMarcada: 'A',
          questaoId: 'questao-1',
          tentativas: 2,
          distribuicao: {
            A: 2,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
          },
          questao: {
            tema: {
              id: 'tema-1',
              nome: 'Tórax',
            },
            enunciado: 'Questão teste',
            tipoQuestao: 'MULTIPLA_ESCOLHA',
            respostaCorreta: 'A',
            dificuldade: 'FACIL',
            saibaMais: 'Explicação teste',
            alternativas: {
              alternativaA: 'Alternativa A',
              alternativaB: 'Alternativa B',
              alternativaC: 'Alternativa C',
              alternativaD: 'Alternativa D',
              alternativaE: 'Alternativa E',
            },
          },
        },
      ],
      metadados: {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      },
    };

    const params = {
      page: 1,
      limit: 50,
      tema: 'Tórax',
      dificuldade: 'FACIL',
    };

    (httpClient.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await buscarHistoricoQuiz(params);

    expect(httpClient.get).toHaveBeenCalledWith('/quiz/historico', { params });
    expect(result).toEqual(mockResponse);
  });

  it('deve propagar erro quando a busca do histórico falhar', async () => {
    const params = {
      page: 1,
      limit: 50,
    };

    const error = new Error('Erro ao buscar histórico');

    (httpClient.get as jest.Mock).mockRejectedValue(error);

    await expect(buscarHistoricoQuiz(params)).rejects.toThrow('Erro ao buscar histórico');
  });
});