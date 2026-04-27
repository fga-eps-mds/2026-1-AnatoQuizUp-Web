jest.mock('../../../features/register-student', () => ({
  RegisterStudentForm: () => <form aria-label="register form" />,
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

describe('RegisterPage', () => {
  it('renderiza logo e formulario de cadastro', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByAltText(/Logo AnatoQuizUp/i)).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /register form/i })).toBeInTheDocument();
  });
});
