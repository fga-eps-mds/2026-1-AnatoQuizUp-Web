import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buscarDesempenhoPorListas } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import { CardDesempenhoListas } from './CardDesempenhoListas';

jest.mock('../../../entities/dashboardTurma/api/dashboardTurmaApi', () => ({
  buscarDesempenhoPorListas: jest.fn(),
}));

const mockedBuscarDesempenhoPorListas = jest.mocked(buscarDesempenhoPorListas);

describe('CardDesempenhoListas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar e exibir desempenho por lista', async () => {
    mockedBuscarDesempenhoPorListas.mockResolvedValue([
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

    render(<CardDesempenhoListas turmaId="turma-123" />);

    expect(screen.getByText('Carregando desempenho por lista...')).toBeInTheDocument();

    const lista = await screen.findByText('Simulado de Anatomia');
    const item = lista.closest('li');

    expect(mockedBuscarDesempenhoPorListas).toHaveBeenCalledWith('turma-123');
    expect(screen.getByText('1 lista(s) publicada(s)')).toBeInTheDocument();
    expect(item).not.toBeNull();
    expect(within(item!).getByText('11')).toBeInTheDocument();
    expect(within(item!).getByText('7')).toBeInTheDocument();
    expect(within(item!).getByText('73,4%')).toBeInTheDocument();
  });

  it('deve exibir lista publicada sem submissoes com taxa vazia', async () => {
    mockedBuscarDesempenhoPorListas.mockResolvedValue([
      {
        listaTurmaId: 'lista-turma-1',
        nomeLista: 'Lista sem respostas',
        totalAlunos: 18,
        totalSubmeteram: 0,
        totalPendentes: 18,
        taxaMediaAcerto: 0,
        prazo: null,
      },
    ]);

    render(<CardDesempenhoListas turmaId="turma-123" />);

    const lista = await screen.findByText('Lista sem respostas');
    const item = lista.closest('li');

    expect(item).not.toBeNull();
    expect(within(item!).getByText('0')).toBeInTheDocument();
    expect(within(item!).getByText('18')).toBeInTheDocument();
    expect(within(item!).getByText('-')).toBeInTheDocument();
    expect(within(item!).getByText('Sem prazo')).toBeInTheDocument();
  });

  it('deve destacar prazo expirado', async () => {
    mockedBuscarDesempenhoPorListas.mockResolvedValue([
      {
        listaTurmaId: 'lista-turma-1',
        nomeLista: 'Lista expirada',
        totalAlunos: 10,
        totalSubmeteram: 4,
        totalPendentes: 6,
        taxaMediaAcerto: 50,
        prazo: '2000-01-01T00:00:00.000Z',
      },
    ]);

    render(<CardDesempenhoListas turmaId="turma-123" />);

    expect(await screen.findByText('Prazo expirado')).toBeInTheDocument();
  });

  it('deve lidar com prazo invalido e total de alunos zerado', async () => {
    mockedBuscarDesempenhoPorListas.mockResolvedValue([
      {
        listaTurmaId: 'lista-turma-1',
        nomeLista: 'Lista com prazo invalido',
        totalAlunos: 0,
        totalSubmeteram: 1,
        totalPendentes: 0,
        taxaMediaAcerto: 100,
        prazo: 'data invalida',
      },
    ]);

    render(<CardDesempenhoListas turmaId="turma-123" />);

    const lista = await screen.findByText('Lista com prazo invalido');
    const item = lista.closest('li');

    expect(item).not.toBeNull();
    expect(within(item!).getByText('data invalida')).toBeInTheDocument();
    expect(within(item!).getByText('100%')).toBeInTheDocument();
  });

  it('deve exibir empty state quando nao houver listas publicadas', async () => {
    mockedBuscarDesempenhoPorListas.mockResolvedValue([]);

    render(<CardDesempenhoListas turmaId="turma-123" />);

    expect(await screen.findByText('Nenhuma lista publicada nesta turma.')).toBeInTheDocument();
  });

  it('deve exibir erro e tentar carregar novamente', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockedBuscarDesempenhoPorListas
      .mockRejectedValueOnce(new Error('Falha ao carregar'))
      .mockResolvedValueOnce([]);

    render(<CardDesempenhoListas turmaId="turma-123" />);

    expect(
      await screen.findByText('Nao foi possivel carregar o desempenho por lista.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    expect(await screen.findByText('Nenhuma lista publicada nesta turma.')).toBeInTheDocument();
    expect(mockedBuscarDesempenhoPorListas).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });
});
