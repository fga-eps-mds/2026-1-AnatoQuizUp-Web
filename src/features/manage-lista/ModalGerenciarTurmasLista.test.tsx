import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../shared/config/env', () => ({
  apiBaseUrlFromEnv: 'http://localhost:3000',
  env: { VITE_API_URL: 'http://localhost:3000' }
}));

import { ModalGerenciarTurmasLista } from './ModalGerenciarTurmasLista';
import * as listaApi from '../../entities/lista/api/listaApi';
import * as turmaApi from '../../entities/turmas/api/turmaApi';
import type { ListaQuestao } from '../../entities/lista/model/types';
import type { Turma } from '../../entities/turmas/model/types';

jest.mock('../../entities/lista/api/listaApi');
jest.mock('../../entities/turmas/api/turmaApi');

const mockedBuscarLista = jest.mocked(listaApi.buscarLista);
const mockedVincular = jest.mocked(listaApi.vincularTurmasLista);
const mockedDesvincular = jest.mocked(listaApi.desvincularTurmaLista);
const mockedListarTurmas = jest.mocked(turmaApi.listarTurmas);

describe('ModalGerenciarTurmasLista', () => {
  const mockOnClose = jest.fn();
  const mockOnAfterChange = jest.fn();
  const mockOnFeedback = jest.fn();

  const mockListaBase = {
    id: 'lista-1',
    nome: 'Simulado Anato',
    quantidadeQuestoes: 5,
    status: 'PUBLICADA',
    criadoEm: '2026-05-20',
    questoes: [],
    turmas: [
      { id: 't1', nome: 'Turma Vinculada' } 
    ],
  } as unknown as ListaQuestao;

  const mockBancoTurmas: Turma[] = [
    {
      id: 't1', 
      nome: 'Turma Vinculada',
      codigo: 'ANATO-01',
      descricao: 'Turma matutina',
      ano: 2026,
      semestre: 1,
      quantidadeAlunos: 30,
      status: 'ATIVA',
      criadoEm: '2026-05-20',
    },
    {
      id: 't2', 
      nome: 'Turma Disponivel',
      codigo: 'ANATO-02',
      descricao: 'Turma noturna',
      ano: 2026,
      semestre: 1,
      quantidadeAlunos: 25,
      status: 'ATIVA',
      criadoEm: '2026-05-20',
    },
    {
      id: 't3', 
      nome: 'Turma Antiga',
      codigo: 'ANATO-03',
      descricao: 'Semestre passado',
      ano: 2025,
      semestre: 2,
      quantidadeAlunos: 40,
      status: 'INATIVA',
      criadoEm: '2025-08-20',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedBuscarLista.mockResolvedValue(mockListaBase);
    mockedListarTurmas.mockResolvedValue(mockBancoTurmas);
  });

  const renderComponent = (isOpen = true, lista: ListaQuestao | null = mockListaBase) => {
    return render(
      <ModalGerenciarTurmasLista
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

  it('deve carregar e exibir as turmas vinculadas e disponiveis', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockedBuscarLista).toHaveBeenCalledWith('lista-1');
      expect(mockedListarTurmas).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Turma Vinculada')).toBeInTheDocument();

    expect(screen.getByText('Turma Disponivel')).toBeInTheDocument();
    expect(screen.getByText('Turma Antiga')).toBeInTheDocument();
  });

  it('deve fechar o modal ao clicar no botão de fechar', async () => {
    renderComponent();
    
    const closeBtn = screen.getByLabelText('Fechar modal de turmas');
    fireEvent.click(closeBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve lidar com erro ao carregar os dados iniciais', async () => {
    mockedBuscarLista.mockRejectedValueOnce(new Error('Erro de API'));

    renderComponent();

    await waitFor(() => {
      expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel carregar as turmas da lista.', 'error');
    });
  });

  it('deve filtrar turmas disponiveis por busca de texto (nome, codigo, descricao) e status', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText('Turma Disponivel')).toBeInTheDocument());

    const inputBusca = screen.getByPlaceholderText('Buscar por nome, codigo ou descricao');
    const selectStatus = screen.getByLabelText('Filtrar turmas por status');

    fireEvent.change(inputBusca, { target: { value: 'noturna' } });
    expect(screen.getByText('Turma Disponivel')).toBeInTheDocument();
    expect(screen.queryByText('Turma Antiga')).not.toBeInTheDocument();

    fireEvent.change(inputBusca, { target: { value: '' } });
    fireEvent.change(selectStatus, { target: { value: 'INATIVA' } });
    expect(screen.queryByText('Turma Disponivel')).not.toBeInTheDocument();
    expect(screen.getByText('Turma Antiga')).toBeInTheDocument();
  });

  describe('Vinculação de Turmas', () => {
    it('deve vincular uma turma com sucesso', async () => {
      mockedVincular.mockResolvedValueOnce({
        ...mockListaBase,
        turmas: [{ id: 't1' }, { id: 't2' }]
      } as unknown as ListaQuestao);

      renderComponent();
      await waitFor(() => expect(screen.getByText('Turma Disponivel')).toBeInTheDocument());

      const btnVincular = screen.getAllByText('Vincular')[0];
      fireEvent.click(btnVincular);

      await waitFor(() => {
        expect(mockedVincular).toHaveBeenCalledWith('lista-1', ['t2']);
      });

      expect(mockOnAfterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFeedback).toHaveBeenCalledWith('Turma vinculada com sucesso.', 'success');
    });

    it('deve disparar erro ao falhar na vinculação', async () => {
      mockedVincular.mockRejectedValueOnce(new Error('Falha na vinculacao'));

      renderComponent();
      await waitFor(() => expect(screen.getAllByText('Vincular')[0]).toBeInTheDocument());

      fireEvent.click(screen.getAllByText('Vincular')[0]);

      await waitFor(() => {
        expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel vincular a turma.', 'error');
      });
    });
  });

  describe('Desvinculação de Turmas', () => {
    it('deve desvincular uma turma com sucesso', async () => {
      mockedDesvincular.mockResolvedValueOnce({
        ...mockListaBase,
        turmas: [] 
      } as unknown as ListaQuestao);

      renderComponent();
      await waitFor(() => expect(screen.getByText('Turma Vinculada')).toBeInTheDocument());

      const btnRemover = screen.getByText('Remover');
      fireEvent.click(btnRemover);

      await waitFor(() => {
        expect(mockedDesvincular).toHaveBeenCalledWith('lista-1', 't1');
      });

      expect(mockOnAfterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFeedback).toHaveBeenCalledWith('Turma desvinculada da lista.', 'success');
    });

    it('deve disparar erro ao falhar na desvinculação', async () => {
      mockedDesvincular.mockRejectedValueOnce(new Error('Falha ao remover'));

      renderComponent();
      await waitFor(() => expect(screen.getByText('Remover')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Remover'));

      await waitFor(() => {
        expect(mockOnFeedback).toHaveBeenCalledWith('Nao foi possivel desvincular a turma.', 'error');
      });
    });
  });
});