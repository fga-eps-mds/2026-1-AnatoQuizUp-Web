import { render, screen } from '@testing-library/react';
import { CardsResumo } from './CardsResumo';

describe('CardsResumo', () => {
  it('deve renderizar os dados corretamente quando há questões respondidas', () => {
    const mockDados = {
      totalAlunos: 25,
      totalQuestoesRespondidas: 150,
      taxaMediaAcertos: 85,
      desempenhoPorTema: []
    };

    render(<CardsResumo dados={mockDados} />);

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('deve exibir hífen para taxa de acertos quando não houver questões respondidas', () => {
    const mockDados = {
      totalAlunos: 25,
      totalQuestoesRespondidas: 0, 
      taxaMediaAcertos: 0,
      desempenhoPorTema: []
    };

    render(<CardsResumo dados={mockDados} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});