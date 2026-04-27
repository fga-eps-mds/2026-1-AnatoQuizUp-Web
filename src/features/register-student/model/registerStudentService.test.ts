/// <reference types="jest" />
/// <reference types="node" />

const postMock = jest.fn();
const getMock = jest.fn();
const registerStudentMock = jest.fn();

const loadService = async (useMocks: boolean) => {
  jest.resetModules();
  postMock.mockReset();
  getMock.mockReset();
  registerStudentMock.mockReset();

  jest.doMock('../../../shared/api/httpClient', () => ({
    httpClient: {
      post: postMock,
      get: getMock,
    },
  }));

  jest.doMock('../../../shared/config/env', () => ({
    USE_MOCKS: useMocks,
  }));

  jest.doMock('./mockRegisterStudentService', () => ({
    registerStudentMock,
  }));

  return import('./registerStudentService');
};

import type { RegisterStudentFormValues } from './types';

const formValues: RegisterStudentFormValues = {
  fullName: ' Jose Bezerra Camargo ',
  nickname: ' behhhhh ',
  email: ' BEZERRA@email.com ',
  password: 'password123',
  confirmPassword: 'password123',
  birthDate: '2000-02-02',
  nationality: 'Brasileiro(a)',
  state: 'DF',
  city: ' Brasilia ',
  education: 'Graduação',
  institution: 'Universidade de Brasilia',
  course: 'Medicina',
  period: '1o Periodo',
};

describe('registerStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses the mock register service without calling the API when mocks are enabled', async () => {
    const { registerStudent } = await loadService(true);
    registerStudentMock.mockResolvedValueOnce(undefined);

    await registerStudent(formValues);

    expect(registerStudentMock).toHaveBeenCalledWith(formValues);
    expect(postMock).not.toHaveBeenCalled();
  });

  it('does not call availability endpoints when mocks are enabled', async () => {
    const { validateRegisterStudentIdentity } = await loadService(true);

    await expect(validateRegisterStudentIdentity(formValues)).resolves.toBeUndefined();

    expect(getMock).not.toHaveBeenCalled();
  });

  it('valida disponibilidade de email e nickname na API quando mocks estao desativados', async () => {
    const { validateRegisterStudentIdentity } = await loadService(false);
    getMock
      .mockResolvedValueOnce({
        data: { mensagem: 'ok', dados: { email: 'bezerra@email.com', disponivel: true } },
      })
      .mockResolvedValueOnce({
        data: { mensagem: 'ok', dados: { nickname: 'behhhhh', disponivel: true } },
      });

    await expect(validateRegisterStudentIdentity(formValues)).resolves.toBeUndefined();

    expect(getMock).toHaveBeenNthCalledWith(1, '/auth/alunos/email-disponivel', {
      params: { email: 'bezerra@email.com' },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/auth/alunos/nickname-disponivel', {
      params: { nickname: 'behhhhh' },
    });
  });

  it('retorna fieldErrors quando email e nickname nao estao disponiveis', async () => {
    const { validateRegisterStudentIdentity } = await loadService(false);
    getMock
      .mockResolvedValueOnce({
        data: { mensagem: 'ok', dados: { email: 'bezerra@email.com', disponivel: false } },
      })
      .mockResolvedValueOnce({
        data: { mensagem: 'ok', dados: { nickname: 'behhhhh', disponivel: false } },
      });

    await expect(validateRegisterStudentIdentity(formValues)).rejects.toEqual(
      expect.objectContaining({
        fieldErrors: {
          email: 'Ja existe um usuario cadastrado com este email.',
          nickname: 'Ja existe um usuario cadastrado com este nickname.',
        },
      }),
    );
  });

  it('envia payload no formato esperado pela API com textos trimados', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await registerStudent(formValues);

    expect(postMock).toHaveBeenCalledWith('/auth/register', {
      nome: 'Jose Bezerra Camargo',
      nickname: 'behhhhh',
      email: 'bezerra@email.com',
      senha: 'password123',
      confirmacaoSenha: 'password123',
      dataNascimento: '2000-02-02',
      nacionalidade: 'Brasileiro(a)',
      estado: 'DF',
      cidade: 'Brasilia',
      escolaridade: 'GRADUACAO',
      instituicao: 'Universidade de Brasilia',
      curso: 'Medicina',
      periodo: '1o Periodo',
    });
  });

  it('retorna erro com fieldError de email quando API informa email em uso', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          erro: {
            mensagem: 'Ja existe um usuario cadastrado com este email.',
            detalhes: { email: 'bezerra@email.com' },
          },
        },
      },
    });

    await expect(registerStudent(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Ja existe um usuario cadastrado com este email.',
        fieldErrors: { email: 'Ja existe um usuario cadastrado com este email.' },
      }),
    );
  });

  it('retorna erro com fieldError de nickname quando API informa nickname em uso', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          erro: {
            mensagem: 'Ja existe um usuario cadastrado com este nickname.',
            detalhes: { nickname: 'behhhhh' },
          },
        },
      },
    });

    await expect(registerStudent(formValues)).rejects.toEqual(
      expect.objectContaining({
        message: 'Ja existe um usuario cadastrado com este nickname.',
        fieldErrors: { nickname: 'Ja existe um usuario cadastrado com este nickname.' },
      }),
    );
  });

  it('retorna mensagem amigavel quando servidor esta indisponivel', async () => {
    const { registerStudent, RegisterStudentError } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
    });

    await expect(registerStudent(formValues)).rejects.toEqual(
      new RegisterStudentError('Nao foi possivel conectar ao servidor. Tente novamente.'),
    );
  });
});
