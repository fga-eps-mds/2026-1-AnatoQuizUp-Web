import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaTurmas } from './ListarTurmas';
import {
  atualizarTurma,
  criarTurma,
  excluirTurma,
  listarTurmas,
} from '../../../entities/turmas/api/turmaApi';
import type { SalvarTurmaPayload, Turma } from '../../../entities/turmas/model/types';

jest.mock('../../../entities/turmas/api/turmaApi', () => ({
  atualizarTurma: jest.fn(),
  criarTurma: jest.fn(),
  excluirTurma: jest.fn(),
  listarTurmas: jest.fn(),
}));

const payloadTurma: SalvarTurmaPayload = {
  codigo: 'ANAT-01',
  nome: 'Anatomia Sistemica',
  semestre: '1',
  ano: 2026,
  descricao: 'Turma matutina',
  status: 'ATIVA',
};

jest.mock('./ModalTurma', () => ({
  ModalTurma: ({
    isOpen,
    mode,
    turma,
    onClose,
    onSubmit,
  }: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    turma: Turma | null;
    onClose: () => void;
    onSubmit: (payload: SalvarTurmaPayload) => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="mock-modal-turma">
        <span>{mode}</span>
        <span>{turma?.nome}</span>
        <button onClick={onClose}>Fechar turma</button>
        <button onClick={() => onSubmit(payloadTurma)}>Salvar turma mock</button>
      </div>
    );
  },
}));

jest.mock('./ModalGerenciarAlunos', () => ({
  ModalGerenciarAlunos: ({
    isOpen,
    turma,
    onClose,
    onAfterChange,
    onFeedback,
  }: {
    isOpen: boolean;
    turma: Turma | null;
    onClose: () => void;
    onAfterChange: () => void;
    onFeedback: (message: string, type: 'success' | 'error') => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="mock-modal-alunos">
        <span>{turma?.nome}</span>
        <button onClick={onClose}>Fechar alunos</button>
        <button
          onClick={() => {
            onFeedback('Aluno vinculado com sucesso.', 'success');
            onAfterChange();
          }}
        >
          Simular alteracao alunos
        </button>
      </div>
    );
  },
}));

jest.mock('./ModalExcluirTurma', () => ({
  ModalExcluirTurma: ({
    isOpen,
    onClose,
    onConfirm,
    turma,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    turma: Turma | null;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="mock-modal-excluir">
        <span data-testid="modal-turma-nome">{turma?.nome}</span>
        <button onClick={onClose}>Cancelar exclusao</button>
        <button onClick={onConfirm}>Confirmar exclusao</button>
      </div>
    );
  },
}));

