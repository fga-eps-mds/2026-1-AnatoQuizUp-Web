import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ListarListas } from './ListarListas';
import * as listaApi from '../../entities/lista/api/listaApi';
import type { ListaQuestao } from '../../entities/lista/model/types';

interface MockModalListaProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  lista: { nome: string } | null;
  onSubmit: (nome: string) => void;
  onClose: () => void;
}

interface MockModalGerenciarProps {
  isOpen: boolean;
  lista: { nome: string } | null;
  onClose: () => void;
  onAfterChange: () => void;
  onFeedback: (msg: string, type: string) => void;
}

interface MockModalExcluirProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

jest.mock('../../entities/lista/api/listaApi', () => ({
  listarListas: jest.fn(),
  criarLista: jest.fn(),
  atualizarLista: jest.fn(),
  excluirLista: jest.fn(),
  baixarPdfLista: jest.fn()
}));

jest.mock('../../shared/config/env', () => ({ API_BASE_URL: 'http://localhost:4000/api/v1', USE_MOCKS: false }));

jest.mock('./ModalLista', () => ({
  ModalLista: ({ isOpen, mode, lista, onSubmit, onClose }: MockModalListaProps) => (isOpen ? (
    <div data-testid="modal-lista">
      <span>{mode}</span>
      <span>{lista?.nome ?? 'nova'}</span>
      <button onClick={() => { onSubmit(mode === 'create' ? 'NovaLista' : 'Editada'); }}>Submeter</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  ) : null)
}));

jest.mock('./ModalGerenciarQuestoesLista', () => ({
  ModalGerenciarQuestoesLista: ({ isOpen, lista, onClose, onAfterChange, onFeedback }: MockModalGerenciarProps) => (isOpen ? (
    <div data-testid="modal-questoes">
      <span>{lista?.nome}</span>
      <button onClick={onClose}>FecharQuestoes</button>
      <button onClick={onAfterChange}>Atualizar</button>
      <button onClick={() => { onFeedback('Toast Teste', 'success'); }}>Toast</button>
    </div>
  ) : null)
}));

jest.mock('./ModalExcluirLista', () => ({
  ModalExcluirLista: ({ isOpen, onClose, onConfirm }: MockModalExcluirProps) => (isOpen ? (
    <div data-testid="modal-excluir">
      <button onClick={onClose}>Cancelar</button>
      <button onClick={() => { onConfirm('1'); }}>ConfirmarExclusao</button>
    </div>
  ) : null)
}));

const mockedListar = jest.mocked(listaApi.listarListas);
const mockedCriar = jest.mocked(listaApi.criarLista);
const mockedAtualizar = jest.mocked(listaApi.atualizarLista);
const mockedExcluir = jest.mocked(listaApi.excluirLista);
const mockedBaixarPdf = jest.mocked(listaApi.baixarPdfLista);

describe('ListarListas', () => {
  const listaBase: ListaQuestao = {
    id: '1', nome: 'Lista 1', quantidadeQuestoes: 5, status: 'RASCUNHO', criadoEm: '22/05/2026', questoes: [],
    turmas: [{ id: 't1', nome: 'Turma A' }, { id: 't2', nome: 'Turma B' }, { id: 't3', nome: 'Turma C' }, { id: 't4', nome: 'Turma D' }] 
  };

  const listaSemTurma: ListaQuestao = {
    id: '2', nome: 'Lista 2', quantidadeQuestoes: 0, status: 'PUBLICADA', turmas: [], criadoEm: '', questoes: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedListar.mockResolvedValue([listaBase, listaSemTurma]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('deve buscar e listar as listas, testando turmas excedentes e sem turma', async () => {
    render(<ListarListas />);
    expect(screen.getByText('Carregando listas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Lista 1')).toBeInTheDocument();
      expect(screen.getByText('Sem turma')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument(); 
    });
  });

  it('deve exibir toast e esconde-lo apos 4 segundos', async () => {
    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /questões/i })[0]);
    fireEvent.click(screen.getByText('Toast'));

    expect(screen.getByText('Toast Teste')).toBeInTheDocument();

    jest.advanceTimersByTime(4500);

    await waitFor(() => {
      expect(screen.queryByText('Toast Teste')).not.toBeInTheDocument();
    });
  });

  it('deve usar filtros de busca e status para recarregar as listas', async () => {
    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Buscar lista'), { target: { value: 'Neuro' } });
    fireEvent.change(screen.getByLabelText('Filtrar listas por status'), { target: { value: 'PUBLICADA' } });

    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(mockedListar).toHaveBeenCalledWith({ busca: 'Neuro', status: 'PUBLICADA' });
    });
  });

  it('deve criar uma nova lista com sucesso (fluxo ModalLista)', async () => {
    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Nova lista/i }));
    
    mockedCriar.mockResolvedValueOnce({ ...listaBase, id: '3' });
    fireEvent.click(screen.getByText('Submeter'));

    await waitFor(() => {
      expect(mockedCriar).toHaveBeenCalledWith({ nome: 'NovaLista' });
      expect(screen.getByText('Lista criada com sucesso.')).toBeInTheDocument();
    });
  });

  it('deve editar uma lista existente com sucesso e fechar modal', async () => {
    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
    
    fireEvent.click(screen.getByText('Fechar'));
    expect(screen.queryByTestId('modal-lista')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
    mockedAtualizar.mockResolvedValueOnce(listaBase);
    fireEvent.click(screen.getByText('Submeter'));

    await waitFor(() => {
      expect(mockedAtualizar).toHaveBeenCalledWith('1', { nome: 'Editada' });
      expect(screen.getByText('Lista atualizada com sucesso.')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de exclusao e confirmar', async () => {
    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /Excluir/i })[0]);
    
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByTestId('modal-excluir')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Excluir/i })[0]);
    mockedExcluir.mockResolvedValueOnce();
    fireEvent.click(screen.getByText('ConfirmarExclusao'));

    await waitFor(() => {
      expect(mockedExcluir).toHaveBeenCalledWith('1');
      expect(screen.getByText('Lista excluída com sucesso.')).toBeInTheDocument();
    });
  });

  it('deve fazer download do PDF com sucesso', async () => {
    window.URL.createObjectURL = jest.fn().mockReturnValue('blob-url');
    window.URL.revokeObjectURL = jest.fn();
    mockedBaixarPdf.mockResolvedValueOnce('base64');

    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /PDF/i })[0]);

    expect(screen.getByText('Gerando PDF...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockedBaixarPdf).toHaveBeenCalledWith('1');
      expect(screen.getByText('PDF baixado com sucesso!')).toBeInTheDocument();
    });
  });

  it('deve disparar onAfterChange do Modal de Questões', async () => {
    render(<ListarListas />);
    await waitFor(() => expect(screen.getByText('Lista 1')).toBeInTheDocument());

    fireEvent.click(screen.getAllByRole('button', { name: /questões/i })[0]);
    
    mockedListar.mockClear();
    fireEvent.click(screen.getByText('Atualizar'));

    jest.advanceTimersByTime(100); 
    await waitFor(() => {
      expect(mockedListar).toHaveBeenCalled();
    });
  });
});