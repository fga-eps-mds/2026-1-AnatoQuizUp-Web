import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ResponderLista } from './ResponderLista';
import { resolucaoListaApi } from '../../../entities/resolucaoLista/api/resolucaoListaApi';
import { useNavigate, useParams } from 'react-router-dom';

jest.mock('../../../entities/resolucaoLista/api/resolucaoListaApi', () => ({
  resolucaoListaApi: {
    listar: jest.fn(),
    buscarDetalhes: jest.fn(),
    autosave: jest.fn(),
    submeter: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

describe('ResponderLista', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useParams as jest.Mock).mockReturnValue({ turmaId: 't1', listaId: 'l1' });
    
    jest.spyOn(window, 'alert').mockImplementation(() => {}); 
  });

  const mockListaBase = {
    id: 'l1', nome: 'Lista Teste', prazo: null, gabaritoLiberado: false, status: 'PENDENTE',
    questoes: [{ id: 'q1', enunciado: 'Q1', tema: 'T1', alternativas: { A: 'Alt A', B: 'Alt B' }, respostaMarcada: null, respostaCorreta: 'A' }]
  };

  it('deve exibir estado VAZIO se não houver questões e permitir voltar', async () => {
    (resolucaoListaApi.buscarDetalhes as jest.Mock).mockResolvedValue({ ...mockListaBase, questoes: [] });
    render(<ResponderLista />);
    
    expect(await screen.findByText('Esta lista ainda não tem questões')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Voltar para turma/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1');
  });

  it('deve exibir estado BLOQUEADO se expirada e permitir voltar', async () => {
    (resolucaoListaApi.buscarDetalhes as jest.Mock).mockResolvedValue({ ...mockListaBase, status: 'EXPIRADA' });
    render(<ResponderLista />);
    
    expect(await screen.findByText('O prazo desta lista já encerrou')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Voltar para turma/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1');
  });

  it('deve exibir estado BLOQUEADO se já submetida e gabarito oculto', async () => {
    (resolucaoListaApi.buscarDetalhes as jest.Mock).mockResolvedValue({ ...mockListaBase, status: 'SUBMETIDA' });
    render(<ResponderLista />);
    
    expect(await screen.findByText('O gabarito ainda não foi liberado')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Voltar para turma/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1');
  });

  it('deve renderizar GABARITO LIBERADO com acertos/erros, imagem e saiba mais', async () => {
    (resolucaoListaApi.buscarDetalhes as jest.Mock).mockResolvedValue({ 
      ...mockListaBase, gabaritoLiberado: true, status: 'SUBMETIDA', 
      questoes: [{ 
        ...mockListaBase.questoes[0], 
        respostaMarcada: 'B', 
        saibaMais: 'Info extra',
        urlImagem: 'http://imagem.com/teste.jpg' 
      }] 
    });
    render(<ResponderLista />);
    
    expect(await screen.findByText('Gabarito · Lista Teste')).toBeInTheDocument();
    expect(screen.getByText('Sua resposta')).toBeInTheDocument();
    expect(screen.getByText('Correta')).toBeInTheDocument();
    expect(screen.getByText('Info extra')).toBeInTheDocument();
    expect(await screen.findByAltText('Imagem da questão')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Voltar para turma/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1');
  });

  it('fluxo NORMAL: deve permitir responder, autosalvar e submeter via Modal', async () => {
    (resolucaoListaApi.buscarDetalhes as jest.Mock).mockResolvedValue({
      ...mockListaBase, 
      questoes: [
        { id: 'q1', enunciado: 'Q1', tema: 'T1', alternativas: { A: 'Alt A', B: 'Alt B' }, respostaMarcada: null, urlImagem: 'http://img.com/q1.jpg' },
        { id: 'q2', enunciado: 'Q2', tema: 'T1', alternativas: { A: 'Alt A' }, respostaMarcada: null }
      ]
    });
    (resolucaoListaApi.autosave as jest.Mock).mockResolvedValue(null);
    (resolucaoListaApi.submeter as jest.Mock).mockResolvedValue(null);

    render(<ResponderLista />);

    expect(await screen.findByText('Lista Teste')).toBeInTheDocument();
    
    const btnAnterior = screen.getByRole('button', { name: /Anterior/i });
    expect(btnAnterior).toBeDisabled();

    fireEvent.click(screen.getByText('Alt A'));
    await waitFor(() => {
      expect(resolucaoListaApi.autosave).toHaveBeenCalledWith('l1', 'q1', 'A');
    });

    fireEvent.click(screen.getByRole('button', { name: /Próxima/i }));
    expect(await screen.findByText('Q2')).toBeInTheDocument();
    
    const btnProxima = screen.getByRole('button', { name: /Próxima/i });
    expect(btnProxima).toBeDisabled();
    
    fireEvent.click(btnAnterior);
    expect(await screen.findByText('Q1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirmar submissão/i }));
    expect(screen.getByText('Confirmar Submissão')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(screen.queryByText('Confirmar Submissão')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirmar submissão/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sim, submeter/i }));
    
    await waitFor(() => {
      expect(resolucaoListaApi.submeter).toHaveBeenCalledWith('l1');
      expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas/t1');
    });
  });

  it('deve exibir alert de erro se a API falhar ao submeter', async () => {
    (resolucaoListaApi.buscarDetalhes as jest.Mock).mockResolvedValue(mockListaBase);
    (resolucaoListaApi.submeter as jest.Mock).mockRejectedValue(new Error('Erro de envio'));

    render(<ResponderLista />);

    expect(await screen.findByText('Lista Teste')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Confirmar submissão/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sim, submeter/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Erro ao submeter'));
      expect(screen.queryByText('Confirmar Submissão')).not.toBeInTheDocument(); // O modal tem que fechar
    });
  });
});