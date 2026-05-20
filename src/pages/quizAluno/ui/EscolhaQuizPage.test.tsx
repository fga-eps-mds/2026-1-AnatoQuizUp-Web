// Previne o erro do import.meta no Jest (deve ser a primeira coisa do arquivo)
jest.mock('@/shared/config/env', () => ({
  env: { VITE_API_URL: 'http://localhost' }
}));

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EscolhaQuizPage } from './EscolhaQuizPage';
import * as randomQuizService from '../../../features/random-quiz/randomQuizService';

jest.mock('../../../features/random-quiz/randomQuizService');

describe('EscolhaQuizPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar e exibir os temas na tela', async () => {
    (randomQuizService.buscarQuantidadeDeQuestoesPorTema as jest.Mock).mockResolvedValue([
      { nome: 'Neuroanatomia', totalQuestoes: 5, porDificuldade: { FACIL: 2, MEDIA: 2, DIFICIL: 1 } }
    ]);

    render(
      <MemoryRouter>
        <EscolhaQuizPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Carregando temas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Escolha seu Quiz')).toBeInTheDocument();
      expect(screen.getByText('Neuroanatomia')).toBeInTheDocument();
    });
  });
});