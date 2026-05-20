import { render, screen } from '@testing-library/react';

jest.mock('../../../../features/minhas-turmas', () => ({
  MinhasTurmas: () => <main>Minhas turmas feature</main>,
}));

import { MinhasTurmasAlunoPage } from './MinhasTurmasAlunoPage';

describe('MinhasTurmasAlunoPage', () => {
  it('renderiza a feature de Minhas Turmas', () => {
    render(<MinhasTurmasAlunoPage />);

    expect(screen.getByText('Minhas turmas feature')).toBeInTheDocument();
  });
});
