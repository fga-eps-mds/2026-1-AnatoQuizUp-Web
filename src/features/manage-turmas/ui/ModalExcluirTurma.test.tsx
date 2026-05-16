import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalExcluirTurma } from './ModalExcluirTurma'; 
import type { Turma } from '../../../entities/turmas/model/types';

describe('ModalExcluirTurma', () => {
  const mockTurma: Turma = {
    id: 'turma-123',
    codigo: 'ANAT-01',
    nome: 'Anatomia Sistêmica',
    semestre: '1',
    ano: 2026,
    descricao: 'Turma de Teste',
    status: 'ATIVA',
    quantidadeAlunos: 42,
    criadoEm: '2026-05-16T10:00:00.000Z',
  };

  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve renderizar o modal se isOpen for false', () => {
    const { container } = render(
      <ModalExcluirTurma
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        turma={mockTurma}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('não deve renderizar o modal se a turma for null', () => {
    const { container } = render(
      <ModalExcluirTurma
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        turma={null}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar corretamente os dados da turma quando aberto', () => {
    render(
      <ModalExcluirTurma
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        turma={mockTurma}
      />
    );

    expect(screen.getByText('Excluir turma?')).toBeInTheDocument();
    
    expect(screen.getByText('Anatomia Sistêmica · 2026.1 · 42 alunos')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão Cancelar', async () => {
    const user = userEvent.setup();
    render(
      <ModalExcluirTurma
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        turma={mockTurma}
      />
    );

    const btnCancelar = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(btnCancelar);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('deve chamar onConfirm ao clicar no botão Excluir', async () => {
    const user = userEvent.setup();
    render(
      <ModalExcluirTurma
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        turma={mockTurma}
      />
    );

    const btnExcluir = screen.getByRole('button', { name: 'Excluir' });
    await user.click(btnExcluir);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('deve desabilitar os botões e mudar o texto quando isLoading for true', () => {
    render(
      <ModalExcluirTurma
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        turma={mockTurma}
        isLoading={true}
      />
    );

    const btnCancelar = screen.getByRole('button', { name: /Cancelar/i });
    const btnExcluir = screen.getByRole('button', { name: /Excluindo\.\.\./i });

    expect(btnCancelar).toBeDisabled();
    expect(btnExcluir).toBeDisabled();
  });
});