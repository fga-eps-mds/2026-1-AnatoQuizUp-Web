jest.mock('../model/recoverPasswordService', () => ({
  requestPasswordRecovery: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { requestPasswordRecovery } from '../model/recoverPasswordService';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const requestPasswordRecoveryMock = requestPasswordRecovery as jest.Mock;

const renderForm = () =>
  render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>,
  );

describe('ForgotPasswordForm', () => {
  afterEach(() => {
    requestPasswordRecoveryMock.mockReset();
  });

  it('shows backend success message after submitting email', async () => {
    const testUser = userEvent.setup();
    requestPasswordRecoveryMock.mockResolvedValueOnce(
      'Se o email existir no sistema, enviamos instrucoes.',
    );

    renderForm();

    await testUser.type(screen.getByLabelText(/Email/i), 'aluno@unb.br');
    await testUser.click(screen.getByRole('button', { name: /Enviar instrucoes/i }));

    expect(requestPasswordRecoveryMock).toHaveBeenCalledWith('aluno@unb.br');
    expect(
      await screen.findByText('Se o email existir no sistema, enviamos instrucoes.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para o login/i })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('validates required email locally', async () => {
    const testUser = userEvent.setup();

    renderForm();

    await testUser.click(screen.getByRole('button', { name: /Enviar instrucoes/i }));

    expect(screen.getByText('Email e obrigatorio.')).toBeInTheDocument();
    expect(requestPasswordRecoveryMock).not.toHaveBeenCalled();
  });

  it('shows backend error message when request fails', async () => {
    const testUser = userEvent.setup();
    requestPasswordRecoveryMock.mockRejectedValueOnce(
      new Error('Nao foi possivel enviar as instrucoes de recuperacao.'),
    );

    renderForm();

    await testUser.type(screen.getByLabelText(/Email/i), 'aluno@unb.br');
    await testUser.click(screen.getByRole('button', { name: /Enviar instrucoes/i }));

    expect(
      await screen.findByText('Nao foi possivel enviar as instrucoes de recuperacao.'),
    ).toBeInTheDocument();
  });
});
