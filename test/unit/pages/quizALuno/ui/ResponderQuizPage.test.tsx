jest.mock('@/shared/config/env', () => ({
  env: { VITE_API_URL: 'http://localhost' }
}));

import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResponderQuizPage } from '../../../../../src/pages/quizAluno/ui/ResponderQuizPage';
import * as randomQuizService from '../../../../../src/features/random-quiz/randomQuizService';
import { useStudentCoinsStore } from '../../../../../src/features/student-coins/model/useStudentCoinsStore';

jest.mock('../../../../../src/features/random-quiz/randomQuizService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const feedback = (
  overrides: Partial<{
    correcao: boolean;
    saibaMais: string | null;
    respostaCorreta: 'A' | 'B' | 'C' | 'D' | 'E';
    moedasConcedidas: number;
    saldoMoedas: number;
    moedasJaConcedidas: boolean;
  }> = {},
) => ({
  correcao: true,
  saibaMais: 'Certo!',
  respostaCorreta: 'A' as const,
  moedasConcedidas: 10,
  saldoMoedas: 10,
  moedasJaConcedidas: false,
  ...overrides,
});

describe('ResponderQuizPage - Treino Infinito', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStudentCoinsStore.getState().reset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    cleanup();
  });

  it('deve exibir tela de erro quando não houver questões', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({ dados: [], metadados: { total: 0 } });
    
    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Nenhuma questão encontrada')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Voltar e escolher outro'));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/quiz/escolha');
  });

  it('deve calcular taxa de acerto e testar loop infinito', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock)
      .mockResolvedValueOnce({
        dados: [{ id: '1', enunciado: 'Q1?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { A: 'Alt A', B: 'Alt B' }, dificuldade: 'FACIL' }],
        metadados: { total: 1 }
      })
      .mockResolvedValueOnce({
        dados: [], metadados: { total: 0 }
      })
      .mockResolvedValueOnce({
        dados: [{ id: '2', enunciado: 'QRepetida?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { C: 'Alt C' }, dificuldade: 'MEDIA' }],
        metadados: { total: 1 }
      });

    render(<MemoryRouter initialEntries={['/aluno/quiz/responder?tema=Neuro&dificuldade=FACIL']}><ResponderQuizPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Q1?')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Alt B'));
    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce(feedback({
      correcao: false,
      saibaMais: 'Errado!',
      respostaCorreta: 'A',
      moedasConcedidas: 0,
      saldoMoedas: 0,
    }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    
    await waitFor(() => expect(screen.getByRole('button', { name: /Próxima/i })).toBeInTheDocument());
    expect(screen.getByText('0%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próxima/i }));
    
    await waitFor(() => expect(screen.getByText('QRepetida?')).toBeInTheDocument()); 
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Alt C'));
    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce(feedback({
      respostaCorreta: 'C',
      moedasConcedidas: 25,
      saldoMoedas: 25,
    }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    
    await waitFor(() => expect(screen.getByRole('button', { name: /Próxima/i })).toBeInTheDocument());
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('deve exibir ganho de ATP e atualizar saldo global ao acertar', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({
      dados: [{ id: '1', enunciado: 'Q ATP?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { A: 'Alt A' }, dificuldade: 'FACIL' }],
      metadados: { total: 1 },
    });
    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce(feedback({
      respostaCorreta: 'A',
      moedasConcedidas: 10,
      saldoMoedas: 40,
    }));

    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Q ATP?')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Alt A'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() => expect(screen.getByText('+10 ATP')).toBeInTheDocument());
    expect(useStudentCoinsStore.getState().saldoMoedas).toBe(40);
  });

  it('nao deve exibir ganho de ATP quando acerto nao concede recompensa', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({
      dados: [{ id: '1', enunciado: 'Q sem ATP?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { A: 'Alt A' }, dificuldade: 'FACIL' }],
      metadados: { total: 1 },
    });
    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce(feedback({
      respostaCorreta: 'A',
      moedasConcedidas: 0,
      saldoMoedas: 40,
      moedasJaConcedidas: true,
    }));

    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText('Q sem ATP?')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Alt A'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() => expect(screen.getByText('Resposta Correta!')).toBeInTheDocument());
    expect(screen.queryByText(/\+0 ATP/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+\d+ ATP/i)).not.toBeInTheDocument();
  });

  it('deve disparar erro inicial no useEffect', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockRejectedValueOnce(new Error('Falha Geral'));
    
    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    
    (console.error as jest.Mock).mockRestore();
  });

  it('deve testar os botões de Encerrar Treino, Reportar e Pausar', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({
      dados: [{ id: '1', enunciado: 'Q2?', tipo: 'CERTO_ERRADO', alternativas: { A: 'A' }, dificuldade: 'FACIL' }],
      metadados: { total: 1 }
    });

    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Q2?')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Encerrar Treino/i));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/quiz/escolha');
    
    fireEvent.click(screen.getByText(/Reportar/i));

    const botoes = screen.getAllByRole('button');
    const pauseBtn = botoes.find(b => b.className.includes('text-[#14D5C2]'));
    if (pauseBtn) {
        fireEvent.click(pauseBtn);
        await waitFor(() => expect(screen.getByText('Treino Pausado')).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Retomar Treino/i));
    }
  });

  it('deve cobrir o catch da paginação ao clicar em próxima', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValueOnce({
      dados: [{ id: '1', enunciado: 'Q3?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { A: 'A' }, dificuldade: 'FACIL' }],
    });
    
    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Q3?')).toBeInTheDocument());
    
const botaoAlternativa = screen.getAllByRole('button').find(btn => btn.textContent?.includes('A'));
    if (botaoAlternativa) {
        fireEvent.click(botaoAlternativa);
    }

    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce(feedback({ respostaCorreta: 'A' }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Próxima/i })).toBeInTheDocument());

    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockRejectedValueOnce(new Error('Erro backend'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fireEvent.click(screen.getByRole('button', { name: /Próxima/i }));
    await waitFor(() => expect(console.error).toHaveBeenCalled());
    
    (console.error as jest.Mock).mockRestore();
  });
});
