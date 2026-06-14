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

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { registerProfessor, RegisterProfessorError } from '../model/registerProfessorService';
import { PROFESSOR_INSTITUTION } from '../model/types';
import { RegisterProfessorForm } from './RegisterProfessorForm';

const registerProfessorMock = registerProfessor as jest.Mock;
const VALID_PASSWORD = 'senhaValida123';
const PROFESSOR_NAME = 'Hilmer Rodrigues Neri';
const PROFESSOR_EMAIL = 'hilmer@unb.br';

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/professor/cadastro']}>
      <RegisterProfessorForm />
    </MemoryRouter>,
  );

const submitButton = () => screen.getByRole('button', { name: /Completar cadastro/i });

const preencherPasso1 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Nome completo/i), PROFESSOR_NAME);
  await user.type(screen.getByLabelText(/Email institucional/i), PROFESSOR_EMAIL);
  await user.type(screen.getByLabelText(/^Senha/i), VALID_PASSWORD);
  await user.type(screen.getByLabelText(/Confirmação de senha/i), VALID_PASSWORD);
  await user.click(submitButton());
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

  it('mantem o botao desabilitado para email fora do dominio UnB', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), PROFESSOR_NAME);
    await user.type(screen.getByLabelText(/Email institucional/i), 'hilmer@gmail.com');
    await user.type(screen.getByLabelText(/^Senha/i), VALID_PASSWORD);
    await user.type(screen.getByLabelText(/Confirmação de senha/i), VALID_PASSWORD);

    expect(submitButton()).toBeDisabled();
  });

  it('rejeita caracteres especiais e numeros no nome completo', async () => {
    const user = userEvent.setup();
    renderForm();

    const fullNameInput = screen.getByLabelText(/Nome completo/i);
    await user.type(fullNameInput, 'Hilmer@ Neri123');
    await user.tab();

    expect(
      screen.getByText(/Nome completo deve conter apenas letras e espaços/i),
    ).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('aceita letras acentuadas no nome completo', async () => {
    const user = userEvent.setup();
    renderForm();

    const fullNameInput = screen.getByLabelText(/Nome completo/i);
    await user.type(fullNameInput, 'Hílmer José');
    await user.tab();

    expect(
      screen.queryByText(/Nome completo deve conter apenas letras e espaços/i),
    ).not.toBeInTheDocument();
  });

  it('aceita email com subdominio UnB', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), PROFESSOR_NAME);
    await user.type(screen.getByLabelText(/Email institucional/i), 'hilmer@professor.unb.br');
    await user.type(screen.getByLabelText(/^Senha/i), VALID_PASSWORD);
    await user.type(screen.getByLabelText(/Confirmação de senha/i), VALID_PASSWORD);

    expect(screen.queryByText(/Use um email institucional UnB/i)).not.toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  it('exibe erro para SIAPE com formato invalido', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await user.type(screen.getByLabelText(/SIAPE/i), '123456');
    await user.click(screen.getByLabelText(/SIAPE/i));
    await user.tab();

    expect(await screen.findByText(/SIAPE deve conter exatamente 7 dígitos/i)).toBeInTheDocument();
    expect(submitButton()).toBeDisabled();
  });

  it('remove caracteres nao numericos do SIAPE', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await user.type(screen.getByLabelText(/SIAPE/i), '12a34-567');

    expect(screen.getByLabelText(/SIAPE/i)).toHaveValue('1234567');
  });

  it('mantem o botao desabilitado quando as senhas sao diferentes', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), PROFESSOR_NAME);
    await user.type(screen.getByLabelText(/Email institucional/i), PROFESSOR_EMAIL);
    await user.type(screen.getByLabelText(/^Senha/i), VALID_PASSWORD);
    await user.type(screen.getByLabelText(/Confirmação de senha/i), 'senhaDiferente123');

    expect(submitButton()).toBeDisabled();
  });

  it('revalida confirmacao quando a senha muda depois de tocada', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), PROFESSOR_NAME);
    await user.type(screen.getByLabelText(/Email institucional/i), PROFESSOR_EMAIL);
    await user.type(screen.getByLabelText(/^Senha/i), VALID_PASSWORD);
    await user.type(screen.getByLabelText(/Confirmação de senha/i), VALID_PASSWORD);
    await user.tab();
    await user.clear(screen.getByLabelText(/^Senha/i));
    await user.type(screen.getByLabelText(/^Senha/i), 'senhaAlterada123');

    expect(await screen.findByText(/As senhas não coincidem/i)).toBeInTheDocument();
  });

  it('mantem instituicao pre-preenchida e bloqueada', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);

    const institutionInput = screen.getByLabelText(/Instituição/i);
    expect(institutionInput).toHaveValue(PROFESSOR_INSTITUTION);
    expect(institutionInput).toBeDisabled();
  });

  it('volta para a etapa anterior mantendo os dados preenchidos', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await user.click(screen.getByRole('button', { name: /Voltar etapa/i }));

    expect(screen.getByLabelText(/Email institucional/i)).toHaveValue(PROFESSOR_EMAIL);
    expect(screen.queryByLabelText(/SIAPE/i)).not.toBeInTheDocument();
  });

  it('exibe validacoes obrigatorias quando o formulario da segunda etapa e enviado vazio', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    fireEvent.submit(screen.getByRole('form', { name: /register professor form/i }));

    expect(await screen.findByText(/SIAPE é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/Departamento é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/Curso é obrigatório/i)).toBeInTheDocument();
  });

  it('envia cadastro com valores preenchidos e mostra confirmacao de analise', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(submitButton());

    expect(registerProfessorMock).toHaveBeenCalledWith({
      fullName: PROFESSOR_NAME,
      email: PROFESSOR_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
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

  it('mostra carregamento enquanto a API processa o cadastro', async () => {
    const user = userEvent.setup();
    let resolveRequest: () => void = () => undefined;
    registerProfessorMock.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    );

    renderForm();
    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(submitButton());

    expect(await screen.findByRole('button', { name: /Finalizando/i })).toBeDisabled();
    resolveRequest();
    expect(await screen.findByText(/Cadastro realizado!/i)).toBeInTheDocument();
  });

  it('exibe erro inline no email quando a API retorna email ja cadastrado', async () => {
    const user = userEvent.setup();
    registerProfessorMock.mockRejectedValueOnce(
      new RegisterProfessorError('Email ja cadastrado.', { email: 'Email ja cadastrado.' }),
    );

    renderForm();
    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(submitButton());

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
    await user.click(submitButton());

    expect(await screen.findByText(/SIAPE ja cadastrado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SIAPE/i)).toBeInTheDocument();
  });

  it('exibe erro geral quando a API retorna RegisterProfessorError sem campo', async () => {
    const user = userEvent.setup();
    registerProfessorMock.mockRejectedValueOnce(new RegisterProfessorError('Servidor indisponivel.'));

    renderForm();
    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(submitButton());

    expect(await screen.findByText(/Servidor indisponivel/i)).toBeInTheDocument();
  });

  it('exibe erro geral quando ocorre falha desconhecida', async () => {
    const user = userEvent.setup();
    registerProfessorMock.mockRejectedValueOnce(new Error('falha inesperada'));

    renderForm();
    await preencherPasso1(user);
    await preencherPasso2(user);
    await user.click(submitButton());

    expect(
      await screen.findByText(/Não foi possível concluir o cadastro. Tente novamente/i),
    ).toBeInTheDocument();
  });
});
