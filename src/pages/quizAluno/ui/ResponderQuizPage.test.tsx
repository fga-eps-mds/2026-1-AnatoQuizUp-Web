jest.mock('@/shared/config/env', () => ({
  env: { VITE_API_URL: 'http://localhost' }
}));

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResponderQuizPage } from './ResponderQuizPage';
import * as randomQuizService from '../../../features/random-quiz/randomQuizService';

jest.mock('../../../features/random-quiz/randomQuizService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ResponderQuizPage Completo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('deve exibir tela de erro quando não houver questões', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({ dados: [], metadados: { total: 0 } });
    
    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    
    await waitFor(() => expect(screen.getByText('Nenhuma questão encontrada')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Voltar e escolher outro'));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/quiz/escolha');
  });

  it('deve simular o fluxo inteiro: carregar, errar questão, avançar e testar botões', async () => {
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({
      dados: [
        { id: '1', enunciado: 'Q1?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { A: 'Alt A', B: 'Alt B' }, dificuldade: 'FACIL' },
        { id: '2', enunciado: 'Q2?', tipo: 'MULTIPLA_ESCOLHA', alternativas: { C: 'Alt C' }, dificuldade: 'MEDIA' }
      ],
      metadados: { total: 2 }
    });

    render(<MemoryRouter initialEntries={['/aluno/quiz/responder?tema=Neuro&dificuldade=FACIL']}><ResponderQuizPage /></MemoryRouter>);

    expect(screen.getByText('Buscando questões no servidor...')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Q1?')).toBeInTheDocument());

    act(() => { jest.advanceTimersByTime(2000); });
    expect(screen.getByText('00:02')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Alt A'));

    jest.spyOn(console, 'error').mockImplementation(() => {});
    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockRejectedValueOnce(new Error('Erro Rede'));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    await waitFor(() => expect(console.error).toHaveBeenCalled());

    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce({
      correcao: false, saibaMais: 'Errado!', respostaCorreta: 'B'
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    
    await waitFor(() => expect(screen.getByText('Resposta Incorreta!')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Próxima/i }));
    await waitFor(() => expect(screen.getByText('Q2?')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Alt C'));
    (randomQuizService.responderQuestaoQuiz as jest.Mock).mockResolvedValueOnce({ correcao: true, saibaMais: 'Certo!' });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
    
    await waitFor(() => expect(screen.getByText('Resposta Correta!')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Finalizar Quiz/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/quiz/escolha');
  });

  it('deve testar os botões de Abandonar e Reportar, e erros iniciais', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockRejectedValueOnce(new Error('Falha Geral'));
    
    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    await waitFor(() => expect(console.error).toHaveBeenCalled());

    (randomQuizService.buscarQuestoesQuiz as jest.Mock).mockResolvedValue({
      dados: [{ id: '1', enunciado: 'Q1?', tipo: 'CERTO_ERRADO', alternativas: { A: 'A' }, dificuldade: 'FACIL' }],
      metadados: { total: 1 }
    });

    render(<MemoryRouter><ResponderQuizPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Q1?')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Abandonar/i));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/quiz/escolha');
    
    const btnReportar = screen.getByRole('button', { name: /Reportar/i });
    fireEvent.click(btnReportar);
  });
});