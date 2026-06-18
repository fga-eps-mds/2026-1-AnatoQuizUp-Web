jest.mock('../../../../../src/features/editar-conta/model/editarContaService', () => {
  class SenhaAtualIncorretaError extends Error {
    constructor(message = 'Senha atual incorreta.') {
      super(message);
      this.name = 'SenhaAtualIncorretaError';
    }
  }

  return {
    alterarSenha: jest.fn(),
    SenhaAtualIncorretaError,
  };
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  alterarSenha,
  SenhaAtualIncorretaError,
} from '../../../../../src/features/editar-conta/model/editarContaService';
import { AlterarSenhaForm } from '../../../../../src/features/editar-conta/ui/AlterarSenhaForm';

const alterarSenhaMock = alterarSenha as jest.Mock;

const preencherSenha = async (
  senhaAtual: string,
  novaSenha: string,
  confirmacaoNovaSenha: string,
) => {
  const testUser = userEvent.setup();

  await testUser.type(screen.getByLabelText('Senha atual'), senhaAtual);
  await testUser.type(screen.getByLabelText('Nova senha'), novaSenha);
  await testUser.type(screen.getByLabelText('Confirme nova senha'), confirmacaoNovaSenha);

  return testUser;
};

describe('AlterarSenhaForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alterarSenhaMock.mockResolvedValue(undefined);
  });

  it('altera senha e limpa campos no sucesso', async () => {
    render(<AlterarSenhaForm />);

    const testUser = await preencherSenha('atual123', 'nova1234', 'nova1234');
    await testUser.click(screen.getByRole('button', { name: /Alterar senha/i }));

    expect(alterarSenhaMock).toHaveBeenCalledWith({
      senhaAtual: 'atual123',
      novaSenha: 'nova1234',
      confirmacaoNovaSenha: 'nova1234',
    });
    expect(await screen.findByText('Senha alterada.')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toHaveValue('');
    expect(screen.getByLabelText('Nova senha')).toHaveValue('');
    expect(screen.getByLabelText('Confirme nova senha')).toHaveValue('');
  });

  it('valida confirmacao divergente no cliente', async () => {
    render(<AlterarSenhaForm />);

    const testUser = await preencherSenha('atual123', 'nova1234', 'outra123');
    await testUser.click(screen.getByRole('button', { name: /Alterar senha/i }));

    expect(screen.getByText('A confirmação não corresponde à nova senha.')).toBeInTheDocument();
    expect(alterarSenhaMock).not.toHaveBeenCalled();
  });

  it('valida tamanho minimo da nova senha', async () => {
    render(<AlterarSenhaForm />);

    const testUser = await preencherSenha('atual123', 'curta', 'curta');
    await testUser.click(screen.getByRole('button', { name: /Alterar senha/i }));

    expect(screen.getByText('Mínimo de 8 caracteres.')).toBeInTheDocument();
    expect(alterarSenhaMock).not.toHaveBeenCalled();
  });

  it('valida nova senha igual a senha atual', async () => {
    render(<AlterarSenhaForm />);

    const testUser = await preencherSenha('mesma123', 'mesma123', 'mesma123');
    await testUser.click(screen.getByRole('button', { name: /Alterar senha/i }));

    expect(screen.getByText('A nova senha deve ser diferente da senha atual.')).toBeInTheDocument();
    expect(alterarSenhaMock).not.toHaveBeenCalled();
  });

  it('mostra senha atual incorreta como erro de campo', async () => {
    alterarSenhaMock.mockRejectedValueOnce(
      new SenhaAtualIncorretaError('Senha atual incorreta.'),
    );
    render(<AlterarSenhaForm />);

    const testUser = await preencherSenha('errada123', 'nova1234', 'nova1234');
    await testUser.click(screen.getByRole('button', { name: /Alterar senha/i }));

    expect(await screen.findByText('Senha atual incorreta.')).toBeInTheDocument();
  });

  it('mostra erro generico quando service falha', async () => {
    alterarSenhaMock.mockRejectedValueOnce(new Error('Falha ao alterar senha.'));
    render(<AlterarSenhaForm />);

    const testUser = await preencherSenha('atual123', 'nova1234', 'nova1234');
    await testUser.click(screen.getByRole('button', { name: /Alterar senha/i }));

    expect(await screen.findByText('Falha ao alterar senha.')).toBeInTheDocument();
  });
});
