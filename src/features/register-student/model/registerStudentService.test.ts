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

    expect(getMock).toHaveBeenNthCalledWith(1, '/autenticacao/alunos/email-disponivel', {
      params: { email: 'bezerra@email.com' },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/autenticacao/alunos/nickname-disponivel', {
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

    expect(postMock).toHaveBeenCalledWith('/autenticacao/cadastro', {
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
  
  it('mapeia escolaridade desconhecida para OUTRO', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockResolvedValueOnce({ data: { mensagem: 'ok' } });

    await registerStudent({ ...formValues, education: 'VALOR_NUNCA_VISTO' });

    expect(postMock).toHaveBeenCalledWith(
      '/autenticacao/cadastro',
      expect.objectContaining({ escolaridade: 'OUTRO' }),
    );
  });

  it('retorna erro generico quando falha no register e nao e erro do Axios', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce(new Error('Erro generico de rede ou JS'));

    await expect(registerStudent(formValues)).rejects.toThrow(
      'Nao foi possivel concluir o cadastro. Tente novamente.'
    );
  });

  it('retorna a mensagem do backend quando ocorre erro generico sem fieldErrors', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { mensagem: 'Erro interno no banco de dados' } },
    });

    await expect(registerStudent(formValues)).rejects.toThrow('Erro interno no banco de dados');
  });

  it('extrai fieldError quando detalhes e um array (formato API padrao)', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          erro: {
            detalhes: [{ campo: 'email', mensagem: 'O formato do email esta incorreto' }],
          },
        },
      },
    });

    await expect(registerStudent(formValues)).rejects.toMatchObject({
      fieldErrors: { email: 'O formato do email esta incorreto' },
    });
  });

  it('extrai fieldError quando detalhes e um objeto com formato de errors aninhados', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          erro: {
            detalhes: { email: { errors: ['Email muito curto'] } },
          },
        },
      },
    });

    await expect(registerStudent(formValues)).rejects.toMatchObject({
      fieldErrors: { email: 'Email muito curto' },
    });
  });

  it('extrai fieldError por regex quando backend envia mensagem flat', async () => {
    const { registerStudent } = await loadService(false);
    postMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: { mensagem: 'O email fornecido ja esta em uso no sistema' },
      },
    });

    await expect(registerStudent(formValues)).rejects.toMatchObject({
      fieldErrors: { email: 'O email fornecido ja esta em uso no sistema' },
    });
  });

  it('retorna erro generico quando nao e erro do Axios na validacao de identidade', async () => {
    const { validateRegisterStudentIdentity } = await loadService(false);
    getMock.mockRejectedValueOnce(new Error('Erro de execucao'));

    await expect(validateRegisterStudentIdentity(formValues)).rejects.toThrow(
      'Nao foi possivel validar email e nickname. Tente novamente.'
    );
  });

  it('retorna erro de conexao quando Axios falha sem response na validacao', async () => {
    const { validateRegisterStudentIdentity } = await loadService(false);
    getMock.mockRejectedValueOnce({ isAxiosError: true }); 

    await expect(validateRegisterStudentIdentity(formValues)).rejects.toThrow(
      'Nao foi possivel conectar ao servidor. Tente novamente.'
    );
  });

  it('repassa fieldErrors da API quando validateRegisterStudentIdentity recebe 400', async () => {
    const { validateRegisterStudentIdentity } = await loadService(false);
    getMock.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          mensagem: 'Campos invalidos',
          erro: {
            detalhes: [{ campo: 'nickname', mensagem: 'Nickname contem caracteres invalidos' }],
          },
        },
      },
    });

    await expect(validateRegisterStudentIdentity(formValues)).rejects.toMatchObject({
      message: 'Campos invalidos',
      fieldErrors: { nickname: 'Nickname contem caracteres invalidos' },
    });
  });
});
