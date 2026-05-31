import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabelaDesempenhoIndividual } from './TabelaDesempenhoIndividual';
import { buscarDesempenhoIndividual } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import { buscarUsuariosPorIds } from '../../../entities/usuarios/api/usuarioApi';

jest.mock('../../../entities/dashboardTurma/api/dashboardTurmaApi', () => ({
  buscarDesempenhoIndividual: jest.fn(),
}));

jest.mock('../../../entities/usuarios/api/usuarioApi', () => ({
  buscarUsuariosPorIds: jest.fn(),
}));

const mockBuscarIndividual = buscarDesempenhoIndividual as jest.Mock;
const mockBuscarUsuarios = buscarUsuariosPorIds as jest.Mock;

const alunoUsuario = {
  id: 'aluno-1',
  nome: 'João Silva',
  email: 'joao.silva@aluno.unb.br',
  nickname: null,
  perfil: 'ALUNO' as const,
  status: 'ATIVO' as const,
  instituicao: 'UnB',
  curso: 'Medicina',
  semestre: '2026.1',
};

const alunoStats = {
  alunoId: 'aluno-1',
  totalRespondidas: 48,
  totalAcertos: 41,
  taxaAcerto: 85,
  ultimaAtividade: null,
  desempenhoPorTema: [
    { nome: 'Tórax', totalRespondidas: 20, taxaAcerto: 90, status: 'Tranquilo' as const },
  ],
};

describe('TabelaDesempenhoIndividual', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir estado de carregamento enquanto busca os dados', () => {
    mockBuscarIndividual.mockReturnValue(new Promise(() => {}));

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    expect(screen.getByText('Carregando desempenho individual...')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há alunos na turma', async () => {
    mockBuscarIndividual.mockResolvedValue({ alunos: [] });
    mockBuscarUsuarios.mockResolvedValue([]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    expect(await screen.findByText('Nenhum aluno encontrado na turma.')).toBeInTheDocument();
  });

  it('deve renderizar a tabela com dados do aluno', async () => {
    mockBuscarIndividual.mockResolvedValue({ alunos: [alunoStats] });
    mockBuscarUsuarios.mockResolvedValue([alunoUsuario]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    expect(await screen.findByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao.silva@aluno.unb.br')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('deve chamar as APIs corretas ao montar', async () => {
    mockBuscarIndividual.mockResolvedValue({ alunos: [alunoStats] });
    mockBuscarUsuarios.mockResolvedValue([alunoUsuario]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    await screen.findByText('João Silva');

    expect(mockBuscarIndividual).toHaveBeenCalledWith('turma-123');
    expect(mockBuscarUsuarios).toHaveBeenCalledWith(['aluno-1']);
  });

  it('deve abrir o modal ao clicar em um aluno', async () => {
    const user = userEvent.setup();
    mockBuscarIndividual.mockResolvedValue({ alunos: [alunoStats] });
    mockBuscarUsuarios.mockResolvedValue([alunoUsuario]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    await user.click(await screen.findByText('João Silva'));

    expect(screen.getByText('Desempenho por Tema')).toBeInTheDocument();
    expect(screen.getByText('Tórax')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('deve exibir os cards de resumo no modal', async () => {
    const user = userEvent.setup();
    mockBuscarIndividual.mockResolvedValue({ alunos: [alunoStats] });
    mockBuscarUsuarios.mockResolvedValue([alunoUsuario]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    await user.click(await screen.findByText('João Silva'));

    expect(screen.getByText('41')).toBeInTheDocument();
    expect(screen.getAllByText('85%')).toHaveLength(2);
  });

  it('deve fechar o modal ao clicar no botão de fechar', async () => {
    const user = userEvent.setup();
    mockBuscarIndividual.mockResolvedValue({ alunos: [alunoStats] });
    mockBuscarUsuarios.mockResolvedValue([alunoUsuario]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    await user.click(await screen.findByText('João Silva'));

    expect(screen.getByText('Desempenho por Tema')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar detalhes do aluno' }));

    await waitFor(() => {
      expect(screen.queryByText('Desempenho por Tema')).not.toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando o aluno não tem temas respondidos no modal', async () => {
    const user = userEvent.setup();
    mockBuscarIndividual.mockResolvedValue({
      alunos: [{ ...alunoStats, desempenhoPorTema: [] }],
    });
    mockBuscarUsuarios.mockResolvedValue([alunoUsuario]);

    render(<TabelaDesempenhoIndividual turmaId="turma-123" />);

    await user.click(await screen.findByText('João Silva'));

    expect(screen.getByText('Nenhuma questão respondida ainda.')).toBeInTheDocument();
  });
});
