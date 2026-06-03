jest.mock('../../shared/config/env', () => ({
  API_BASE_URL: 'http://localhost:4000/api/v1',
  USE_MOCKS: false,
}));

jest.mock('./ModalLista', () => ({
  ModalLista: ({
    isOpen,
    mode,
    lista,
    onSubmit,
  }: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    lista: { nome?: string } | null;
    onSubmit: (nome: string) => void | Promise<void>;
  }) => (
    isOpen ? (
      <div data-testid="modal-lista">
        <span>{mode}</span>
        <span>{lista?.nome ?? 'nova'}</span>
        <button type="button" onClick={() => void onSubmit(mode === 'create' ? 'Nova Lista Teste' : 'Lista Editada')}>
          Salvar lista mock
        </button>
      </div>
    ) : null
  ),
}));

jest.mock('./ModalGerenciarQuestoesLista', () => ({
  ModalGerenciarQuestoesLista: ({
    isOpen,
    lista,
  }: {
    isOpen: boolean;
    lista: { nome?: string } | null;
  }) => (
    isOpen ? <div data-testid="modal-questoes-lista">{lista?.nome}</div> : null
  ),
}));

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ListarListas } from './ListarListas';
import {
  atualizarLista,
  criarLista,
  excluirLista,
  listarListas,
  baixarPdfLista
} from '../../entities/lista/api/listaApi';
import type { ListaQuestao } from '../../entities/lista/model/types';

jest.mock('../../entities/lista/api/listaApi');

const mockedListar = listarListas as jest.MockedFunction<typeof listarListas>;
const mockedCriar = criarLista as jest.MockedFunction<typeof criarLista>;
const mockedAtualizar = atualizarLista as jest.MockedFunction<typeof atualizarLista>;
const mockedExcluir = excluirLista as jest.MockedFunction<typeof excluirLista>;

const listaBase: ListaQuestao = {
  id: '1',
  nome: 'Lista 1',
  quantidadeQuestoes: 5,
  status: 'RASCUNHO',
  turmas: [],
  criadoEm: '22/05/2026',
};

describe('ListarListas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedListar.mockResolvedValue([listaBase]);
  });

  it('deve exibir mensagem de carregamento e depois as listas da API', async () => {
    render(<ListarListas />);

    expect(screen.getByText('Carregando listas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Lista 1')).toBeInTheDocument();
      expect(screen.getByText('5 questao(oes)')).toBeInTheDocument();
      expect(screen.getAllByText('Rascunho')).toHaveLength(2);
    });
  });

  it('deve buscar listas usando filtros de busca e status', async () => {
    render(<ListarListas />);

    await screen.findByText('Lista 1');

    fireEvent.change(screen.getByLabelText('Buscar lista'), {
      target: { value: 'Neuro' },
    });
    fireEvent.change(screen.getByLabelText('Filtrar listas por status'), {
      target: { value: 'PUBLICADA' },
    });

    await waitFor(() => {
      expect(mockedListar).toHaveBeenLastCalledWith({
        busca: 'Neuro',
        status: 'PUBLICADA',
      });
    });
  });

  it('deve criar uma lista pela modal de cadastro', async () => {
    mockedCriar.mockResolvedValue({ ...listaBase, id: '2', nome: 'Nova Lista Teste' });

    render(<ListarListas />);

    await screen.findByText('Lista 1');

    fireEvent.click(screen.getByRole('button', { name: /Nova lista/i }));
    expect(screen.getByTestId('modal-lista')).toHaveTextContent('create');

    fireEvent.click(screen.getByText('Salvar lista mock'));

    await waitFor(() => {
      expect(mockedCriar).toHaveBeenCalledWith({ nome: 'Nova Lista Teste' });
    });
  });

  it('deve editar uma lista pela modal de edicao', async () => {
    mockedAtualizar.mockResolvedValue({ ...listaBase, nome: 'Lista Editada' });

    render(<ListarListas />);

    await screen.findByText('Lista 1');

    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    expect(screen.getByTestId('modal-lista')).toHaveTextContent('Lista 1');

    fireEvent.click(screen.getByText('Salvar lista mock'));

    await waitFor(() => {
      expect(mockedAtualizar).toHaveBeenCalledWith('1', { nome: 'Lista Editada' });
    });
  });

  it('deve abrir a modal de vincular e desvincular questoes', async () => {
    render(<ListarListas />);

    await screen.findByText('Lista 1');

    fireEvent.click(screen.getByRole('button', { name: /5 questao\(oes\)/i }));

    expect(screen.getByTestId('modal-questoes-lista')).toHaveTextContent('Lista 1');
  });

  it('nao deve permitir publicar lista pela tela de listas', async () => {
    render(<ListarListas />);

    await screen.findByText('Lista 1');

    expect(screen.queryByRole('button', { name: /Turmas/i })).not.toBeInTheDocument();
  });

  it('deve iniciar o download do PDF e mostrar o toast de carregamento', async () => {
    window.URL.createObjectURL = jest.fn().mockReturnValue('blob:http://localhost/mock-url');
    window.URL.revokeObjectURL = jest.fn();

    (baixarPdfLista as jest.Mock).mockResolvedValue('base64-falsa-para-teste');

    render(<ListarListas />);
    
    await screen.findByText('Lista 1');

    fireEvent.click(screen.getByRole('button', { name: /PDF/i }));

    expect(screen.getByText('Gerando PDF...')).toBeInTheDocument();

    await waitFor(() => {
      expect(baixarPdfLista).toHaveBeenCalledWith('1');
    });
  });

  it('deve abrir o modal de exclusao e excluir a lista', async () => {
    mockedListar.mockResolvedValueOnce([listaBase]).mockResolvedValueOnce([]);
    mockedExcluir.mockResolvedValueOnce();

    render(<ListarListas />);

    await screen.findByText('Lista 1');

    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));

    expect(screen.getByText('Excluir lista?')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Excluir/i })[1]);

    await waitFor(() => {
      expect(mockedExcluir).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(screen.queryByText('Lista 1')).not.toBeInTheDocument();
      expect(screen.getByText('Nenhuma lista encontrada.')).toBeInTheDocument();
    });
  });
});
