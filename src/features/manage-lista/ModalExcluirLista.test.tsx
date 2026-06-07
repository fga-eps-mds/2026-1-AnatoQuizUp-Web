import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalExcluirLista } from './ModalExcluirLista';
import type { ListaQuestao } from '../../entities/lista/model/types';

describe('ModalExcluirLista', () => {
  const mockLista: ListaQuestao = {
    id: 'lista-1',
    nome: 'Simulado Anato',
    quantidadeQuestoes: 10,
    status: 'PUBLICADA',
    turmas: [{ id: 't1', nome: 'Turma A' }],
    criadoEm: '22/05/2026',
    questoes: []
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nao deve renderizar nada se isOpen for falso ou lista for nula', () => {
    const { container } = render(
      <ModalExcluirLista isOpen={false} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    expect(container.firstChild).toBeNull();

    const { container: containerNull } = render(
      <ModalExcluirLista isOpen={true} lista={null} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    expect(containerNull.firstChild).toBeNull();
  });

  it('deve renderizar os detalhes da lista corretamente', () => {
    render(<ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

    expect(screen.getByText('Excluir lista?')).toBeInTheDocument();
    expect(screen.getByText('Simulado Anato')).toBeInTheDocument();
    expect(screen.getByText('10 questao(oes) - 1 turma(s) vinculada(s)')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em Cancelar', () => {
    render(<ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onConfirm com o id da lista ao clicar em Excluir', () => {
    render(<ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /Excluir/i }));
    expect(mockOnConfirm).toHaveBeenCalledWith('lista-1');
  });

  it('deve desabilitar botoes e mudar texto quando isLoading for true', () => {
    render(<ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Excluindo.../i })).toBeDisabled();
  });
});