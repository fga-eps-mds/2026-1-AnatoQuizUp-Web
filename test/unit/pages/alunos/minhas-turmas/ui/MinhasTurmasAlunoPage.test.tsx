import { render, screen } from '@testing-library/react';

jest.mock('../../../../../../src/features/minhas-turmas', () => ({
  MinhasTurmas: () => <main>Minhas turmas feature</main>,
}));

import { MinhasTurmasAlunoPage } from '../../../../../../src/pages/aluno/minhas-turmas/ui/MinhasTurmasAlunoPage';

describe('MinhasTurmasAlunoPage', () => {
  it('renderiza a feature de Minhas Turmas', () => {
    render(<MinhasTurmasAlunoPage />);

    expect(screen.getByText('Minhas turmas feature')).toBeInTheDocument();
  });
});
