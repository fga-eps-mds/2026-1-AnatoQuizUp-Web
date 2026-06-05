import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalGerenciarQuestoesLista } from './ModalGerenciarQuestoesLista';

import * as listaApi from '../../entities/lista/api/listaApi';
import * as questionService from '../manage-questions/model/questionService';
import type { ListaQuestao } from '../../entities/lista/model/types';
import type { ProfessorQuestion } from '../manage-questions/model/types';

jest.mock('../../entities/lista/api/listaApi', () => ({
  buscarLista: jest.fn(),
  vincularQuestoesLista: jest.fn(),
  desvincularQuestaoLista: jest.fn(),
  reordenarQuestoesLista: jest.fn()
}));

jest.mock('../manage-questions/model/questionService', () => ({
  listProfessorQuestions: jest.fn()
}));

jest.mock('../../shared/config/env', () => ({ apiBaseUrlFromEnv: 'http://localhost:3000', env: { VITE_API_URL: 'http://localhost:3000' } }));

const mockedBuscarLista = jest.mocked(listaApi.buscarLista);
const mockedVincular = jest.mocked(listaApi.vincularQuestoesLista);
const mockedDesvincular = jest.mocked(listaApi.desvincularQuestaoLista);
const mockedReordenar = jest.mocked(listaApi.reordenarQuestoesLista);
const mockedListQuestions = jest.mocked(questionService.listProfessorQuestions);

describe('ModalGerenciarQuestoesLista', () => {
  const mockOnClose = jest.fn();
  const mockOnAfterChange = jest.fn();
  const mockOnFeedback = jest.fn();

  const mockListaBase: ListaQuestao = {
    id: 'lista-1', nome: 'Lista Base', quantidadeQuestoes: 2, status: 'RASCUNHO', turmas: [], criadoEm: '',
    questoes: [
      { id: 'q1', enunciado: 'Q1', tema: 'Ossos', tipo: 'MULTIPLA_ESCOLHA', dificuldade: 'FACIL', ordem: 1 },
      { id: 'q2', enunciado: 'Q2', tema: 'Músculos', tipo: 'VERDADEIRO_FALSO', dificuldade: 'MEDIO', ordem: 2 }
    ]
  };

  const mockBancoQuestoes: ProfessorQuestion[] = [
    { id: 'q1', statement: 'Q1', topic: 'Ossos', type: 'MULTIPLA_ESCOLHA', difficulty: 'FACIL', createdAt: '' }, 
    { id: 'q3', statement: 'Q3 Inédita', topic: 'Nervos', type: 'CERTO_ERRADO', difficulty: 'DIFICIL', createdAt: '' },
    { id: 'q4', statement: 'Q4 Inédita', topic: 'Articulações', type: 'Multipla Escolha', difficulty: 'FACIL', createdAt: '' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedBuscarLista.mockResolvedValue(mockListaBase);
    mockedListQuestions.mockResolvedValue(mockBancoQuestoes);
  });

  const renderComponent = (isOpen = true, lista: ListaQuestao | null = mockListaBase) => {
    return render(<ModalGerenciarQuestoesLista isOpen={isOpen} lista={lista} onClose={mockOnClose} onAfterChange={mockOnAfterChange} onFeedback={mockOnFeedback} />);
  };

  it('não deve renderizar se fechado ou sem lista', () => {
    const { container } = render(<ModalGerenciarQuestoesLista isOpen={false} lista={mockListaBase} onClose={mockOnClose} onAfterChange={mockOnAfterChange} onFeedback={mockOnFeedback} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve vincular e desvincular questoes com sucesso', async () => {
    mockedVincular.mockResolvedValueOnce(mockListaBase);
    mockedDesvincular.mockResolvedValueOnce(mockListaBase);

    renderComponent();
    await waitFor(() => expect(screen.getByText('Q3 Inédita')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Adicionar')[0]);
    await waitFor(() => expect(mockedVincular).toHaveBeenCalledWith('lista-1', ['q3']));
    expect(mockOnFeedback).toHaveBeenCalledWith('Questao vinculada com sucesso.', 'success');

    fireEvent.click(screen.getAllByLabelText('Remover questao')[0]);
    await waitFor(() => expect(mockedDesvincular).toHaveBeenCalledWith('lista-1', 'q1'));
    expect(mockOnFeedback).toHaveBeenCalledWith('Questao removida da lista.', 'success');
  });

  it('deve reordenar questoes respeitando limites', async () => {
    mockedReordenar.mockResolvedValue(mockListaBase);
    renderComponent();
    await waitFor(() => expect(screen.getByText('1. Q1')).toBeInTheDocument());

    const btnsUp = screen.getAllByLabelText('Mover questao para cima');
    const btnsDown = screen.getAllByLabelText('Mover questao para baixo');

    expect(btnsUp[0]).toBeDisabled();
    expect(btnsDown[1]).toBeDisabled();

    fireEvent.click(btnsUp[1]);
    await waitFor(() => expect(mockedReordenar).toHaveBeenCalledWith('lista-1', ['q2', 'q1']));
    
    fireEvent.click(btnsDown[0]);
    await waitFor(() => expect(mockedReordenar).toHaveBeenCalledWith('lista-1', ['q2', 'q1']));
  });

  it('deve fechar modal clicando no botao', async () => {
    renderComponent();
    fireEvent.click(screen.getByLabelText('Fechar modal de questoes'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // TESTES SEPARADOS PARA OS ERROS (Catch Blocks)
  it('deve exibir erro se falhar no carregamento inicial', async () => {
    mockedBuscarLista.mockRejectedValueOnce(new Error('Falha'));
    renderComponent();
    await waitFor(() => expect(mockOnFeedback).toHaveBeenCalledWith('Não foi possivel carregar as questoes da lista.', 'error'));
  });

  it('deve exibir erro se falhar ao vincular questao', async () => {
    mockedVincular.mockRejectedValueOnce(new Error('Falha'));
    renderComponent();
    
    await waitFor(() => expect(screen.getByText('Q3 Inédita')).toBeInTheDocument());
    
    fireEvent.click(screen.getAllByText('Adicionar')[0]);
    await waitFor(() => expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel vincular a questao.', 'error'));
  });

  it('deve exibir erro se falhar ao desvincular questao', async () => {
    mockedDesvincular.mockRejectedValueOnce(new Error('Falha'));
    renderComponent();
    
    await waitFor(() => expect(screen.getByText('1. Q1')).toBeInTheDocument());
    
    fireEvent.click(screen.getAllByLabelText('Remover questao')[0]);
    await waitFor(() => expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel remover a questao.', 'error'));
  });

  it('deve exibir erro se falhar ao reordenar questao', async () => {
    mockedReordenar.mockRejectedValueOnce(new Error('Falha'));
    renderComponent();
    
    await waitFor(() => expect(screen.getByText('1. Q1')).toBeInTheDocument());
    
    fireEvent.click(screen.getAllByLabelText('Mover questao para cima')[1]);
    await waitFor(() => expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel reordenar as questoes.', 'error'));
  });
});