jest.mock('../../../../../src/features/register-professor', () => ({
  RegisterProfessorForm: () => <form aria-label="register professor form" />,
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfessorRegisterPage } from '../../../../../src/pages/professor-register/ui/ProfessorRegisterPage';

describe('ProfessorRegisterPage', () => {
  it('renderiza logo e formulario de cadastro do professor', () => {
    render(
      <MemoryRouter>
        <ProfessorRegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByAltText(/Logo AnatoQuizUp/i)).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /register professor form/i })).toBeInTheDocument();
  });
});
