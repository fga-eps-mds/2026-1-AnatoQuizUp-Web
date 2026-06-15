jest.mock('../../../../../src/features/auth-by-credencials/ui/LoginForm', () => ({
  LoginForm: () => <form aria-label="login form" />,
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../../../../../src/pages/login/ui/LoginPage';

describe('LoginPage', () => {
  it('renders the mascot and login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByAltText(/Mascote Cérebro/i)).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /login form/i })).toBeInTheDocument();
  });
});