const mockTurmas: Turma[] = [
  {
    id: 'turma-1',
    codigo: 'ANAT-01',
    nome: 'Anatomia Sistemica',
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

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (listarTurmas as jest.Mock).mockResolvedValue(mockTurmas);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('deve carregar e renderizar a lista de turmas na montagem inicial', async () => {
    render(<ListaTurmas />);

    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(1));
    expect(listarTurmas).toHaveBeenCalledWith({
      busca: undefined,
      status: undefined,
      ano: undefined,
      semestre: undefined,
    });

    expect(await screen.findByText('Anatomia Sistemica')).toBeInTheDocument();
    expect(screen.getByText('Neuroanatomia')).toBeInTheDocument();
    expect(screen.getByText('2 turmas cadastradas')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de lista vazia quando nao houver turmas', async () => {
    (listarTurmas as jest.Mock).mockResolvedValue([]);

    render(<ListaTurmas />);

    expect(await screen.findByText('Nenhuma turma encontrada.')).toBeInTheDocument();
  });

  it('deve lidar com erro na API ao carregar as turmas', async () => {
    const erroMock = new Error('Falha na rede');
    (listarTurmas as jest.Mock).mockRejectedValue(erroMock);

    render(<ListaTurmas />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao carregar turmas', erroMock);
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel carregar as turmas.');
  });

  it('deve disparar nova busca ao digitar no campo de pesquisa', async () => {
    const user = userEvent.setup();

    render(<ListaTurmas />);

    const inputBusca = screen.getByPlaceholderText('Buscar turma');
    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(1));
    jest.clearAllMocks();

    await user.type(inputBusca, 'Anatomia');

    await waitFor(() => {
      expect(listarTurmas).toHaveBeenLastCalledWith(
        expect.objectContaining({ busca: 'Anatomia' }),
      );
    });
  });

  it('deve disparar nova busca ao alterar filtros de ano, semestre e status', async () => {
    const user = userEvent.setup();

    render(<ListaTurmas />);
    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(1));
    jest.clearAllMocks();

    await user.selectOptions(screen.getByLabelText('Filtrar por ano'), '2026');
    await user.selectOptions(screen.getByLabelText('Filtrar por semestre'), '1');
    await user.selectOptions(screen.getByLabelText('Filtrar por status'), 'ATIVA');

    await waitFor(() => {
      expect(listarTurmas).toHaveBeenLastCalledWith({
        busca: undefined,
        status: 'ATIVA',
        ano: 2026,
        semestre: '1',
      });
    });
  });

  it('deve abrir modal de criacao e criar turma', async () => {
    const user = userEvent.setup();
    (criarTurma as jest.Mock).mockResolvedValue(mockTurmas[0]);

    render(<ListaTurmas />);
    await screen.findByText('Anatomia Sistemica');

    await user.click(screen.getByRole('button', { name: /Nova Turma/i }));
    expect(screen.getByTestId('mock-modal-turma')).toHaveTextContent('create');

    await user.click(screen.getByRole('button', { name: /Salvar turma mock/i }));

    await waitFor(() => {
      expect(criarTurma).toHaveBeenCalledWith(payloadTurma);
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Turma criada com sucesso.');
  });

  it('deve abrir modal de edicao e atualizar turma', async () => {
    const user = userEvent.setup();
    (atualizarTurma as jest.Mock).mockResolvedValue(mockTurmas[0]);

    render(<ListaTurmas />);
    await screen.findByText('Anatomia Sistemica');

    await user.click(screen.getAllByRole('button', { name: /Editar/i })[0]);
    expect(screen.getByTestId('mock-modal-turma')).toHaveTextContent('edit');
    expect(screen.getByTestId('mock-modal-turma')).toHaveTextContent('Anatomia Sistemica');

    await user.click(screen.getByRole('button', { name: /Salvar turma mock/i }));

    await waitFor(() => {
      expect(atualizarTurma).toHaveBeenCalledWith('turma-1', payloadTurma);
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Turma atualizada com sucesso.');
  });

  it('deve abrir modal de alunos e atualizar listagem apos alteracao', async () => {
    const user = userEvent.setup();

    render(<ListaTurmas />);
    await screen.findByText('Anatomia Sistemica');

    await user.click(screen.getAllByRole('button', { name: /Alunos/i })[0]);
    expect(screen.getByTestId('mock-modal-alunos')).toHaveTextContent('Anatomia Sistemica');

    await user.click(screen.getByRole('button', { name: /Simular alteracao alunos/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Aluno vinculado com sucesso.');
    await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(2));
  });

  describe('Fluxo de Exclusao', () => {
    it('deve abrir o modal ao clicar em excluir e permitir cancelar', async () => {
      const user = userEvent.setup();

      render(<ListaTurmas />);
      await screen.findByText('Anatomia Sistemica');

      await user.click(screen.getAllByRole('button', { name: /Excluir/i })[0]);

      expect(screen.getByTestId('mock-modal-excluir')).toBeInTheDocument();
      expect(screen.getByTestId('modal-turma-nome')).toHaveTextContent('Anatomia Sistemica');

      await user.click(screen.getByRole('button', { name: /Cancelar exclusao/i }));

      expect(screen.queryByTestId('mock-modal-excluir')).not.toBeInTheDocument();
    });

    it('deve chamar a API de exclusao, fechar o modal e recarregar a lista ao confirmar', async () => {
      const user = userEvent.setup();
      (excluirTurma as jest.Mock).mockResolvedValue(undefined);

      render(<ListaTurmas />);
      await screen.findByText('Anatomia Sistemica');

      await user.click(screen.getAllByRole('button', { name: /Excluir/i })[0]);
      await user.click(screen.getByRole('button', { name: /Confirmar exclusao/i }));

      expect(excluirTurma).toHaveBeenCalledWith('turma-1');
      await waitFor(() => expect(listarTurmas).toHaveBeenCalledTimes(2));
      expect(screen.queryByTestId('mock-modal-excluir')).not.toBeInTheDocument();
      expect(await screen.findByRole('status')).toHaveTextContent('Turma excluida com sucesso.');
    });

    it('deve lidar com erro na API de exclusao', async () => {
      const user = userEvent.setup();
      const erroExclusao = new Error('Falha ao excluir');
      (excluirTurma as jest.Mock).mockRejectedValue(erroExclusao);

      render(<ListaTurmas />);
      await screen.findByText('Anatomia Sistemica');

      await user.click(screen.getAllByRole('button', { name: /Excluir/i })[0]);
      await user.click(screen.getByRole('button', { name: /Confirmar exclusao/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao excluir turma', erroExclusao);
      });
      expect(screen.getByRole('alert')).toHaveTextContent('Nao foi possivel excluir a turma.');
    });
  });
});
