import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Shared/Button', () => {
  it('deve renderizar o conteúdo corretamente', () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByText(/entrar/i)).toBeInTheDocument();
  });

  it('deve chamar a função onClick ao ser clicado', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);
    fireEvent.click(screen.getByText(/clique aqui/i));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando a prop disabled for passada', () => {
    render(<Button disabled>Carregando</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});