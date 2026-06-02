import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmigosPage } from './AmigosPage';

describe('AmigosPage', () => {
  it('renderiza a pagina de rede do aluno', () => {
    render(<AmigosPage />);

    expect(screen.getByRole('heading', { name: /Minha Rede/i })).toBeInTheDocument();
    expect(screen.getByText(/Busque colegas, gerencie convites/i)).toBeInTheDocument();
    expect(screen.getByText('amigos')).toBeInTheDocument();
    expect(screen.getByText('convites pendentes')).toBeInTheDocument();
    expect(screen.getByText('Perfil visivel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buscar colegas/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /Buscar colegas/i })).toBeInTheDocument();
  });

  it('alterna entre as abas da tela', async () => {
    const user = userEvent.setup();

    render(<AmigosPage />);

    await user.click(screen.getByRole('button', { name: /Convites/i }));

    expect(screen.getByRole('button', { name: /Convites/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /Convites recebidos/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Meus amigos/i }));

    expect(screen.getByRole('button', { name: /Meus amigos/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('heading', { name: /Meus amigos/i })).toBeInTheDocument();
  });
});
