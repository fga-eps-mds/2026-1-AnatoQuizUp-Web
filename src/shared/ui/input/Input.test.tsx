import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Shared/Input', () => {
  it('deve renderizar a label e o input', () => {
    render(<Input label="Nome" placeholder="Digite seu nome" />);
    expect(screen.getByText(/nome/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/digite seu nome/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando a prop error for passada', () => {
    render(<Input label="Email" error="Email inválido" />);
    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('deve disparar onChange ao digitar', () => {
    const handleChange = jest.fn();
    render(<Input label="Teste" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'novo valor' } });
    expect(handleChange).toHaveBeenCalled();
  });
});