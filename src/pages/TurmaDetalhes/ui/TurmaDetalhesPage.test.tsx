import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TurmaDetalhesPage } from '../index'; 
import { buscarTurmaPorId } from '../../../entities/turmas/api/turmaApi';
import {
  buscarDashboardMacro,
  buscarDesempenhoPorListas,
  buscarDesempenhoIndividual,
} from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import {
  atualizarVinculoListaTurma,
  listarVinculosDaTurma,
} from '../../../entities/lista/api/listaApi';

jest.mock('../../../entities/turmas/api/turmaApi', () => ({
  buscarTurmaPorId: jest.fn(),
}));

jest.mock('../../../entities/dashboardTurma/api/dashboardTurmaApi', () => ({
  buscarDashboardMacro: jest.fn(),
  buscarDesempenhoPorListas: jest.fn(),
  buscarDesempenhoIndividual: jest.fn(),
}));

jest.mock('../../../entities/lista/api/listaApi', () => ({
  atualizarVinculoListaTurma: jest.fn(),
  listarVinculosDaTurma: jest.fn(),
}));

jest.mock('../../../entities/usuarios/api/usuarioApi', () => ({
  buscarUsuariosPorIds: jest.fn(),
}));

jest.mock('../../../features/manage-turmas/ui/ModalVincularLista', () => ({
  ModalVincularLista: ({
    isOpen,
    turma,
    onClose,
    onAfterChange,
    onFeedback,
  }: {
    isOpen: boolean;
    turma: { nome: string } | null;
    onClose: () => void;
    onAfterChange: () => void;
    onFeedback: (message: string, type: 'success' | 'error') => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label="Modal de vincular lista">
        <span>Modal aberto para {turma?.nome}</span>
        <button type="button" onClick={onAfterChange}>
          Simular alteracao listas
        </button>
        <button type="button" onClick={() => onFeedback('Lista vinculada com sucesso.', 'success')}>
          Simular feedback
        </button>
        <button type="button" onClick={onClose}>
          Fechar modal
        </button>
      </div>
    ) : null,
}));

jest.mock('../../../features/manage-turmas/ui/AbaAlunos', () => ({
  AbaAlunos: ({ turmaId }: { turmaId: string }) => (
    <div data-testid="aba-alunos">Aba alunos da turma {turmaId}</div>
  ),
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
    (buscarDesempenhoIndividual as jest.Mock).mockResolvedValue({ alunos: [] });
    (buscarDesempenhoPorListas as jest.Mock).mockResolvedValue([]);
    (atualizarVinculoListaTurma as jest.Mock).mockResolvedValue({
      id: 'vinculo-1',
      listaQuestaoId: 'lista-1',
      nome: 'Simulado de Anatomia',
      quantidadeQuestoes: 12,
      prazo: '2026-06-10T23:59:00.000Z',
      gabaritoLiberado: true,
    });
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([]);
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

  it('deve exibir o card de desempenho por lista no dashboard', async () => {
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (buscarDesempenhoPorListas as jest.Mock).mockResolvedValue([
      {
        listaTurmaId: 'lista-turma-1',
        nomeLista: 'Simulado de Anatomia',
        totalAlunos: 18,
        totalSubmeteram: 11,
        totalPendentes: 7,
        taxaMediaAcerto: 73.4,
        prazo: '2099-06-10T23:59:00.000Z',
      },
    ]);

    renderWithRouter();

    expect(await screen.findByRole('heading', { name: 'Turma A' })).toBeInTheDocument();
    expect(await screen.findByText('Simulado de Anatomia')).toBeInTheDocument();
    expect(buscarDesempenhoPorListas).toHaveBeenCalledWith('turma-123');
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('73,4%')).toBeInTheDocument();
    expect(screen.queryByText(/Listas Vinculadas/i)).not.toBeInTheDocument();
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
    expect(await screen.findByText('Nenhuma lista publicada nesta turma.')).toBeInTheDocument();
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
    expect(screen.getByTestId('aba-alunos')).toHaveTextContent('Aba alunos da turma turma-123');
  });

  it('deve listar as listas publicadas da turma na aba Listas', async () => {
    const user = userEvent.setup();
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([
      {
        id: 'vinculo-1',
        listaQuestaoId: 'lista-1',
        nome: 'Simulado de Anatomia',
        quantidadeQuestoes: 12,
        prazo: '2026-06-10T23:59:00.000Z',
        gabaritoLiberado: true,
      },
    ]);

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));

    expect(await screen.findByText('Simulado de Anatomia')).toBeInTheDocument();
    expect(listarVinculosDaTurma).toHaveBeenCalledWith('turma-123');
    expect(screen.getByText('12 questao(oes)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gabarito liberado/i })).toBeInTheDocument();
  });

  it('deve liberar o gabarito inline na aba Listas', async () => {
    const user = userEvent.setup();
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([
      {
        id: 'vinculo-1',
        listaQuestaoId: 'lista-1',
        nome: 'Simulado de Anatomia',
        quantidadeQuestoes: 12,
        prazo: null,
        gabaritoLiberado: false,
      },
    ]);
    (atualizarVinculoListaTurma as jest.Mock).mockResolvedValue({
      id: 'vinculo-1',
      listaQuestaoId: 'lista-1',
      nome: 'Simulado de Anatomia',
      quantidadeQuestoes: 12,
      prazo: null,
      gabaritoLiberado: true,
    });

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));
    await user.click(await screen.findByRole('button', { name: /Gabarito oculto/i }));

    expect(atualizarVinculoListaTurma).toHaveBeenCalledWith('lista-1', 'turma-123', {
      gabaritoLiberado: true,
    });
    expect(await screen.findByRole('button', { name: /Gabarito liberado/i })).toBeInTheDocument();
    expect(screen.getByText('Gabarito liberado para a turma.')).toBeInTheDocument();
  });

  it('deve ocultar o gabarito inline na aba Listas', async () => {
    const user = userEvent.setup();
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([
      {
        id: 'vinculo-1',
        listaQuestaoId: 'lista-1',
        nome: 'Simulado de Anatomia',
        quantidadeQuestoes: 12,
        prazo: null,
        gabaritoLiberado: true,
      },
    ]);
    (atualizarVinculoListaTurma as jest.Mock).mockResolvedValue({
      id: 'vinculo-1',
      listaQuestaoId: 'lista-1',
      nome: 'Simulado de Anatomia',
      quantidadeQuestoes: 12,
      prazo: null,
      gabaritoLiberado: false,
    });

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));
    await user.click(await screen.findByRole('button', { name: /Gabarito liberado/i }));

    expect(atualizarVinculoListaTurma).toHaveBeenCalledWith('lista-1', 'turma-123', {
      gabaritoLiberado: false,
    });
    expect(await screen.findByRole('button', { name: /Gabarito oculto/i })).toBeInTheDocument();
    expect(screen.getByText('Gabarito ocultado para a turma.')).toBeInTheDocument();
  });

  it('deve mostrar loading enquanto atualiza o gabarito inline', async () => {
    const user = userEvent.setup();
    let resolverAtualizacao!: (value: unknown) => void;
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([
      {
        id: 'vinculo-1',
        listaQuestaoId: 'lista-1',
        nome: 'Simulado de Anatomia',
        quantidadeQuestoes: 12,
        prazo: null,
        gabaritoLiberado: false,
      },
    ]);
    (atualizarVinculoListaTurma as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolverAtualizacao = resolve;
      }),
    );

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));
    await user.click(await screen.findByRole('button', { name: /Gabarito oculto/i }));

    expect(screen.getByRole('button', { name: /Atualizando/i })).toBeDisabled();

    resolverAtualizacao({
      id: 'vinculo-1',
      listaQuestaoId: 'lista-1',
      nome: 'Simulado de Anatomia',
      quantidadeQuestoes: 12,
      prazo: null,
      gabaritoLiberado: true,
    });

    expect(await screen.findByRole('button', { name: /Gabarito liberado/i })).toBeInTheDocument();
  });

  it('deve exibir empty state quando nao houver listas publicadas', async () => {
    const user = userEvent.setup();
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([]);

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));

    expect(await screen.findByText('Nenhuma lista publicada nesta turma.')).toBeInTheDocument();
  });

  it('deve abrir o modal de vincular lista e recarregar vinculos apos alteracao', async () => {
    const user = userEvent.setup();
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockResolvedValue([]);

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));
    await screen.findByText('Nenhuma lista publicada nesta turma.');
    await user.click(screen.getByRole('button', { name: /Vincular lista/i }));

    expect(screen.getByRole('dialog', { name: 'Modal de vincular lista' })).toBeInTheDocument();
    expect(screen.getByText('Modal aberto para Turma A')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Simular alteracao listas/i }));

    await waitFor(() => {
      expect(listarVinculosDaTurma).toHaveBeenCalledTimes(2);
    });
  });

  it('deve mostrar erro ao falhar no carregamento das listas publicadas', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const erroAPI = new Error('Falha ao listar vinculos');
    (buscarTurmaPorId as jest.Mock).mockResolvedValue(mockTurma);
    (buscarDashboardMacro as jest.Mock).mockResolvedValue(mockDashboard);
    (listarVinculosDaTurma as jest.Mock).mockRejectedValue(erroAPI);

    renderWithRouter();
    await screen.findByRole('heading', { name: 'Turma A' });

    await user.click(screen.getByRole('button', { name: /^Listas$/i }));

    expect(
      await screen.findByText('Nao foi possivel carregar as listas publicadas.'),
    ).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Erro ao carregar listas da turma', erroAPI);

    consoleSpy.mockRestore();
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
