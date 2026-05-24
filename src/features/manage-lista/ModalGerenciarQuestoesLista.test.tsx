import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalGerenciarQuestoesLista } from './ModalGerenciarQuestoesLista';

jest.mock('../../shared/config/env', () => ({
  apiBaseUrlFromEnv: 'http://localhost:3000',
  env: { VITE_API_URL: 'http://localhost:3000' }
}));

import * as listaApi from '../../entities/lista/api/listaApi';
import * as questionService from '../manage-questions/model/questionService';
import type { ListaQuestao } from '../../entities/lista/model/types';
import type { ProfessorQuestion } from '../manage-questions/model/types';

jest.mock('../../entities/lista/api/listaApi');
jest.mock('../manage-questions/model/questionService');

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
    id: 'lista-1',
    nome: 'Simulado Anato',
    quantidadeQuestoes: 1,
    status: 'PUBLICADA',
    turmas: [],
    criadoEm: '2026-05-20',
    questoes: [
      {
        id: 'q1',
        enunciado: 'Questao ja vinculada',
        tema: 'Ossos',
        tipo: 'MULTIPLA_ESCOLHA',
        dificuldade: 'FACIL',
        ordem: 1,
      },
    ],
  };

  const mockBancoQuestoes: ProfessorQuestion[] = [
    {
      id: 'q1', 
      statement: 'Questao ja vinculada',
      topic: 'Ossos',
      type: 'MULTIPLA_ESCOLHA',
      difficulty: 'FACIL',
      createdAt: '2026-05-20',
    },
    {
      id: 'q2', 
      statement: 'Questao disponivel sobre musculos',
      topic: 'Musculos',
      type: 'VERDADEIRO_FALSO',
      difficulty: 'MEDIO',
      createdAt: '2026-05-20',
    },
    {
      id: 'q3', 
      statement: 'Outra questao disponivel',
      topic: 'Nervos',
      type: 'MULTIPLA_ESCOLHA',
      difficulty: 'DIFICIL',
      createdAt: '2026-05-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedBuscarLista.mockResolvedValue(mockListaBase);
    mockedListQuestions.mockResolvedValue(mockBancoQuestoes);
  });

  const renderComponent = (isOpen = true, lista: ListaQuestao | null = mockListaBase) => {
    return render(
      <ModalGerenciarQuestoesLista
        isOpen={isOpen}
        lista={lista}
        onClose={mockOnClose}
        onAfterChange={mockOnAfterChange}
        onFeedback={mockOnFeedback}
      />
    );
  };

  it('não deve renderizar se isOpen for falso ou lista for nula', () => {
    const { container } = renderComponent(false);
    expect(container.firstChild).toBeNull();

    const { container: containerNull } = renderComponent(true, null);
    expect(containerNull.firstChild).toBeNull();
  });

  it('deve carregar e exibir as questoes vinculadas e disponiveis', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockedBuscarLista).toHaveBeenCalledWith('lista-1');
      expect(mockedListQuestions).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('1. Questao ja vinculada')).toBeInTheDocument();

    expect(screen.getByText('Questao disponivel sobre musculos')).toBeInTheDocument();
    expect(screen.getByText('Outra questao disponivel')).toBeInTheDocument();
  });

  it('deve vincular uma questao com sucesso', async () => {
    mockedVincular.mockResolvedValueOnce({
      ...mockListaBase,
      questoes: [
        ...(mockListaBase.questoes ?? []),
        { id: 'q2', enunciado: 'Questao disponivel sobre musculos', tema: 'Musculos', tipo: 'VERDADEIRO_FALSO', dificuldade: 'MEDIO', ordem: 2 }
      ]
    });

    renderComponent();
    await waitFor(() => expect(screen.getByText('Questao disponivel sobre musculos')).toBeInTheDocument());

    const btnAdicionar = screen.getAllByText('Adicionar')[0];
    fireEvent.click(btnAdicionar);

    await waitFor(() => {
      expect(mockedVincular).toHaveBeenCalledWith('lista-1', ['q2']); 
    });

    expect(mockOnAfterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFeedback).toHaveBeenCalledWith('Questao vinculada com sucesso.', 'success');
  });

  it('deve fechar o modal ao clicar no botão de fechar', async () => {
    renderComponent();
    
    const closeBtn = screen.getByLabelText('Fechar modal de questoes');
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve filtrar questoes disponiveis por busca de texto, tema e tipo', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText('Questao disponivel sobre musculos')).toBeInTheDocument());

    const inputBusca = screen.getByPlaceholderText('Buscar por enunciado ou tema');
    fireEvent.change(inputBusca, { target: { value: 'musculos' } });
    expect(screen.getByText('Questao disponivel sobre musculos')).toBeInTheDocument();
    expect(screen.queryByText('Outra questao disponivel')).not.toBeInTheDocument();

    fireEvent.change(inputBusca, { target: { value: '' } });
    const selectTema = screen.getByLabelText('Filtrar questoes por tema');
    fireEvent.change(selectTema, { target: { value: 'Nervos' } });
    expect(screen.queryByText('Questao disponivel sobre musculos')).not.toBeInTheDocument();
    expect(screen.getByText('Outra questao disponivel')).toBeInTheDocument();

    fireEvent.change(selectTema, { target: { value: '' } });
    const selectTipo = screen.getByLabelText('Filtrar questoes por tipo');
    fireEvent.change(selectTipo, { target: { value: 'VF' } }); 
    expect(screen.getByText('Questao disponivel sobre musculos')).toBeInTheDocument();
    expect(screen.queryByText('Outra questao disponivel')).not.toBeInTheDocument();
  });

  it('deve disparar erro ao falhar na vinculação', async () => {
    mockedVincular.mockRejectedValueOnce(new Error('Erro de rede'));

    renderComponent();
    await waitFor(() => expect(screen.getAllByText('Adicionar')[0]).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Adicionar')[0]);

    await waitFor(() => {
      expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel vincular a questao.', 'error');
    });
  });

  it('deve desvincular uma questao com sucesso', async () => {
    mockedDesvincular.mockResolvedValueOnce({
      ...mockListaBase,
      questoes: [] 
    });

    renderComponent();
    await waitFor(() => expect(screen.getByText('1. Questao ja vinculada')).toBeInTheDocument());

    const btnRemover = screen.getByLabelText('Remover questao');
    fireEvent.click(btnRemover);

    await waitFor(() => {
      expect(mockedDesvincular).toHaveBeenCalledWith('lista-1', 'q1');
      expect(mockOnAfterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFeedback).toHaveBeenCalledWith('Questao removida da lista.', 'success');
    });
  });

  it('deve disparar erro ao falhar na desvinculação', async () => {
    mockedDesvincular.mockRejectedValueOnce(new Error('Erro de API'));

    renderComponent();
    await waitFor(() => expect(screen.getByLabelText('Remover questao')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Remover questao'));

    await waitFor(() => {
      expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel remover a questao.', 'error');
    });
  });

  it('deve reordenar uma questao (mover para baixo)', async () => {
    const listaComDuasQuestoes: ListaQuestao = {
      ...mockListaBase,
      questoes: [
        { id: 'q1', enunciado: 'Primeira', tema: '', tipo: '', dificuldade: '', ordem: 1 },
        { id: 'q2', enunciado: 'Segunda', tema: '', tipo: '', dificuldade: '', ordem: 2 },
      ]
    };
    mockedBuscarLista.mockResolvedValueOnce(listaComDuasQuestoes);
    mockedReordenar.mockResolvedValueOnce(listaComDuasQuestoes); 

    renderComponent(true, listaComDuasQuestoes);
    await waitFor(() => expect(screen.getByText('1. Primeira')).toBeInTheDocument());

    const btnMoverBaixo = screen.getAllByLabelText('Mover questao para baixo')[0];
    fireEvent.click(btnMoverBaixo);

    await waitFor(() => {
      expect(mockedReordenar).toHaveBeenCalledWith('lista-1', ['q2', 'q1']);
      expect(mockOnAfterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFeedback).toHaveBeenCalledWith('Ordem das questoes atualizada.', 'success');
    });
  });

  it('deve lidar com erro ao carregar os dados iniciais do modal', async () => {
    mockedBuscarLista.mockRejectedValueOnce(new Error('Falha no GET'));

    renderComponent();

    await waitFor(() => {
      expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel carregar as questoes da lista.', 'error');
    });
  });
});