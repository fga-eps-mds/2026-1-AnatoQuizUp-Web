import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TurmaDetalhesPage } from '../index'; 
import { buscarTurmaPorId } from '../../../entities/turmas/api/turmaApi';
import { buscarDashboardMacro } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';

jest.mock('../../../entities/turmas/api/turmaApi', () => ({
  buscarTurmaPorId: jest.fn(),
}));

jest.mock('../../../entities/dashboardTurma/api/dashboardTurmaApi', () => ({
  buscarDashboardMacro: jest.fn(),
  buscarDesempenhoIndividual: jest.fn(),
}));

jest.mock('../../../entities/usuarios/api/usuarioApi', () => ({
  buscarUsuariosPorIds: jest.fn(),
}));

const mockTurma = {
  id: 'turma-123',
  nome: 'Turma A',
  ano: 2026,
  semestre: '1',
  quantidadeAlunos: 15,
  status: 'ATIVA',
};

const mockDashboard = {
  totalAlunos: 15,
  totalQuestoesRespondidas: 50,
  taxaMediaAcertos: 75,
  desempenhoPorTema: [],
};

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/turmas/turma-123']}>
      <Routes>
        <Route path="/turmas/:id" element={<TurmaDetalhesPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TurmaDetalhesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir o estado de carregamento inicialmente', () => {
    (buscarTurmaPorId as jest.Mock).mockImplementation(() => new Promise(() => {}));
    (buscarDashboardMacro as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderWithRouter();
    expect(screen.getByText('Carregando detalhes da turma...')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro se a turma não for encontrada', async () => {
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(null);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(null);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Turma não encontrada.')).toBeInTheDocument();
    });
  });

  it('deve renderizar os dados da turma e o dashboard com sucesso', async () => {
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);

    renderWithRouter();

    expect(await screen.findByRole('heading', { name: 'Turma A' })).toBeInTheDocument();
    expect(screen.getByText('2026.1')).toBeInTheDocument();
    expect(screen.getByText('Ativa')).toBeInTheDocument();
    
    expect(screen.getByText('50')).toBeInTheDocument(); 
  });

  it('deve exibir o EmptyState se não houver questões respondidas', async () => {
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue({ 
      ...mockDashboard, 
      totalQuestoesRespondidas: 0 
    });

    renderWithRouter();

    expect(await screen.findByText('Ainda não há dados suficientes')).toBeInTheDocument();

    expect(screen.queryByText('Desempenho Individual')).not.toBeInTheDocument();
  });

  it('deve alternar entre as abas e esconder o dashboard', async () => {
    const user = userEvent.setup();
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    const abaAlunos = screen.getByRole('button', { name: /Alunos/i });
    
    await user.click(abaAlunos);

    expect(screen.queryByText('Desempenho Individual')).not.toBeInTheDocument();
  });

  it('deve exibir console.error em caso de falha na API', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const erroAPI = new Error('Falha de rede');
    
    (buscarTurmaPorId as jest.Mock).mockRejectedValue(erroAPI);

    renderWithRouter();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar dados:', erroAPI);
    });

    consoleSpy.mockRestore();
  });
});