// Previne o erro do import.meta no Jest
jest.mock('@/shared/config/env', () => ({
  env: { VITE_API_URL: 'http://localhost' }
}));

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResponderQuizPage } from './ResponderQuizPage';
import * as randomQuizService from '../../../features/random-quiz/randomQuizService';

jest.mock('../../../features/random-quiz/randomQuizService');

describe('ResponderQuizPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar e exibir a questão na tela', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({
      dados: [{
        id: '1',
        enunciado: 'Qual é o maior osso do corpo humano?',
        tipo: 'MULTIPLA_ESCOLHA',
        alternativas: { A: 'Fêmur', B: 'Tíbia' },
        dificuldade: 'FACIL'
      }],
      metadados: { total: 1 }
    });

    render(
      <MemoryRouter initialEntries={['/aluno/quiz/responder?tema=Esqueleto&dificuldade=FACIL']}>
        <ResponderQuizPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Qual é o maior osso do corpo humano?')).toBeInTheDocument();
      expect(screen.getByText('Fêmur')).toBeInTheDocument();
    });
  });
});