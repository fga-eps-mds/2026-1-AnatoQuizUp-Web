import { render, screen } from '@testing-library/react';

jest.mock('../../../../../../src/features/minhas-turmas', () => ({
  DetalheTurma: () => <main>Detalhe turma feature</main>,
}));

import { TurmaDetalheAlunoPage } from '../../../../../../src/pages/aluno/turma/ui/TurmaDetalheAlunoPage';

describe('TurmaDetalheAlunoPage', () => {
  it('renderiza a feature de detalhe da turma', () => {
    render(<TurmaDetalheAlunoPage />);

    expect(screen.getByText('Detalhe turma feature')).toBeInTheDocument();
  });
});
