import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ListagemListas } from './ListagemListas';
import { resolucaoListaApi } from '../../../entities/resolucaoLista/api/resolucaoListaApi';
import { useNavigate } from 'react-router-dom';

jest.mock('../../../entities/resolucaoLista/api/resolucaoListaApi', () => ({
  resolucaoListaApi: {
    listar: jest.fn(),
    buscarDetalhes: jest.fn(),
    autosave: jest.fn(),
    submeter: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({ 
  useNavigate: jest.fn() 
}));

describe('ListagemListas', () => {
  const mockNavigate = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-05T12:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('deve exibir mensagem de erro se a API falhar e permitir tentar novamente', async () => {
    (resolucaoListaApi.listar as jest.Mock).mockRejectedValue(new Error('Erro API'));
    render(<ListagemListas turmaId="t1" />);

    expect(await screen.findByText('Não foi possível carregar as listas')).toBeInTheDocument();
    
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue([]);
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
    
    expect(await screen.findByText('Ainda não há listas por aqui')).toBeInTheDocument();
  });

  it('deve filtrar listas pelo input de busca', async () => {
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue([]);
    render(<ListagemListas turmaId="t1" />);

    const input = await screen.findByPlaceholderText('Buscar por título ou tema');
    fireEvent.change(input, { target: { value: 'Neuro' } });

    await waitFor(() => {
      expect(resolucaoListaApi.listar).toHaveBeenCalledWith(undefined, 'Neuro');
    });
  });

  it('deve renderizar listas pendentes (urgentes e normais), respondidas e expiradas', async () => {
    const mockListas = [
      { listaTurmaId: 'l1', nome: 'Lista Urgente', temas: ['A'], quantidadeQuestoes: 5, prazo: '2026-06-06T12:00:00Z', status: 'PENDENTE', gabaritoLiberado: false },
      { listaTurmaId: 'l2', nome: 'Lista Respondida', temas: [], quantidadeQuestoes: 2, prazo: null, status: 'RESPONDIDA', gabaritoLiberado: true },
      { listaTurmaId: 'l3', nome: 'Lista Expirada', temas: [], quantidadeQuestoes: 1, prazo: '2026-06-01T12:00:00Z', status: 'EXPIRADA', gabaritoLiberado: false },
    ];
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue(mockListas);

    render(<ListagemListas turmaId="t1" />);

    expect(await screen.findByText('Lista Urgente')).toBeInTheDocument();
    expect(screen.getByText('Lista Respondida')).toBeInTheDocument();
    expect(screen.getByText('Lista Expirada')).toBeInTheDocument();

    expect(screen.getByText(/1 dias restantes/i)).toBeInTheDocument();

    const botoesResponder = screen.getAllByRole('button', { name: 'Responder' });
    fireEvent.click(botoesResponder[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1/listas/l1');

    fireEvent.click(screen.getByRole('button', { name: /Ver Gabarito/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1/listas/l2');
  });


  it('deve cobrir os diferentes calculos de prazo (renderInfoRodape)', async () => {
    const mockListasData = [
      { listaTurmaId: 'p1', nome: 'Sem Prazo', temas: [], quantidadeQuestoes: 1, prazo: null, status: 'PENDENTE', gabaritoLiberado: false },
      { listaTurmaId: 'p2', nome: 'Prazo Longo', temas: [], quantidadeQuestoes: 1, prazo: '2026-06-20T12:00:00Z', status: 'PENDENTE', gabaritoLiberado: false },
      { listaTurmaId: 'p3', nome: 'Prazo Vencido Pendente', temas: [], quantidadeQuestoes: 1, prazo: '2026-06-01T12:00:00Z', status: 'PENDENTE', gabaritoLiberado: false },
      { listaTurmaId: 'p4', nome: 'Prazo Respondido', temas: [], quantidadeQuestoes: 1, prazo: '2026-06-10T12:00:00Z', status: 'RESPONDIDA', gabaritoLiberado: false },
    ];
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue(mockListasData);

    render(<ListagemListas turmaId="t1" />);

    expect(await screen.findByText('Sem prazo')).toBeInTheDocument();
    expect(screen.getByText(/Prazo: 20\/06\/2026/i)).toBeInTheDocument(); // Prazo longo (sem os "dias restantes")
    expect(screen.getByText(/Expirou em 01\/06\/2026/i)).toBeInTheDocument(); // Prazo Vencido
    expect(screen.getByText(/Prazo: 10\/06\/2026/i)).toBeInTheDocument(); // Prazo Respondido
  });

  it('deve permitir clicar em Gabarito Bloqueado e Ver Detalhes (Expirada)', async () => {
    const mockListasData = [
      { listaTurmaId: 'resp-bloq', nome: 'Bloqueada', temas: [], quantidadeQuestoes: 1, prazo: null, status: 'RESPONDIDA', gabaritoLiberado: false },
      { listaTurmaId: 'exp-det', nome: 'Expirada Detalhe', temas: [], quantidadeQuestoes: 1, prazo: null, status: 'EXPIRADA', gabaritoLiberado: false },
    ];
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue(mockListasData);

    render(<ListagemListas turmaId="t1" />);

    await screen.findByText('Bloqueada');

    fireEvent.click(screen.getByRole('button', { name: /Gabarito Bloqueado/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1/listas/resp-bloq');

    fireEvent.click(screen.getByRole('button', { name: /Ver Detalhes/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1/listas/exp-det');
  });
});