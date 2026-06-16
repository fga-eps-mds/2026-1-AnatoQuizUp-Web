import { render, screen } from '@testing-library/react';
import { TurmasPage } from '../../../../../src/pages/turma/ui/TurmaPage'; 

jest.mock('../../../../../src/features/manage-turmas/ui/ListarTurmas', () => ({
  ListaTurmas: () => <div data-testid="mock-lista-turmas">Mock da Lista de Turmas</div>,
}));

describe('TurmasPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título principal e a descrição da página', () => {
    render(<TurmasPage />);

    expect(screen.getByRole('heading', { name: 'Turmas' })).toBeInTheDocument();
    
    expect(screen.getByText('Gerencie suas turmas e alunos')).toBeInTheDocument();
  });

  it('deve renderizar o componente da feature ListaTurmas', () => {
    render(<TurmasPage />);

    expect(screen.getByTestId('mock-lista-turmas')).toBeInTheDocument();
  });
});