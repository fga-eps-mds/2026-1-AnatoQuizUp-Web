jest.mock('../../../../../../../src/features/editar-conta', () => ({
  InformacoesPessoaisForm: () => <section>Form de informações pessoais</section>,
  AlterarSenhaForm: () => <section>Form de alterar senha</section>,
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { EditarPerfilPage } from '../../../../../../../src/pages/aluno/perfil/editar';

describe('EditarPerfilPage', () => {
  it('renderiza titulo, link de volta e os dois forms', () => {
    render(
      <MemoryRouter>
        <EditarPerfilPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Editar informações' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Meu Perfil/i })).toHaveAttribute(
      'href',
      '/aluno/perfil',
    );
    expect(screen.getByText('Form de informações pessoais')).toBeInTheDocument();
    expect(screen.getByText('Form de alterar senha')).toBeInTheDocument();
  });
});
