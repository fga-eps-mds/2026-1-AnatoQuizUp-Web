import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ListaPage } from './ListaPage'

jest.mock('../../../features/manage-lista/ListarListas', () => ({
  ListarListas: () => <div data-testid="mock-listar-listas">ListarListas Mock</div>,
}));

describe('ListasPage', () => {
  it('deve renderizar o header e a feature de ListarListas', () => {
    render(<ListaPage />);

    expect(screen.getByText('Listas de Questões')).toBeInTheDocument();
    expect(screen.getByText('Monte e publique listas para suas turmas')).toBeInTheDocument();

    expect(screen.getByTestId('mock-listar-listas')).toBeInTheDocument();
  });
});