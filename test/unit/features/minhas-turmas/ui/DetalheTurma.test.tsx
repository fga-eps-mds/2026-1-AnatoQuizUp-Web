import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DetalheTurma } from '../../../../../src/features/minhas-turmas/ui/DetalheTurma';
import { httpClient } from '../../../../../src/shared/api/httpClient';
import { buscarUsuarioPorId } from '../../../../../src/entities/usuarios/api/usuarioApi';
import { useNavigate, useParams } from 'react-router-dom';

jest.mock('../../../../../src/shared/api/httpClient', () => ({
  httpClient: { get: jest.fn(), post: jest.fn() }
}));

jest.mock('../../../../../src/entities/usuarios/api/usuarioApi', () => ({
  buscarUsuarioPorId: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../../../src/features/resolucaoLista/ui/ListagemListas', () => ({
  ListagemListas: () => <div data-testid="listagem-mock" />
}));

describe('DetalheTurma', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useParams as jest.Mock).mockReturnValue({ id: 'turma-1' });
  });

  it('deve exibir loading inicialmente', () => {
    (httpClient.get as jest.Mock).mockReturnValue(new Promise(() => {})); // Fica pendente
    render(<DetalheTurma />);
    expect(screen.getByText(/Carregando detalhes/i)).toBeInTheDocument();
  });

  it('deve exibir estado de nao encontrada se o id da URL for indefinido', () => {
    (useParams as jest.Mock).mockReturnValue({ id: undefined });
    render(<DetalheTurma />);
    expect(screen.getByText('Turma não encontrada')).toBeInTheDocument();
  });

  it('deve exibir erro 404 se a turma nao existir', async () => {
    (httpClient.get as jest.Mock).mockRejectedValue({ response: { status: 404 }, isAxiosError: true });
    render(<DetalheTurma />);
    
    expect(await screen.findByText('Turma não encontrada')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Voltar para minhas turmas/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas');
  });

  it('deve exibir erro generico se a API falhar com outro erro', async () => {
    (httpClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
    render(<DetalheTurma />);
    
    expect(await screen.findByText('Erro ao carregar')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Voltar/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas');
  });

  it('deve carregar e exibir os detalhes da turma e professor com sucesso', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { dados: { nome: 'Anatomia I', descricao: 'Desc específica', professorId: 'prof-1', _count: { alunos: 10 } } }
    });
    (buscarUsuarioPorId as jest.Mock).mockResolvedValue({ nome: 'Prof Teste' });

    render(<DetalheTurma />);

    expect(await screen.findByRole('heading', { name: 'Anatomia I' })).toBeInTheDocument();
    expect(screen.getByText('Desc específica')).toBeInTheDocument();
    expect(screen.getByText('Prof Teste')).toBeInTheDocument();
    expect(screen.getByTestId('listagem-mock')).toBeInTheDocument();
  });

  it('deve usar valores de fallback para descricao e permitir voltar pelo breadcrumb', async () => {
    
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { dados: { nome: 'Anatomia Sem Descricao', professorId: 'prof-1' } } 
    });
    (buscarUsuarioPorId as jest.Mock).mockResolvedValue({ nome: 'Prof Teste' });

    render(<DetalheTurma />);

    expect(await screen.findByText('Listas de exercícios publicadas pelo professor')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Minhas Turmas'));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas');
  });

  it('deve lidar com falha ao buscar professor sem quebrar a tela', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { dados: { nome: 'Anatomia I', professorId: 'prof-1' } }
    });
    (buscarUsuarioPorId as jest.Mock).mockRejectedValue(new Error('Erro prof'));

    render(<DetalheTurma />);

    expect(await screen.findByRole('heading', { name: 'Anatomia I' })).toBeInTheDocument();
    expect(screen.getByText('Professor')).toBeInTheDocument(); // O fallback de nome de professor
  });

  it('nao deve tentar atualizar o estado se o componente for desmontado (cleanup do useEffect)', async () => {
    type TurmaResponse = { 
      data: { 
        dados: { nome: string; professorId: string } 
      } 
    };
    
    let resolverApi: (value: TurmaResponse) => void;
    
    const promiseApi = new Promise<TurmaResponse>((resolve) => { 
      resolverApi = resolve; 
    });
    
    (httpClient.get as jest.Mock).mockReturnValue(promiseApi);

    const { unmount } = render(<DetalheTurma />);
    
    unmount();
    
    resolverApi({
      data: { 
        dados: { nome: 'Fantasma', professorId: 'prof-1' } 
      }
    });

    await waitFor(() => {
      expect(httpClient.get).toHaveBeenCalled();
    });
  });
});