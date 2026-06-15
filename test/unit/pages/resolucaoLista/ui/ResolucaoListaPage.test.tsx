import { render, screen } from '@testing-library/react';
import { ResponderListaPage } from '../../../../../src/pages/resolucaoLista/index';
import { useParams } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

jest.mock('../../../../../src/features/resolucaoLista/ui/ResponderLista', () => ({
  ResponderLista: () => <div data-testid="responder-lista-mock" />
}));

describe('ResponderListaPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a feature ResponderLista com a key correta', () => {
    (useParams as jest.Mock).mockReturnValue({ turmaId: 't1', listaId: 'l1' });
    
    render(<ResponderListaPage />);
    
    expect(screen.getByTestId('responder-lista-mock')).toBeInTheDocument();
  });
});