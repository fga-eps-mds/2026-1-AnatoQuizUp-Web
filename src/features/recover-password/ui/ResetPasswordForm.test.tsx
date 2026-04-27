jest.mock('../model/recoverPasswordService', () => ({
  resetPassword: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resetPassword } from '../model/recoverPasswordService';
import { ResetPasswordForm } from './ResetPasswordForm';

const resetPasswordMock = resetPassword as jest.Mock;

const renderForm = (route = '/redefinir-senha?token=token-valido') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ResetPasswordForm />
    </MemoryRouter>,
  );

describe('ResetPasswordForm', () => {
  afterEach(() => {
    resetPasswordMock.mockReset();
  });

  it('resets password and shows backend success message', async () => {
    const testUser = userEvent.setup();
    resetPasswordMock.mockResolvedValueOnce('Senha redefinida com sucesso.');

    renderForm();

    await testUser.type(screen.getByLabelText(/^Nova senha$/i), 'senha1234');
    await testUser.type(screen.getByLabelText(/Confirme nova senha/i), 'senha1234');
    await testUser.click(screen.getByRole('button', { name: /Redefinir senha/i }));

    expect(resetPasswordMock).toHaveBeenCalledWith('token-valido', 'senha1234');
    expect(await screen.findByText(/Senha redefinida com sucesso./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir para o login/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('validates password confirmation locally', async () => {
    const testUser = userEvent.setup();

    renderForm();

    await testUser.type(screen.getByLabelText(/^Nova senha$/i), 'senha1234');
    await testUser.type(screen.getByLabelText(/Confirme nova senha/i), 'senha-diferente');
    await testUser.click(screen.getByRole('button', { name: /Redefinir senha/i }));

    expect(screen.getByText('As senhas nao coincidem.')).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it('shows invalid link message when token is missing', async () => {
    renderForm('/redefinir-senha');

    expect(screen.getByText(/Link expirado ou invalido./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Recuperar senha/i })).toHaveAttribute(
      'href',
      '/esqueci-senha',
    );
  });

  it('shows backend error message when token is invalid', async () => {
    const testUser = userEvent.setup();
    resetPasswordMock.mockRejectedValueOnce(new Error('Link expirado ou invalido.'));

    renderForm();

    await testUser.type(screen.getByLabelText(/^Nova senha$/i), 'senha1234');
    await testUser.type(screen.getByLabelText(/Confirme nova senha/i), 'senha1234');
    await testUser.click(screen.getByRole('button', { name: /Redefinir senha/i }));

    expect(await screen.findByText(/Link expirado ou invalido./i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Recuperar senha/i })).toHaveAttribute(
      'href',
      '/esqueci-senha',
    );
  });
});
