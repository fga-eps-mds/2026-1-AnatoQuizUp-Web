import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaTurmas } from './ListarTurmas';
import { listarTurmas, excluirTurma } from '../../../entities/turmas/api/turmaApi';
import type { Turma } from '../../../entities/turmas/model/types';

jest.mock('../../../entities/turmas/api/turmaApi', () => ({
  listarTurmas: jest.fn(),
  excluirTurma: jest.fn(),
}));

jest.mock('./ModalExcluirTurma', () => ({
  ModalExcluirTurma: ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    turma 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    turma: Turma | null; 
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <span data-testid="modal-turma-nome">{turma?.nome}</span>
        <button onClick={onClose} data-testid="modal-btn-cancelar">Cancelar</button>
        <button onClick={onConfirm} data-testid="modal-btn-confirmar">Confirmar Exclusão</button>
      </div>
    );
  },
}));

const mockTurmas: Turma[] = [
  {
    id: 'turma-1',
    codigo: 'ANAT-01',
    nome: 'Anatomia Sistêmica',
    semestre: '1',
    ano: 2026,
    descricao: 'Turma matutina',
    status: 'ATIVA',
    quantidadeAlunos: 15,
    criadoEm: '2026-05-14T10:00:00.000Z',
  },
  {
    id: 'turma-2',
    codigo: 'NEURO-02',
    nome: 'Neuroanatomia',
    semestre: '2',
    ano: 2025,
    descricao: 'Turma noturna',
    status: 'INATIVA',
    quantidadeAlunos: 30,
    criadoEm: '2025-08-10T10:00:00.000Z',
  },
];

describe('ListaTurmas Feature', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let windowAlertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    windowAlertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    windowAlertSpy.mockRestore();
  });

    it('deve carregar e renderizar a lista de turmas na montagem inicial', async () => {
    (listarTurmas as jest.Mock).mockResolvedValue(mockTurmas);

    render(<ListaTurmas />);

    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(1));
    expect(listarTurmas).toHaveBeenCalledWith({ busca: undefined, status: undefined });

    expect(await screen.findByText('Anatomia Sistêmica')).toBeInTheDocument();
    
    expect(screen.getByText('Neuroanatomia')).toBeInTheDocument();
    expect(screen.getByText('2 turmas cadastradas')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de lista vazia quando não houver turmas', async () => {
    (listarTurmas as jest.Mock).mockResolvedValue([]);

    render(<ListaTurmas />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma turma encontrada.')).toBeInTheDocument();
    });
  });

  it('deve lidar com erro na API ao carregar as turmas', async () => {
    const erroMock = new Error('Falha na rede');
    (listarTurmas as jest.Mock).mockRejectedValue(erroMock);

    render(<ListaTurmas />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao carregar turmas', erroMock);
    });
  });

  it('deve disparar nova busca ao digitar no campo de pesquisa', async () => {
    const user = userEvent.setup();
    (listarTurmas as jest.Mock).mockResolvedValue(mockTurmas);

    render(<ListaTurmas />);

    const inputBusca = screen.getByPlaceholderText('Buscar turma');
    
    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(1));
    jest.clearAllMocks();

    await user.type(inputBusca, 'Anatomia');

    await waitFor(() => {
      expect(listarTurmas).toHaveBeenLastCalledWith(
        expect.objectContaining({ busca: 'Anatomia' })
      );
    });
  });

  it('deve disparar nova busca ao alterar o filtro de status', async () => {
    const user = userEvent.setup();
    (listarTurmas as jest.Mock).mockResolvedValue(mockTurmas);

    render(<ListaTurmas />);
    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(1));
    jest.clearAllMocks();

    const selectStatus = screen.getByDisplayValue('Todos os status');
    await user.selectOptions(selectStatus, 'ATIVA');

    await waitFor(() => {
      expect(listarTurmas).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ATIVA' })
      );
    });
  });

  it('deve disparar os alerts nos botões de feature futura (Nova Turma e Editar)', async () => {
    const user = userEvent.setup();
    (listarTurmas as jest.Mock).mockResolvedValue([mockTurmas[0]]);

    render(<ListaTurmas />);
    await waitFor(() => expect(screen.getByText('Anatomia Sistêmica')).toBeInTheDocument());

    const btnNovaTurma = screen.getByRole('button', { name: /Nova Turma/i });
    await user.click(btnNovaTurma);
    expect(windowAlertSpy).toHaveBeenCalledWith('Abrir feature de Nova Turma');

    const btnEditar = screen.getByRole('button', { name: /Editar/i });
    await user.click(btnEditar);
    expect(windowAlertSpy).toHaveBeenCalledWith('Abrir edição para Anatomia Sistêmica');
  });

  describe('Fluxo de Exclusão (Modal)', () => {
    it('deve abrir o modal ao clicar em excluir e permitir cancelar', async () => {
      const user = userEvent.setup();
      (listarTurmas as jest.Mock).mockResolvedValue([mockTurmas[0]]); 

      render(<ListaTurmas />);
      await waitFor(() => expect(screen.getByText('Anatomia Sistêmica')).toBeInTheDocument());

      const btnExcluir = screen.getByRole('button', { name: /Excluir/i });
      await user.click(btnExcluir);

      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-turma-nome')).toHaveTextContent('Anatomia Sistêmica');

      await user.click(screen.getByTestId('modal-btn-cancelar'));

      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    it('deve chamar a API de exclusão, fechar o modal e recarregar a lista ao confirmar', async () => {
      const user = userEvent.setup();
      (listarTurmas as jest.Mock).mockResolvedValue([mockTurmas[0]]);
      (excluirTurma as jest.Mock).mockResolvedValue(undefined);

      render(<ListaTurmas />);
      await waitFor(() => expect(screen.getByText('Anatomia Sistêmica')).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: /Excluir/i }));
      await user.click(screen.getByTestId('modal-btn-confirmar'));

      // Validações
      expect(excluirTurma).toHaveBeenCalledWith('turma-1');
      expect(listarTurmas).toHaveBeenCalledTimes(2); 
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    it('deve lidar com erro na API de exclusão e fechar o estado de loading', async () => {
      const user = userEvent.setup();
      const erroExclusao = new Error('Falha ao excluir');
      
      (listarTurmas as jest.Mock).mockResolvedValue([mockTurmas[0]]);
      (excluirTurma as jest.Mock).mockRejectedValue(erroExclusao);

      render(<ListaTurmas />);
      await waitFor(() => expect(screen.getByText('Anatomia Sistêmica')).toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: /Excluir/i }));
      await user.click(screen.getByTestId('modal-btn-confirmar'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao excluir turma', erroExclusao);
      });
    });
  });
});