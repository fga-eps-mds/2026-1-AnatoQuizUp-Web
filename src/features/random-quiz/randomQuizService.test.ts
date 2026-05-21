import { buscarQuestoesQuiz, responderQuestaoQuiz, buscarQuantidadeDeQuestoesPorTema } from './randomQuizService';
import { httpClient } from '../../shared/api/httpClient';
import type { ApiQuestionDifficulty, ApiQuestionType, QuestionAlternativeKey } from '../manage-questions';

jest.mock('../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../manage-questions/model/questionService', () => ({
  extractErrorMessage: jest.fn(() => 'Erro simulado pelo mock'),
}));

describe('randomQuizService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarQuestoesQuiz', () => {
    it('deve buscar questões com os parâmetros corretos', async () => {
      const mockData = { dados: [], metadados: { total: 0 } };
      (httpClient.get as jest.Mock).mockResolvedValue({ data: mockData });

      const params = {
        tema: 'neuro',
        dificuldade: 'FACIL' as ApiQuestionDifficulty,
        page: 1,
        limit: 10,
      };

      const result = await buscarQuestoesQuiz(params);

      expect(httpClient.get).toHaveBeenCalledWith('/quiz', { params });
      expect(result).toEqual(mockData);
    });

    it('deve cair no catch e disparar erro ao falhar na busca', async () => {
      (httpClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(buscarQuestoesQuiz()).rejects.toThrow('Erro simulado pelo mock');
    });
  });

  describe('responderQuestaoQuiz', () => {
    it('deve responder questão com sucesso', async () => {
      const mockFeedback = { correcao: true, saibaMais: 'teste' };
      (httpClient.post as jest.Mock).mockResolvedValue({ data: mockFeedback });

      const payload = {
        questaoId: '1',
        tipo: 'MULTIPLA_ESCOLHA' as ApiQuestionType,
        respostaMarcada: 'A' as QuestionAlternativeKey,
      };

      const result = await responderQuestaoQuiz(payload);

      expect(httpClient.post).toHaveBeenCalledWith('/quiz/responder', payload);
      expect(result).toEqual(mockFeedback);
    });

    it('deve cair no catch e disparar erro ao falhar na resposta', async () => {
      const payload = {
        questaoId: '1',
        tipo: 'MULTIPLA_ESCOLHA' as ApiQuestionType,
        respostaMarcada: 'A' as QuestionAlternativeKey,
      };

      (httpClient.post as jest.Mock).mockRejectedValue(new Error('Server Error'));

      await expect(responderQuestaoQuiz(payload)).rejects.toThrow('Erro simulado pelo mock');
    });
  });

  describe('buscarQuantidadeDeQuestoesPorTema', () => {
    it('deve buscar temas com sucesso', async () => {
      const mockTemas = [
        {
          nome: 'Neuro',
          totalQuestoes: 5,
          porDificuldade: {
            FACIL: 0,
            MEDIA: 0,
            DIFICIL: 0,
          },
        },
      ];

      (httpClient.get as jest.Mock).mockResolvedValue({
        data: { quantidadeDeQuestoesPorTema: mockTemas },
      });

      const result = await buscarQuantidadeDeQuestoesPorTema();

      expect(httpClient.get).toHaveBeenCalledWith('/quiz/quantidade_por_tema');
      expect(result).toEqual(mockTemas);
    });

    it('deve cair no catch e disparar erro ao falhar na busca de temas', async () => {
      (httpClient.get as jest.Mock).mockRejectedValue(new Error('API Down'));

      await expect(buscarQuantidadeDeQuestoesPorTema()).rejects.toThrow('Erro simulado pelo mock');
    });
  });
});