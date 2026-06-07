import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AbaAlunos } from './AbaAlunos';
import {
  desvincularAlunoTurma,
  listarAlunosDaTurma,
  vincularAlunoTurma,
} from '../../../entities/turmas/api/turmaApi';
import { buscarAlunos, buscarUsuariosPorIds } from '../../../entities/usuarios/api/usuarioApi';
import type { UsuarioResumo } from '../../../entities/usuarios/model/types';
import type { VinculoTurmaAluno } from '../../../entities/turmas/model/types';

jest.mock('../../../entities/turmas/api/turmaApi', () => ({
  desvincularAlunoTurma: jest.fn(),
  listarAlunosDaTurma: jest.fn(),
  vincularAlunoTurma: jest.fn(),
}));

jest.mock('../../../entities/usuarios/api/usuarioApi', () => ({
  buscarAlunos: jest.fn(),
  buscarUsuariosPorIds: jest.fn(),
}));

const mockListarAlunosDaTurma = jest.mocked(listarAlunosDaTurma);
const mockVincularAlunoTurma = jest.mocked(vincularAlunoTurma);
const mockDesvincularAlunoTurma = jest.mocked(desvincularAlunoTurma);
const mockBuscarAlunos = jest.mocked(buscarAlunos);
const mockBuscarUsuariosPorIds = jest.mocked(buscarUsuariosPorIds);

const criarUsuario = (sobrescritas: Partial<UsuarioResumo> = {}): UsuarioResumo => ({
  id: 'aluno-1',
  nome: 'Joao Silva',
  nickname: null,
  email: 'joao.silva@aluno.unb.br',
  perfil: 'ALUNO',
  status: 'ATIVO',
  instituicao: 'UnB',
  curso: 'Medicina',
  semestre: '2026.1',
  ...sobrescritas,
});

const criarVinculo = (sobrescritas: Partial<VinculoTurmaAluno> = {}): VinculoTurmaAluno => ({
  id: 'vinculo-1',
  turmaId: 'turma-123',
  alunoId: 'aluno-1',
  criadoEm: '2026-06-01T12:00:00.000Z',
  atualizadoEm: '2026-06-01T12:00:00.000Z',
  ...sobrescritas,
});

const renderAba = () => render(<AbaAlunos turmaId="turma-123" />);

