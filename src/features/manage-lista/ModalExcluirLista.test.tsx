import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalExcluirLista } from './ModalExcluirLista';
import type { ListaQuestao } from '../../../entities/listas/model/types';

describe('ModalExcluirLista', () => {
  const mockLista: ListaQuestao = {
    id: '1',
    nome: 'Simulado Anato',
    quantidadeQuestoes: 10,
    status: 'PUBLICADA',
    turmas: [{ id: 't1', nome: 'Turma A' }],
    criadoEm: '22/05/2026',
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve renderizar nada se isOpen for falso', () => {
    const { container } = render(
      <ModalExcluirLista isOpen={false} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar os detalhes da lista corretamente', () => {
    render(
      <ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    expect(screen.getByText('Excluir lista?')).toBeInTheDocument();
    expect(screen.getByText('Simulado Anato')).toBeInTheDocument();
    expect(screen.getByText('10 questões · 1 turma(s) vinculada(s)')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em Cancelar', () => {
    render(
      <ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve chamar onConfirm com o id da lista ao clicar em Excluir', () => {
    render(
      <ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    fireEvent.click(screen.getByText('Excluir'));
    expect(mockOnConfirm).toHaveBeenCalledWith('1');
  });

  it('deve desabilitar botões quando isLoading for true', () => {
    render(
      <ModalExcluirLista isOpen={true} lista={mockLista} onClose={mockOnClose} onConfirm={mockOnConfirm} isLoading={true} />
    );

    expect(screen.getByText('Cancelar')).toBeDisabled();
    expect(screen.getByText('Excluindo...')).toBeDisabled();
  });
});