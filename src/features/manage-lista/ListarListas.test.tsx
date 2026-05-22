jest.mock('../../shared/config/env', () => ({
  API_BASE_URL: 'http://localhost:4000/api/v1',
  USE_MOCKS: false,
}));

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ListarListas } from './ListarListas';
import { listarListas, excluirLista } from '../../entities/lista/api/listaApi';

jest.mock('../../entities/lista/api/listaApi');
const mockedListar = listarListas as jest.MockedFunction<typeof listarListas>;
const mockedExcluir = excluirLista as jest.MockedFunction<typeof excluirLista>;

window.alert = jest.fn();

describe('ListarListas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir mensagem de carregamento e depois as listas da API', async () => {
    mockedListar.mockResolvedValueOnce([
      { id: '1', nome: 'Lista 1', quantidadeQuestoes: 5, status: 'RASCUNHO', turmas: [], criadoEm: '22/05/2026' }
    ]);

    render(<ListarListas />);

    expect(screen.getByText('Carregando listas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Lista 1')).toBeInTheDocument();
      expect(screen.getByText('5 questões')).toBeInTheDocument();
      expect(screen.getByText('● Rascunho')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal de exclusão e excluir a lista', async () => {
    mockedListar.mockResolvedValueOnce([
      { id: '1', nome: 'Lista para deletar', quantidadeQuestoes: 5, status: 'RASCUNHO', turmas: [], criadoEm: '22/05/2026' }
    ]);
    mockedExcluir.mockResolvedValueOnce();

    render(<ListarListas />);

    await waitFor(() => {
      expect(screen.getByText('Lista para deletar')).toBeInTheDocument();
    });

    const btnExcluir = screen.getByText('Excluir');
    fireEvent.click(btnExcluir);

    expect(screen.getByText('Excluir lista?')).toBeInTheDocument();

    const btnConfirmarExclusao = screen.getAllByText('Excluir')[1]; 
    fireEvent.click(btnConfirmarExclusao);

    await waitFor(() => {
      expect(mockedExcluir).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(screen.queryByText('Lista para deletar')).not.toBeInTheDocument();
      expect(screen.getByText('Nenhuma lista encontrada.')).toBeInTheDocument();
    });
  });
});