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

import {
  PROFESSOR_INSTITUTION,
  type RegisterProfessorFormValues,
} from './types';

const formValues: RegisterProfessorFormValues = {
  fullName: ' Hilmer Rodrigues Neri ',
  email: ' HILMER@UNB.BR ',
  password: 'password123',
  confirmPassword: 'password123',
  institution: PROFESSOR_INSTITUTION,
  siape: '1234567',
  department: ' Anatomia ',
  course: ' Medicina ',
};

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

    expect(postMock).toHaveBeenCalledWith('/auth/professores/register', {
      nome: 'Hilmer Rodrigues Neri',
      email: 'hilmer@unb.br',
      siape: '1234567',
      instituicao: PROFESSOR_INSTITUTION,
      departamento: 'Anatomia',
      curso: 'Medicina',
      senha: 'password123',
      confirmacaoSenha: 'password123',
    });
  });

  it('retorna erro inline de email quando API informa email em uso', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          erro: {
            mensagem: 'Email ja cadastrado.',
            detalhes: { email: 'hilmer@unb.br' },
          },
        },
      },
    });

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Email ja cadastrado.',
        fieldErrors: { email: 'Email ja cadastrado.' },
      }),
    );
  });

  it('retorna erro inline de SIAPE quando API informa SIAPE em uso', async () => {
    const { registerProfessor } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 409,
        data: {
          erro: {
            mensagem: 'SIAPE ja cadastrado.',
            detalhes: { siape: '1234567' },
          },
        },
      },
    });

    await expect(registerProfessor(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'SIAPE ja cadastrado.',
        fieldErrors: { siape: 'SIAPE ja cadastrado.' },
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
});