describe('AbaAlunos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListarAlunosDaTurma.mockResolvedValue([]);
    mockBuscarUsuariosPorIds.mockResolvedValue([]);
    mockBuscarAlunos.mockResolvedValue({
      dados: [],
      metadados: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
    mockVincularAlunoTurma.mockResolvedValue(criarVinculo());
    mockDesvincularAlunoTurma.mockResolvedValue(undefined);
  });

  it('deve renderizar loading ao montar', () => {
    mockListarAlunosDaTurma.mockReturnValue(new Promise(() => {}));

    renderAba();

    expect(screen.getByText('Carregando alunos matriculados...')).toBeInTheDocument();
  });

  it('deve exibir tabela com alunos apos carregamento', async () => {
    mockListarAlunosDaTurma.mockResolvedValue([criarVinculo()]);
    mockBuscarUsuariosPorIds.mockResolvedValue([criarUsuario()]);

    renderAba();

    expect(await screen.findByText('Joao Silva')).toBeInTheDocument();
    expect(screen.getByText('joao.silva@aluno.unb.br')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByText('2026.1')).toBeInTheDocument();
    expect(screen.getByText('01/06/2026')).toBeInTheDocument();
    expect(mockListarAlunosDaTurma).toHaveBeenCalledWith('turma-123');
    expect(mockBuscarUsuariosPorIds).toHaveBeenCalledWith(['aluno-1']);
  });

  it('deve exibir fallback quando usuario vinculado nao for encontrado', async () => {
    mockListarAlunosDaTurma.mockResolvedValue([criarVinculo({ alunoId: 'aluno-sem-dados' })]);
    mockBuscarUsuariosPorIds.mockResolvedValue([]);

    renderAba();

    expect(await screen.findByText('Aluno sem dados carregados')).toBeInTheDocument();
    expect(screen.getByText('aluno-sem-dados')).toBeInTheDocument();
  });

  it('deve exibir curso, semestre e data fallback quando dados estiverem ausentes', async () => {
    mockListarAlunosDaTurma.mockResolvedValue([criarVinculo({ criadoEm: 'data invalida' })]);
    mockBuscarUsuariosPorIds.mockResolvedValue([
      criarUsuario({ curso: null, semestre: null }),
    ]);

    renderAba();

    expect(await screen.findByText('Joao Silva')).toBeInTheDocument();
    expect(screen.getByText('Curso nao informado')).toBeInTheDocument();
    expect(screen.getByText('Semestre nao informado')).toBeInTheDocument();
    expect(screen.getByText('data invalida')).toBeInTheDocument();
  });

  it('deve exibir empty state quando nao houver alunos', async () => {
    renderAba();

    expect(await screen.findByText('Nenhum aluno matriculado ainda.')).toBeInTheDocument();
  });

  it('deve manter resultados vazios quando busca tiver menos de 2 caracteres', async () => {
    const user = userEvent.setup();
    renderAba();

    await screen.findByText('Nenhum aluno matriculado ainda.');
    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'j');

    expect(screen.getByText('Digite ao menos 2 caracteres para buscar.')).toBeInTheDocument();
    expect(mockBuscarAlunos).not.toHaveBeenCalled();
  });

  it('deve buscar e mostrar resultados com 2 ou mais caracteres', async () => {
    const user = userEvent.setup();
    mockBuscarAlunos.mockResolvedValue({
      dados: [criarUsuario({ id: 'aluno-2', nome: 'Maria Souza', email: 'maria@aluno.unb.br' })],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderAba();

    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'ma');

    expect(await screen.findByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('maria@aluno.unb.br')).toBeInTheDocument();
    expect(mockBuscarAlunos).toHaveBeenCalledWith({ busca: 'ma', limit: 10 });
  });

  it('deve exibir loading enquanto busca alunos', async () => {
    const user = userEvent.setup();
    mockBuscarAlunos.mockReturnValue(new Promise(() => {}));

    renderAba();

    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'ma');

    expect(await screen.findByText('Buscando alunos...')).toBeInTheDocument();
  });

  it('deve mostrar erro quando busca de alunos falhar', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const erro = new Error('Falha ao buscar');
    mockBuscarAlunos.mockRejectedValue(erro);

    renderAba();

    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'ma');

    expect(await screen.findByText('Nao foi possivel buscar alunos.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar alunos', erro);

    consoleSpy.mockRestore();
  });

  it('deve mostrar aluno ja vinculado como Vinculado desabilitado', async () => {
    const user = userEvent.setup();
    mockListarAlunosDaTurma.mockResolvedValue([criarVinculo()]);
    mockBuscarUsuariosPorIds.mockResolvedValue([criarUsuario()]);
    mockBuscarAlunos.mockResolvedValue({
      dados: [criarUsuario()],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderAba();

    await screen.findByText('Joao Silva');
    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'jo');

    const botaoVinculado = await screen.findByRole('button', { name: /Vinculado/i });

    expect(botaoVinculado).toBeDisabled();
  });

  it('deve adicionar aluno e recarregar a lista', async () => {
    const user = userEvent.setup();
    const alunoNovo = criarUsuario({ id: 'aluno-2', nome: 'Maria Souza', email: 'maria@aluno.unb.br' });

    mockBuscarAlunos.mockResolvedValue({
      dados: [alunoNovo],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    mockListarAlunosDaTurma
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([criarVinculo({ id: 'vinculo-2', alunoId: 'aluno-2' })]);
    mockBuscarUsuariosPorIds
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([alunoNovo]);

    renderAba();

    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'ma');
    const resultado = await screen.findByText('Maria Souza');
    const itemResultado = resultado.closest('li');

    expect(itemResultado).not.toBeNull();
    await user.click(within(itemResultado!).getByRole('button', { name: /Adicionar/i }));

    expect(mockVincularAlunoTurma).toHaveBeenCalledWith('turma-123', 'aluno-2');
    await waitFor(() => {
      expect(mockListarAlunosDaTurma).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText('Aluno adicionado a turma.')).toBeInTheDocument();
  });

  it('deve mostrar erro ao falhar ao adicionar aluno', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const erro = new Error('Falha ao vincular');
    const alunoNovo = criarUsuario({ id: 'aluno-2', nome: 'Maria Souza', email: 'maria@aluno.unb.br' });

    mockBuscarAlunos.mockResolvedValue({
      dados: [alunoNovo],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    mockVincularAlunoTurma.mockRejectedValue(erro);

    renderAba();

    await user.type(screen.getByPlaceholderText('Buscar aluno'), 'ma');
    const resultado = await screen.findByText('Maria Souza');
    const itemResultado = resultado.closest('li');

    expect(itemResultado).not.toBeNull();
    await user.click(within(itemResultado!).getByRole('button', { name: /Adicionar/i }));

    expect(await screen.findByText('Nao foi possivel adicionar o aluno.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao vincular aluno', erro);

    consoleSpy.mockRestore();
  });

  it('deve remover aluno e recarregar a lista', async () => {
    const user = userEvent.setup();
    mockListarAlunosDaTurma
      .mockResolvedValueOnce([criarVinculo()])
      .mockResolvedValueOnce([]);
    mockBuscarUsuariosPorIds
      .mockResolvedValueOnce([criarUsuario()])
      .mockResolvedValueOnce([]);

    renderAba();

    const aluno = await screen.findByText('Joao Silva');
    const linhaAluno = aluno.closest('tr');

    expect(linhaAluno).not.toBeNull();
    await user.click(within(linhaAluno!).getByRole('button', { name: /Remover/i }));

    expect(mockDesvincularAlunoTurma).toHaveBeenCalledWith('turma-123', 'aluno-1');
    await waitFor(() => {
      expect(mockListarAlunosDaTurma).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText('Nenhum aluno matriculado ainda.')).toBeInTheDocument();
    expect(screen.getByText('Aluno removido da turma.')).toBeInTheDocument();
  });

  it('deve mostrar erro ao falhar ao remover aluno', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const erro = new Error('Falha ao desvincular');
    mockListarAlunosDaTurma.mockResolvedValue([criarVinculo()]);
    mockBuscarUsuariosPorIds.mockResolvedValue([criarUsuario()]);
    mockDesvincularAlunoTurma.mockRejectedValue(erro);

    renderAba();

    const aluno = await screen.findByText('Joao Silva');
    const linhaAluno = aluno.closest('tr');

    expect(linhaAluno).not.toBeNull();
    await user.click(within(linhaAluno!).getByRole('button', { name: /Remover/i }));

    expect(await screen.findByText('Nao foi possivel remover o aluno.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao desvincular aluno', erro);

    consoleSpy.mockRestore();
  });

  it('deve mostrar erro quando carregamento inicial falhar', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const erro = new Error('Falha de rede');
    mockListarAlunosDaTurma.mockRejectedValue(erro);

    renderAba();

    expect(await screen.findByText('Nao foi possivel carregar os alunos da turma.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar alunos da turma', erro);

    consoleSpy.mockRestore();
  });
});
