jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../../src/features/editar-conta/model/editarContaService', () => {
  class ApelidoEmUsoError extends Error {
    constructor(message = 'Este apelido ja esta em uso.') {
      super(message);
      this.name = 'ApelidoEmUsoError';
    }
  }

  return {
    atualizarDadosPessoais: jest.fn(),
    ApelidoEmUsoError,
  };
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuth } from '../../../../../src/app/providers/AuthProvider';
import {
  ApelidoEmUsoError,
  atualizarDadosPessoais,
} from '../../../../../src/features/editar-conta/model/editarContaService';
import { InformacoesPessoaisForm } from '../../../../../src/features/editar-conta/ui/InformacoesPessoaisForm';

const useAuthMock = useAuth as jest.Mock;
const atualizarDadosPessoaisMock = atualizarDadosPessoais as jest.Mock;
const recarregarUsuarioMock = jest.fn();

const aluno = {
  id: 'aluno-1',
  name: 'Joao Silva',
  nickname: 'joaojose',
  email: 'joao@example.com',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
};

const renderForm = () => render(<InformacoesPessoaisForm />);

describe('InformacoesPessoaisForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: aluno,
      recarregarUsuario: recarregarUsuarioMock,
    });
    atualizarDadosPessoaisMock.mockResolvedValue(undefined);
    recarregarUsuarioMock.mockResolvedValue(undefined);
  });

  it('preenche nome, apelido e mostra email bloqueado', () => {
    renderForm();

    expect(screen.getByLabelText('Nome')).toHaveValue('Joao Silva');
    expect(screen.getByLabelText('Apelido')).toHaveValue('joaojose');
    expect(screen.getByLabelText('E-mail')).toHaveValue('joao@example.com');
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
    expect(screen.getByText('Não editável')).toBeInTheDocument();
  });

  it('salva dados pessoais validos e recarrega usuario', async () => {
    const testUser = userEvent.setup();
    renderForm();

    await testUser.clear(screen.getByLabelText('Nome'));
    await testUser.type(screen.getByLabelText('Nome'), 'Joao Novo');
    await testUser.clear(screen.getByLabelText('Apelido'));
    await testUser.type(screen.getByLabelText('Apelido'), 'Joao_Novo');
    await testUser.click(screen.getByRole('button', { name: /Salvar informações/i }));

    expect(atualizarDadosPessoaisMock).toHaveBeenCalledWith({
      nome: 'Joao Novo',
      nickname: 'joao_novo',
    });
    expect(await screen.findByText('Informações atualizadas.')).toBeInTheDocument();
    expect(recarregarUsuarioMock).toHaveBeenCalledTimes(1);
  });

  it('mostra erro de campo quando apelido esta em uso', async () => {
    const testUser = userEvent.setup();
    atualizarDadosPessoaisMock.mockRejectedValueOnce(
      new ApelidoEmUsoError('Ja existe um usuario cadastrado com este nickname.'),
    );
    renderForm();

    await testUser.click(screen.getByRole('button', { name: /Salvar informações/i }));

    expect(await screen.findByText('Ja existe um usuario cadastrado com este nickname.'))
      .toBeInTheDocument();
    expect(recarregarUsuarioMock).not.toHaveBeenCalled();
  });

  it('valida nome vazio no cliente', async () => {
    const testUser = userEvent.setup();
    renderForm();

    await testUser.clear(screen.getByLabelText('Nome'));
    await testUser.click(screen.getByRole('button', { name: /Salvar informações/i }));

    expect(screen.getByText('Nome é obrigatório.')).toBeInTheDocument();
    expect(atualizarDadosPessoaisMock).not.toHaveBeenCalled();
  });

  it('valida formato do apelido no cliente', async () => {
    const testUser = userEvent.setup();
    renderForm();

    await testUser.clear(screen.getByLabelText('Apelido'));
    await testUser.type(screen.getByLabelText('Apelido'), '1apelido');
    await testUser.click(screen.getByRole('button', { name: /Salvar informações/i }));

    expect(screen.getByText('Apelido deve começar com letra e conter apenas minúsculas, números e _.'))
      .toBeInTheDocument();
    expect(atualizarDadosPessoaisMock).not.toHaveBeenCalled();
  });

  it('mostra erro generico do formulario quando salvar falha', async () => {
    const testUser = userEvent.setup();
    atualizarDadosPessoaisMock.mockRejectedValueOnce(
      new Error('Servico indisponivel.'),
    );
    renderForm();

    await testUser.click(screen.getByRole('button', { name: /Salvar informações/i }));

    expect(await screen.findByText('Servico indisponivel.')).toBeInTheDocument();
  });

  it('nao renderiza quando usuario nao esta disponivel', () => {
    useAuthMock.mockReturnValue({
      user: null,
      recarregarUsuario: recarregarUsuarioMock,
    });

    const { container } = renderForm();

    expect(container).toBeEmptyDOMElement();
  });
});
