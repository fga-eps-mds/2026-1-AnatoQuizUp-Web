import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ModalLista } from './ModalLista'; 
import type { ListaQuestao } from '../../entities/lista/model/types';

describe('ModalLista', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  const mockLista: ListaQuestao = {
    id: 'lista-1',
    nome: 'Simulado de Nervos',
    quantidadeQuestoes: 5,
    status: 'RASCUNHO',
    turmas: [],
    criadoEm: '2026-05-24',
    questoes: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não deve renderizar quando isOpen for falso', () => {
    const { container } = render(
      <ModalLista
        isOpen={false}
        mode="create"
        lista={null}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('Modo de Criação (create)', () => {
    it('deve renderizar com título, botão corretos e input vazio', () => {
      render(
        <ModalLista
          isOpen={true}
          mode="create"
          lista={null}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Nova lista')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Simulado de Anatomia - 2026.1')).toHaveValue('');
      
      const btnSubmit = screen.getByRole('button', { name: /Criar lista/i });
      expect(btnSubmit).toBeInTheDocument();
      expect(btnSubmit).toBeDisabled(); 
    });

    it('deve habilitar o botão e submeter limpando os espaços (trim)', async () => {
      render(
        <ModalLista
          isOpen={true}
          mode="create"
          lista={null}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByPlaceholderText('Simulado de Anatomia - 2026.1');
      const btnSubmit = screen.getByRole('button', { name: /Criar lista/i });

      fireEvent.change(input, { target: { value: '   Novo Simulado   ' } });

      expect(btnSubmit).not.toBeDisabled();
      fireEvent.click(btnSubmit);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Novo Simulado');
      });
    });

    it('deve manter o botão desabilitado se digitar apenas espaços', () => {
      render(
        <ModalLista
          isOpen={true}
          mode="create"
          lista={null}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      const input = screen.getByPlaceholderText('Simulado de Anatomia - 2026.1');
      fireEvent.change(input, { target: { value: '      ' } });

      const btnSubmit = screen.getByRole('button', { name: /Criar lista/i });
      expect(btnSubmit).toBeDisabled();
    });
  });

  describe('Modo de Edição (edit)', () => {
    it('deve renderizar com título "Editar" e o nome já preenchido', () => {
      render(
        <ModalLista
          isOpen={true}
          mode="edit"
          lista={mockLista}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText('Editar lista')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Simulado de Anatomia - 2026.1')).toHaveValue('Simulado de Nervos');
      
      const btnSubmit = screen.getByRole('button', { name: /Salvar alteracoes/i });
      expect(btnSubmit).not.toBeDisabled();
    });
  });

  describe('Interações e Estado de Loading', () => {
    it('deve chamar onClose ao clicar no ícone de Fechar (X) ou no botão Cancelar', () => {
      render(
        <ModalLista
          isOpen={true}
          mode="create"
          lista={null}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.click(screen.getByLabelText('Fechar modal de lista'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('deve exibir "Salvando..." e desabilitar inputs/botões durante o isLoading', () => {
      render(
        <ModalLista
          isOpen={true}
          mode="edit"
          lista={mockLista}
          isLoading={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByRole('button', { name: /Salvando.../i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
      expect(screen.getByLabelText('Fechar modal de lista')).toBeDisabled();
    });

    it('não deve acionar onSubmit se o formulário for submetido indevidamente durante o loading', () => {
      const { getByRole } = render(
        <ModalLista
          isOpen={true}
          mode="edit"
          lista={mockLista}
          isLoading={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      fireEvent.submit(getByRole('dialog'));
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});