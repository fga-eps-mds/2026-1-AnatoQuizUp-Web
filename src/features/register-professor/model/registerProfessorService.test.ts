/// <reference types="jest" />
/// <reference types="node" />

const postMock = jest.fn();
const registerProfessorMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  postMock.mockReset();
  registerProfessorMock.mockReset();

  jest.doMock('../../../shared/api/httpClient', () => ({
    httpClient: {
      post: postMock,
    },
  }));

  jest.doMock('../../../shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  jest.doMock('./mockRegisterProfessorService', () => ({
    registerProfessorMock,
  }));

  return import('./registerProfessorService');
};

import { PROFESSOR_INSTITUTION, type RegisterProfessorFormValues } from './types';

const VALID_PASSWORD = 'senhaValida123';
const formValues: RegisterProfessorFormValues = {
  fullName: ' Hilmer Rodrigues Neri ',
  email: ' HILMER@UNB.BR ',
  password: VALID_PASSWORD,
  confirmPassword: VALID_PASSWORD,
  institution: PROFESSOR_INSTITUTION,
  siape: '1234567',
  department: ' Anatomia ',
  course: ' Medicina ',
};

const axiosError = (data?: unknown) => ({
  isAxiosError: true,
  response: {
    status: 400,
    data,
  },
});

describe('registerProfessor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses the mock register service without calling the API when mocks are enabled', async () => {
    const { registerProfessor } = await loadService(true);
    registerProfessorMock.mockResolvedValueOnce(undefined);

    await registerProfessor(formValues);

    expect(registerProfessorMock).toHaveBeenCalledWith(formValues);
    expect(postMock).not.toHaveBeenCalled();
  });

  it('envia payload no formato esperado pela API com textos trimados', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await registerProfessor(formValues);

    expect(postMock).toHaveBeenCalledWith('/autenticacao/cadastro/professor', {
      nome: 'Hilmer Rodrigues Neri',
      email: 'hilmer@unb.br',
      siape: '1234567',
      instituicao: 'UnB',
      departamento: 'Anatomia',
      curso: 'Medicina',
      senha: VALID_PASSWORD,
      confirmacaoSenha: VALID_PASSWORD,
    });
  });

  it('retorna erro inline de email quando API informa email em uso', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce(
      axiosError({
        erro: {
          mensagem: 'Email ja cadastrado.',
          detalhes: { email: 'hilmer@unb.br' },
        },
      }),
    );

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Email ja cadastrado.',
        fieldErrors: { email: 'Email ja cadastrado.' },
      }),
    );
  });

  it('retorna erro inline de email quando detalhes vem como lista', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce(
      axiosError({
        erro: {
          mensagem: 'Validacao invalida.',
          detalhes: [{ campo: 'email', mensagem: 'Email institucional UnB obrigatório.' }],
        },
      }),
    );

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Email institucional UnB obrigatório.',
        fieldErrors: { email: 'Email institucional UnB obrigatório.' },
      }),
    );
  });

  it('retorna erro inline de email quando detalhes vem em estrutura de validacao aninhada', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce(
      axiosError({
        erro: {
          detalhes: {
            email: {
              errors: ['Email institucional UnB obrigatório.'],
            },
          },
        },
      }),
    );

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Email institucional UnB obrigatório.',
        fieldErrors: { email: 'Email institucional UnB obrigatório.' },
      }),
    );
  });

  it('retorna erro inline de SIAPE quando API informa SIAPE em uso', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce(
      axiosError({
        erro: {
          mensagem: 'SIAPE ja cadastrado.',
          detalhes: { siape: '1234567' },
        },
      }),
    );

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'SIAPE ja cadastrado.',
        fieldErrors: { siape: 'SIAPE ja cadastrado.' },
      }),
    );
  });

  it('retorna erro inline de SIAPE quando validacao vem em properties', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce(
      axiosError({
        erro: {
          detalhes: {
            properties: {
              siape: {
                errors: ['SIAPE inválido.'],
              },
            },
          },
        },
      }),
    );

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'SIAPE inválido.',
        fieldErrors: { siape: 'SIAPE inválido.' },
      }),
    );
  });

  it('identifica campo duplicado pela mensagem geral do backend', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce(
      axiosError({
        mensagem: 'Email ja cadastrado.',
      }),
    );

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Email ja cadastrado.',
        fieldErrors: { email: 'Email ja cadastrado.' },
      }),
    );
  });

  it('retorna mensagem amigavel quando servidor esta indisponivel', async () => {
    const { registerProfessor, RegisterProfessorError } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
    });

    await expect(registerProfessor(formValues)).rejects.toEqual(
      new RegisterProfessorError('Não foi possível conectar ao servidor. Tente novamente.'),
    );
  });

  it('retorna mensagem amigavel quando erro nao vem do axios', async () => {
    const { registerProfessor, RegisterProfessorError } = await loadService(false);
    postMock.mockRejectedValueOnce(new Error('falha local'));

    await expect(registerProfessor(formValues)).rejects.toEqual(
      new RegisterProfessorError('Não foi possível concluir o cadastro. Tente novamente.'),
    );
  });

  it('repassa mensagem geral do backend quando nao ha erro de campo', async () => {
    const { registerProfessor, RegisterProfessorError } = await loadService(false);
    postMock.mockRejectedValueOnce(axiosError({ message: 'Falha de cadastro.' }));

    await expect(registerProfessor(formValues)).rejects.toEqual(
      new RegisterProfessorError('Falha de cadastro.'),
    );
  });

  it('usa mensagem generica quando backend nao retorna mensagem', async () => {
    const { registerProfessor, RegisterProfessorError } = await loadService(false);
    postMock.mockRejectedValueOnce(axiosError({}));

    await expect(registerProfessor(formValues)).rejects.toEqual(
      new RegisterProfessorError('Não foi possível concluir o cadastro. Tente novamente.'),
    );
  });
});
