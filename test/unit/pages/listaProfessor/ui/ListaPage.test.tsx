import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ListaPage } from '../../../../../src/pages/lista-professor/ui/ListaPage';

jest.mock('../../../../../src/features/manage-lista/ListarListas', () => ({
  ListarListas: () => <div data-testid="mock-listar-listas">ListarListas Mock</div>,
}));

describe('ListaPage', () => {
  it('deve renderizar o header e a feature de ListarListas', () => {
    render(<ListaPage />);

    expect(screen.getByText('Listas de Questões')).toBeInTheDocument();
    expect(screen.getByText('Monte listas e organize as questões. A publicação para alunos acontece em Turmas.')).toBeInTheDocument();

    expect(screen.getByTestId('mock-listar-listas')).toBeInTheDocument();
  });
});