import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../../../../src/features/dashboard-turmas/ui/EmptyState';

describe('EmptyState', () => {
  it('deve renderizar os textos corretamente', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('Ainda não há dados suficientes')).toBeInTheDocument();
    expect(screen.getByText(/Incentive seus alunos a praticarem as listas/i)).toBeInTheDocument();
  });
});