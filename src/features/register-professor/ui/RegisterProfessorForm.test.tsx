jest.mock('../model/registerProfessorService', () => {
  class RegisterProfessorError extends Error {
    fieldErrors?: Record<string, string>;

    constructor(message: string, fieldErrors?: Record<string, string>) {
      super(message);
      this.name = 'RegisterProfessorError';
      this.fieldErrors = fieldErrors;
    }
  }

  return {
    registerProfessor: jest.fn(),
    RegisterProfessorError,
  };
});

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { registerProfessor, RegisterProfessorError } from '../model/registerProfessorService';
import { PROFESSOR_INSTITUTION } from '../model/types';
import { RegisterProfessorForm } from './RegisterProfessorForm';

const registerProfessorMock = registerProfessor as jest.Mock;

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/professor/cadastro']}>
      <RegisterProfessorForm />
    </MemoryRouter>,
  );

const preencherPasso1 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Nome completo/i), 'Hilmer Rodrigues Neri');
  await user.type(screen.getByLabelText(/Email institucional/i), 'hilmer@unb.br');
  await user.type(screen.getByLabelText(/^Senha/i), 'password123');
  await user.type(screen.getByLabelText(/Confirmação de senha/i), 'password123');
  await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));
  await screen.findByLabelText(/Instituição/i);
};

const preencherPasso2 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/SIAPE/i), '1234567');
  await user.type(screen.getByLabelText(/Departamento/i), 'Anatomia');
  await user.type(screen.getByLabelText(/Curso/i), 'Medicina');
};

describe('RegisterProfessorForm', () => {
  beforeEach(() => {
    registerProfessorMock.mockReset();
    registerProfessorMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o formulario com todos os campos ao avancar pelas etapas', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email institucional/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmação de senha/i)).toBeInTheDocument();

    await preencherPasso1(user);

    expect(screen.getByLabelText(/Instituição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SIAPE/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Departamento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Curso/i)).toBeInTheDocument();
  });

  it('mantem o botao desabilitado para email fora de @unb.br', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), 'Hilmer Rodrigues Neri');
    await user.type(screen.getByLabelText(/Email institucional/i), 'hilmer@gmail.com');
    await user.type(screen.getByLabelText(/^Senha/i), 'password123');
    await user.type(screen.getByLabelText(/Confirmação de senha/i), 'password123');

    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
  });

  it('rejeita email com subdominio UnB', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), 'Hilmer Rodrigues Neri');
    await user.type(screen.getByLabelText(/Email institucional/i), 'hilmer@professor.unb.br');
    await user.type(screen.getByLabelText(/^Senha/i), 'password123');
    await user.type(screen.getByLabelText(/Confirmação de senha/i), 'password123');
    await user.click(screen.getByLabelText(/Email institucional/i));
    await user.tab();

    expect(await screen.findByText(/@unb\.br/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
  });

  it('exibe erro para SIAPE com formato invalido', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await user.type(screen.getByLabelText(/SIAPE/i), '123456');
    await user.click(screen.getByLabelText(/SIAPE/i));
    await user.tab();

    expect(await screen.findByText(/SIAPE deve conter exatamente 7 dígitos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
  });

  it('mantem o botao desabilitado quando as senhas sao diferentes', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), 'Hilmer Rodrigues Neri');
    await user.type(screen.getByLabelText(/Email institucional/i), 'hilmer@unb.br');
    await user.type(screen.getByLabelText(/^Senha/i), 'password123');
    await user.type(screen.getByLabelText(/Confirmação de senha/i), '12345678');

    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
  });

  it('mantem instituicao pre-preenchida e bloqueada', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);

    const institutionInput = screen.getByLabelText(/Instituição/i);
    expect(institutionInput).toHaveValue(PROFESSOR_INSTITUTION);
    expect(institutionInput).toBeDisabled();
  });

  it('envia cadastro com valores preenchidos e mostra confirmacao de analise', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));

    expect(registerProfessorMock).toHaveBeenCalledWith({
      fullName: 'Hilmer Rodrigues Neri',
      email: 'hilmer@unb.br',
      password: 'password123',
      confirmPassword: 'password123',
      institution: PROFESSOR_INSTITUTION,
      siape: '1234567',
      department: 'Anatomia',
      course: 'Medicina',
    });
    expect(await screen.findByText(/Cadastro realizado!/i)).toBeInTheDocument();
    expect(screen.getByText(/Seu cadastro está em análise pelo administrador/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para login/i })).toHaveAttribute(
      'href',
      '/professor/login',
    );
  });

  it('exibe erro inline no email quando a API retorna email ja cadastrado', async () => {
    const user = userEvent.setup();
    registerProfessorMock.mockRejectedValueOnce(
      new RegisterProfessorError('Email ja cadastrado.', { email: 'Email ja cadastrado.' }),
    );

    renderForm();
    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));

    expect(await screen.findByText(/Email ja cadastrado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email institucional/i)).toBeInTheDocument();
  });

  it('exibe erro inline no SIAPE quando a API retorna SIAPE ja cadastrado', async () => {
    const user = userEvent.setup();
    registerProfessorMock.mockRejectedValueOnce(
      new RegisterProfessorError('SIAPE ja cadastrado.', { siape: 'SIAPE ja cadastrado.' }),
    );

    renderForm();
    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));

    expect(await screen.findByText(/SIAPE ja cadastrado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SIAPE/i)).toBeInTheDocument();
  });
});
