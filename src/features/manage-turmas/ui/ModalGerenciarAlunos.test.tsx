import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalGerenciarAlunos } from './ModalGerenciarAlunos';
import {
  desvincularAlunoTurma,
  listarAlunosDaTurma,
  vincularAlunoTurma,
} from '../../../entities/turmas/api/turmaApi';
import { buscarAlunos, buscarUsuariosPorIds } from '../../../entities/usuarios/api/usuarioApi';
import type { Turma } from '../../../entities/turmas/model/types';

jest.mock('../../../entities/turmas/api/turmaApi', () => ({
  desvincularAlunoTurma: jest.fn(),
  listarAlunosDaTurma: jest.fn(),
  vincularAlunoTurma: jest.fn(),
}));

jest.mock('../../../entities/usuarios/api/usuarioApi', () => ({
  buscarAlunos: jest.fn(),
  buscarUsuariosPorIds: jest.fn(),
}));

const turma: Turma = {
  id: 'turma-1',
  codigo: 'ANAT-01',
  nome: 'Anatomia Sistemica',
  semestre: '1',
  ano: 2026,
  descricao: 'Turma matutina',
  status: 'ATIVA',
  quantidadeAlunos: 15,
  criadoEm: '2026-05-14T10:00:00.000Z',
};

const alunoVinculado = {
  id: 'aluno-1',
  nome: 'Joao Silva',
  nickname: 'joao',
  email: 'joao@example.com',
  perfil: 'ALUNO',
  status: 'ATIVO',
  instituicao: 'UnB',
  curso: 'Medicina',
  semestre: '2026.1',
};

const alunoBusca = {
  id: 'aluno-2',
  nome: 'Maria Santos',
  nickname: 'maria',
  email: 'maria@example.com',
  perfil: 'ALUNO',
  status: 'ATIVO',
  instituicao: 'UnB',
  curso: 'Medicina',
  semestre: '2026.1',
};

describe('ModalGerenciarAlunos', () => {
  const onClose = jest.fn();
  const onAfterChange = jest.fn();
  const onFeedback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (listarAlunosDaTurma as jest.Mock).mockResolvedValue([
      {
        id: 'vinculo-1',
        turmaId: 'turma-1',
        alunoId: 'aluno-1',
        criadoEm: '2026-05-14T10:00:00.000Z',
        atualizadoEm: '2026-05-14T10:00:00.000Z',
      },
    ]);
    (buscarUsuariosPorIds as jest.Mock).mockResolvedValue([alunoVinculado]);
    (buscarAlunos as jest.Mock).mockResolvedValue({
      dados: [alunoBusca],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    (vincularAlunoTurma as jest.Mock).mockResolvedValue({});
    (desvincularAlunoTurma as jest.Mock).mockResolvedValue({});
  });

  it('nao deve renderizar quando estiver fechado', () => {
    const { container } = render(
      <ModalGerenciarAlunos
        isOpen={false}
        turma={turma}
        onClose={onClose}
        onAfterChange={onAfterChange}
        onFeedback={onFeedback}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve carregar vinculos e buscar dados dos alunos', async () => {
    render(
      <ModalGerenciarAlunos
        isOpen={true}
        turma={turma}
        onClose={onClose}
        onAfterChange={onAfterChange}
        onFeedback={onFeedback}
      />,
    );

    expect(await screen.findByText('Joao Silva')).toBeInTheDocument();
    expect(listarAlunosDaTurma).toHaveBeenCalledWith('turma-1');
    expect(buscarUsuariosPorIds).toHaveBeenCalledWith(['aluno-1']);
  });

  it('deve buscar alunos por texto e vincular aluno selecionado', async () => {
    const user = userEvent.setup();
    render(
      <ModalGerenciarAlunos
        isOpen={true}
        turma={turma}
        onClose={onClose}
        onAfterChange={onAfterChange}
        onFeedback={onFeedback}
      />,
    );

    await screen.findByText('Joao Silva');
    await user.type(screen.getByPlaceholderText('Buscar por nome ou email'), 'Maria');

    expect(await screen.findByText('Maria Santos')).toBeInTheDocument();
    expect(buscarAlunos).toHaveBeenCalledWith({ busca: 'Maria', limit: 10 });

    await user.click(screen.getByRole('button', { name: /Adicionar/i }));

    await waitFor(() => {
      expect(vincularAlunoTurma).toHaveBeenCalledWith('turma-1', 'aluno-2');
    });
    expect(onFeedback).toHaveBeenCalledWith('Aluno vinculado com sucesso.', 'success');
    expect(onAfterChange).toHaveBeenCalledTimes(1);
  });

  it('deve impedir adicionar aluno ja vinculado', async () => {
    const user = userEvent.setup();
    (buscarAlunos as jest.Mock).mockResolvedValue({
      dados: [alunoVinculado],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    render(
      <ModalGerenciarAlunos
        isOpen={true}
        turma={turma}
        onClose={onClose}
        onAfterChange={onAfterChange}
        onFeedback={onFeedback}
      />,
    );

    await screen.findByText('Joao Silva');
    await user.type(screen.getByPlaceholderText('Buscar por nome ou email'), 'Joao');

    const botaoVinculado = await screen.findByRole('button', { name: /Vinculado/i });
    expect(botaoVinculado).toBeDisabled();
  });

  it('deve desvincular aluno', async () => {
    const user = userEvent.setup();
    render(
      <ModalGerenciarAlunos
        isOpen={true}
        turma={turma}
        onClose={onClose}
        onAfterChange={onAfterChange}
        onFeedback={onFeedback}
      />,
    );

    await screen.findByText('Joao Silva');
    await user.click(screen.getByRole('button', { name: /Remover/i }));

    await waitFor(() => {
      expect(desvincularAlunoTurma).toHaveBeenCalledWith('turma-1', 'aluno-1');
    });
    expect(onFeedback).toHaveBeenCalledWith('Aluno removido da turma com sucesso.', 'success');
    expect(onAfterChange).toHaveBeenCalledTimes(1);
  });
});
