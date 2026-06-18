import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';

import { NotFoundPage } from './NotFoundPage';

jest.mock(
  '../../../shared/assets/image/logo.png',
  () => 'logo-anatoquizup.png',
);

describe('NotFoundPage', () => {
  it('deve exibir a mensagem de página não encontrada', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Página não encontrada',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('404')).toBeInTheDocument();

    expect(
      screen.getByText(
        /a página que você procura não existe ou foi movida/i,
      ),
    ).toBeInTheDocument();
  });

  it('deve navegar para a home ao clicar em voltar ao início', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <Routes>
          <Route path="/home" element={<p>Página inicial</p>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole('link', {
        name: /voltar ao início/i,
      }),
    );

    expect(screen.getByText('Página inicial')).toBeInTheDocument();
  });
});