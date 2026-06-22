import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { ErrorBoundary } from './ErrorBoundary';

jest.mock(
  '../../shared/assets/image/logo.png',
  () => 'logo-anatoquizup.png',
);

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('deve renderizar normalmente quando não houver erro', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <p>Conteúdo carregado</p>
        </ErrorBoundary>
      </MemoryRouter>,
    );

    expect(screen.getByText('Conteúdo carregado')).toBeInTheDocument();
  });

  it('deve exibir o fallback quando ocorrer erro de renderização', () => {
    const ComponenteComErro = () => {
      throw new Error('Erro de teste');
    };

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ComponenteComErro />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Algo deu errado',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /tentar novamente/i,
      }),
    ).toBeInTheDocument();
  });

  it('deve tentar renderizar novamente ao clicar em tentar novamente', async () => {
    const user = userEvent.setup();
    let deveFalhar = true;

    const ComponenteInstavel = () => {
      if (deveFalhar) {
        throw new Error('Erro temporário');
      }

      return <p>Conteúdo recuperado</p>;
    };

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <ComponenteInstavel />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Algo deu errado',
      }),
    ).toBeInTheDocument();

    deveFalhar = false;

    await user.click(
      screen.getByRole('button', {
        name: /tentar novamente/i,
      }),
    );

    expect(screen.getByText('Conteúdo recuperado')).toBeInTheDocument();
  });
});