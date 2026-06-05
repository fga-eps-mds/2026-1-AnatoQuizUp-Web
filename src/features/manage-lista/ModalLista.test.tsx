import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalLista } from './ModalLista';
import type { ListaQuestao } from '../../entities/lista/model/types';

describe('ModalLista', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockLista: ListaQuestao = {
    id: 'lista-1', nome: 'Simulado Editado', quantidadeQuestoes: 5, status: 'RASCUNHO', turmas: [], criadoEm: '', questoes: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve renderizar se isOpen for falso', () => {
    const { container } = render(
      <ModalLista isOpen={false} mode="create" lista={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar corretamente no modo de criacao e desabilitar botao inicial', () => {
    render(<ModalLista isOpen={true} mode="create" lista={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Nova lista')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar lista/i })).toBeDisabled();
  });

  it('deve submeter o form com sucesso removendo espacos (trim)', async () => {
    render(<ModalLista isOpen={true} mode="create" lista={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Ex: Simulado de Anatomia - 2026.1');
    fireEvent.change(input, { target: { value: '   Lista Trimmed   ' } });
    
    const btnSubmit = screen.getByRole('button', { name: /Criar lista/i });
    expect(btnSubmit).not.toBeDisabled();
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Lista Trimmed');
    });
  });

  it('não deve acionar onSubmit se o form for invalido ou estiver carregando', () => {
    const { rerender } = render(
      <ModalLista isOpen={true} mode="create" lista={null} onClose={mockOnClose} onSubmit={mockOnSubmit} />
    );

    // Form vazio (invalido)
    fireEvent.submit(screen.getByRole('dialog'));
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Com loading
    const input = screen.getByPlaceholderText('Ex: Simulado de Anatomia - 2026.1');
    fireEvent.change(input, { target: { value: 'Valido' } });
    rerender(<ModalLista isOpen={true} mode="create" lista={null} isLoading={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    fireEvent.submit(screen.getByRole('dialog'));
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Salvando.../i })).toBeDisabled();
  });

  it('deve preencher o input no modo edicao e fechar pelos botoes', () => {
    render(<ModalLista isOpen={true} mode="edit" lista={mockLista} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
    
    const input = screen.getByDisplayValue('Simulado Editado');
    expect(input).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Fechar modal de lista'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});