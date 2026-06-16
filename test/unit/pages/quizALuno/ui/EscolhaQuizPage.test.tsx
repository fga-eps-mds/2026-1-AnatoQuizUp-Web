jest.mock('@/shared/config/env', () => ({
  env: { VITE_API_URL: 'http://localhost' }
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EscolhaQuizPage } from '../../../../../src/pages/quizAluno/ui/EscolhaQuizPage';
import * as randomQuizService from '../../../../../src/features/random-quiz/randomQuizService';

jest.mock('../../../../../src/features/random-quiz/randomQuizService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EscolhaQuizPage Completo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar, interagir com opções e começar quiz', async () => {
    (randomQuizService.buscarQuantidadeDeQuestoesPorTema as jest.Mock).mockResolvedValue([
      { nome: 'Neuroanatomia', totalQuestoes: 5, porDificuldade: { FACIL: 2, MEDIA: 2, DIFICIL: 1 } },
      { nome: 'Abdome Agudo', totalQuestoes: 3, porDificuldade: { FACIL: 1, MEDIA: 1, DIFICIL: 1 } }
    ]);

    render(<MemoryRouter><EscolhaQuizPage /></MemoryRouter>);

    expect(screen.getByText('Carregando temas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Neuroanatomia')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Médio'));

    fireEvent.click(screen.getByText('Abdome Agudo'));

    const btnComecar = screen.getByRole('button', { name: /Começar quiz/i });
    expect(btnComecar).not.toBeDisabled();
    fireEvent.click(btnComecar);
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/quiz/responder?tema=Abdome Agudo&dificuldade=MEDIA');
  });

  it('deve disparar o botão de quiz aleatório', async () => {
    (randomQuizService.buscarQuantidadeDeQuestoesPorTema as jest.Mock).mockResolvedValue([
      { nome: 'Neuroanatomia', totalQuestoes: 5, porDificuldade: { FACIL: 2, MEDIA: 2, DIFICIL: 1 } }
    ]);
    
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    render(<MemoryRouter><EscolhaQuizPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Neuroanatomia')).toBeInTheDocument());

    const btnAleatorio = screen.getByRole('button', { name: /Quiz aleatório/i });
    fireEvent.click(btnAleatorio);

    expect(mockNavigate).toHaveBeenCalled();
    (Math.random as jest.Mock).mockRestore();
  });

  it('deve lidar com erro ao carregar temas do backend', async () => {
    (randomQuizService.buscarQuantidadeDeQuestoesPorTema as jest.Mock).mockRejectedValue(new Error('Erro de Conexão'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<MemoryRouter><EscolhaQuizPage /></MemoryRouter>);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('deve testar o botão de voltar ao painel', async () => {
    (randomQuizService.buscarQuantidadeDeQuestoesPorTema as jest.Mock).mockResolvedValue([]);
    render(<MemoryRouter><EscolhaQuizPage /></MemoryRouter>);
    
    await waitFor(() => {
      expect(screen.getByText('Escolha seu Quiz')).toBeInTheDocument();
    });
    
    const btnVoltar = screen.getByRole('button', { name: /Voltar ao painel/i });
    fireEvent.click(btnVoltar);
    
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/home');
  });
});