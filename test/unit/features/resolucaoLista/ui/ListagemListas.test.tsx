import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ListagemListas } from '../../../../../src/features/resolucaoLista/ui/ListagemListas';
import { resolucaoListaApi } from '../../../../../src/entities/resolucaoLista/api/resolucaoListaApi';
import { useNavigate } from 'react-router-dom';

jest.mock('../../../../../src/entities/resolucaoLista/api/resolucaoListaApi', () => ({
  resolucaoListaApi: {
    listar: jest.fn(),
    buscarDetalhes: jest.fn(),
    autosave: jest.fn(),
    submeter: jest.fn(),
    baixarPdfAluno: jest.fn()
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
    jest.restoreAllMocks();
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
      expect(resolucaoListaApi.listar).toHaveBeenCalledWith('t1', undefined, 'Neuro');
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

  it('deve renderizar listas com status EM_ANDAMENTO na aba de Pendentes', async () => {
    const mockListas = [
      { listaTurmaId: 'l-andamento', nome: 'Lista Em Andamento', temas: ['Anatomia'], quantidadeQuestoes: 5, prazo: null, status: 'EM_ANDAMENTO', gabaritoLiberado: false },
    ];
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue(mockListas);

    render(<ListagemListas turmaId="t1" />);
    
    expect(await screen.findByText('Lista Em Andamento')).toBeInTheDocument();
    expect(screen.getByText('Pendentes')).toBeInTheDocument();
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
    expect(screen.getByText(/Prazo: 20\/06\/2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Expirou em 01\/06\/2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Prazo: 10\/06\/2026/i)).toBeInTheDocument();
  });

  it('deve permitir clicar em Gabarito Bloqueado e baixar o PDF inicial', async () => {
    const mockListasData = [
      { listaTurmaId: 'resp-bloq', nome: 'Bloqueada', temas: [], quantidadeQuestoes: 1, prazo: null, status: 'RESPONDIDA', gabaritoLiberado: false },
      { listaTurmaId: 'exp-det', nome: 'Expirada Detalhe', temas: [], quantidadeQuestoes: 1, prazo: null, status: 'EXPIRADA', gabaritoLiberado: false },
    ];
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue(mockListasData);

    render(<ListagemListas turmaId="t1" />);

    await screen.findByText('Bloqueada');

    fireEvent.click(screen.getByRole('button', { name: /Gabarito Bloqueado/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1/listas/resp-bloq');

    const btnBaixarPdf = screen.getByRole('button', { name: /Baixar PDF/i });
    expect(btnBaixarPdf).toBeInTheDocument();
  });

  it('deve disparar um alert se ocorrer um erro durante o download do PDF', async () => {
    const mockListasData = [
      { listaTurmaId: 'l-pdf-erro', nome: 'Lista Erro', temas: [], quantidadeQuestoes: 1, prazo: null, status: 'EXPIRADA', gabaritoLiberado: false },
    ];
    (resolucaoListaApi.listar as jest.Mock).mockResolvedValue(mockListasData);
    (resolucaoListaApi.baixarPdfAluno as jest.Mock).mockRejectedValue(new Error('Erro backend PDF'));

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(jest.fn());
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());

    render(<ListagemListas turmaId="t1" />);
    const btnBaixarPdf = await screen.findByRole('button', { name: /Baixar PDF/i });

    fireEvent.click(btnBaixarPdf);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Erro ao gerar o PDF da lista. Tente novamente mais tarde.');
    });

    expect(screen.getByRole('button', { name: /Baixar PDF/i })).not.toBeDisabled();
  });
});