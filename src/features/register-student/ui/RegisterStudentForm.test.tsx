jest.mock('../model/registerStudentService', () => {
  class RegisterStudentError extends Error {
    fieldErrors?: Record<string, string>;

    constructor(message: string, fieldErrors?: Record<string, string>) {
      super(message);
      this.name = 'RegisterStudentError';
      this.fieldErrors = fieldErrors;
    }
  }

  return {
    registerStudent: jest.fn(),
    validateRegisterStudentIdentity: jest.fn(),
    RegisterStudentError,
  };
});

jest.mock('../../../shared/api/localidadesService', () => ({
  listarEstados: jest.fn(),
  listarCidadesPorUf: jest.fn(),
}));

jest.mock('../../../shared/api/opcoesAcademicasService', () => ({
  listarOpcoesAcademicas: jest.fn(),
}));

jest.mock('../../../shared/api/nacionalidadesService', () => ({
  listarNacionalidades: jest.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { listarCidadesPorUf, listarEstados } from '../../../shared/api/localidadesService';
import { listarNacionalidades } from '../../../shared/api/nacionalidadesService';
import { listarOpcoesAcademicas } from '../../../shared/api/opcoesAcademicasService';
import { ESTADOS_BRASIL } from '../../../shared/constants/estados';
import {
  RegisterStudentError,
  registerStudent,
  validateRegisterStudentIdentity,
} from '../model/registerStudentService';
import { RegisterStudentForm } from './RegisterStudentForm';

const registerStudentMock = registerStudent as jest.Mock;
const validateRegisterStudentIdentityMock = validateRegisterStudentIdentity as jest.Mock;
const listarEstadosMock = listarEstados as jest.Mock;
const listarCidadesPorUfMock = listarCidadesPorUf as jest.Mock;
const listarOpcoesAcademicasMock = listarOpcoesAcademicas as jest.Mock;
const listarNacionalidadesMock = listarNacionalidades as jest.Mock;

const opcoesAcademicas = {
  escolaridades: ['Ensino Fundamental', 'Ensino Médio', 'Graduação', 'Pós-graduação', 'Outro'],
  instituicoes: [
    'Não se aplica',
    'Universidade de Brasilia',
    'Centro Universitario de Brasilia',
    'Universidade Catolica de Brasilia',
    'Instituto Federal de Brasilia',
  ],
  cursos: ['Não se aplica', 'Medicina', 'Enfermagem', 'Fisioterapia', 'Biomedicina', 'Educacao Fisica'],
  periodos: [
    'Não se aplica',
    '1o Periodo',
    '2o Periodo',
    '3o Periodo',
    '4o Periodo',
    '5o Periodo',
    '6o Periodo',
    '7o Periodo',
    '8o Periodo',
    '9o Periodo',
    '10o Periodo',
    '11o Periodo',
    '12o Periodo',
  ],
  naoSeAplica: 'Não se aplica',
};

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <RegisterStudentForm />
    </MemoryRouter>,
  );

const preencherPasso1 = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Nome completo/i), 'Jose Bezerra Camargo');
  await user.type(screen.getByLabelText(/Nickname/i), 'behhhhh');
  await user.type(screen.getByLabelText(/^Email/i), 'bezerra@email.com');
  await user.type(screen.getByLabelText(/^Senha/i), 'password123');
  await user.type(screen.getByLabelText(/Confirmação de senha/i), 'password123');
  await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));
  await screen.findByLabelText(/Data de nascimento/i);
};

const preencherPasso2 = async (user: ReturnType<typeof userEvent.setup>) => {
  fireEvent.change(screen.getByLabelText(/Data de nascimento/i), {
    target: { value: '2000-02-02' },
  });
  await screen.findByRole('option', { name: 'Brasileiro(a)' });
  await user.selectOptions(screen.getByLabelText(/Nacionalidade/i), 'Brasileiro(a)');
  await screen.findByRole('option', { name: 'DF' });
  await user.selectOptions(screen.getByLabelText(/Estado/i), 'DF');
  await screen.findByRole('option', { name: 'Brasilia' });
  await user.selectOptions(screen.getByLabelText(/Cidade/i), 'Brasilia');
  await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));
  await screen.findByLabelText(/Escolaridade/i);
};

const irParaPasso3 = async (user: ReturnType<typeof userEvent.setup>) => {
  await preencherPasso1(user);
  await preencherPasso2(user);
};

describe('RegisterStudentForm', () => {
  beforeEach(() => {
    registerStudentMock.mockReset();
    validateRegisterStudentIdentityMock.mockReset();
    listarEstadosMock.mockReset();
    listarCidadesPorUfMock.mockReset();
    listarOpcoesAcademicasMock.mockReset();
    listarNacionalidadesMock.mockReset();

    validateRegisterStudentIdentityMock.mockResolvedValue(undefined);
    listarEstadosMock.mockResolvedValue(ESTADOS_BRASIL);
    listarCidadesPorUfMock.mockImplementation(async (uf: string) =>
      uf === 'DF' ? [{ nome: 'Brasilia', uf: 'DF' }] : [{ nome: 'Goiania', uf: 'GO' }],
    );
    listarOpcoesAcademicasMock.mockResolvedValue(opcoesAcademicas);
    listarNacionalidadesMock.mockResolvedValue(['Brasileiro(a)', 'Estrangeiro(a)']);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o formulario com todos os campos ao avancar pelos passos', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nickname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmação de senha/i)).toBeInTheDocument();

    await preencherPasso1(user);

    expect(screen.getByLabelText(/Data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nacionalidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();

    await preencherPasso2(user);

    expect(screen.getByLabelText(/Escolaridade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instituição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Curso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Período/i)).toBeInTheDocument();
  });

  it('mantem o botao desabilitado para email invalido', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), 'Jose');
    await user.type(screen.getByLabelText(/Nickname/i), 'behhhhh');
    await user.type(screen.getByLabelText(/^Email/i), 'email-invalido');
    await user.type(screen.getByLabelText(/^Senha/i), 'password123');
    await user.type(screen.getByLabelText(/Confirmação de senha/i), 'password123');

    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
  });

  it('mantem o botao desabilitado quando as senhas sao diferentes', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), 'Jose');
    await user.type(screen.getByLabelText(/Nickname/i), 'behhhhh');
    await user.type(screen.getByLabelText(/^Email/i), 'bezerra@email.com');
    await user.type(screen.getByLabelText(/^Senha/i), 'password123');
    await user.type(screen.getByLabelText(/Confirmação de senha/i), '12345678');

    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
  });

  it('mostra erro obrigatorio quando o usuario sai de um campo vazio', async () => {
    const user = userEvent.setup();
    renderForm();

    const fullNameInput = screen.getByLabelText(/Nome completo/i);
    await user.click(fullNameInput);
    await user.tab();

    expect(screen.getByText(/Nome completo é obrigatório/i)).toBeInTheDocument();
  });

  it('habilita o botao somente quando os campos do passo atual estao validos', async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();

    await preencherPasso1(user);

    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Data de nascimento/i), {
      target: { value: '2000-02-02' },
    });
    await screen.findByRole('option', { name: 'Brasileiro(a)' });
    await user.selectOptions(screen.getByLabelText(/Nacionalidade/i), 'Brasileiro(a)');
    await user.selectOptions(screen.getByLabelText(/Estado/i), 'DF');
    await screen.findByRole('option', { name: 'Brasilia' });
    await user.selectOptions(screen.getByLabelText(/Cidade/i), 'Brasilia');
    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));
    await screen.findByLabelText(/Escolaridade/i);
    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeDisabled();
    await user.selectOptions(screen.getByLabelText(/Escolaridade/i), 'Graduação');
    await user.selectOptions(screen.getByLabelText(/Instituição/i), 'Universidade de Brasilia');
    await user.selectOptions(screen.getByLabelText(/Curso/i), 'Medicina');
    await user.selectOptions(screen.getByLabelText(/Período/i), '3o Periodo');
    expect(screen.getByRole('button', { name: /Completar cadastro/i })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));
  });

  it('valida email e nickname ao tentar avancar o primeiro passo', async () => {
    const user = userEvent.setup();
    validateRegisterStudentIdentityMock.mockRejectedValueOnce(
      new RegisterStudentError('Dados indisponiveis.', {
        email: 'Ja existe um usuario cadastrado com este email.',
        nickname: 'Ja existe um usuario cadastrado com este nickname.',
      }),
    );

    renderForm();

    await user.type(screen.getByLabelText(/Nome completo/i), 'Jose Bezerra Camargo');
    await user.type(screen.getByLabelText(/Nickname/i), 'behhhhh');
    await user.type(screen.getByLabelText(/^Email/i), 'bezerra@email.com');
    await user.type(screen.getByLabelText(/^Senha/i), 'password123');
    await user.type(screen.getByLabelText(/Confirmação de senha/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));

    expect(validateRegisterStudentIdentityMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'bezerra@email.com', nickname: 'behhhhh' }),
    );
    expect(
      await screen.findByText('Ja existe um usuario cadastrado com este email.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ja existe um usuario cadastrado com este nickname.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.queryByText('Dados indisponiveis.')).not.toBeInTheDocument();
  });

  it('permite voltar para a etapa anterior depois de avancar', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);

    expect(screen.getByLabelText(/Data de nascimento/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Voltar etapa/i }));

    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/i)).toHaveValue('Jose Bezerra Camargo');
  });

  it('ao selecionar "Nao se aplica" em instituicao preenche curso e periodo automaticamente', async () => {
    const user = userEvent.setup();
    renderForm();

    await irParaPasso3(user);

    await user.selectOptions(screen.getByLabelText(/Instituição/i), 'Não se aplica');

    expect(screen.getByLabelText(/Curso/i)).toHaveValue('Não se aplica');
    expect(screen.getByLabelText(/Período/i)).toHaveValue('Não se aplica');
  });

  it('ao selecionar "Nao se aplica" em curso preenche instituicao e periodo automaticamente', async () => {
    const user = userEvent.setup();
    renderForm();

    await irParaPasso3(user);

    await user.selectOptions(screen.getByLabelText(/Curso/i), 'Não se aplica');

    expect(screen.getByLabelText(/Instituição/i)).toHaveValue('Não se aplica');
    expect(screen.getByLabelText(/Período/i)).toHaveValue('Não se aplica');
  });

  it('permite alterar manualmente instituicao, curso e periodo depois da auto-selecao', async () => {
    const user = userEvent.setup();
    renderForm();

    await irParaPasso3(user);

    await user.selectOptions(screen.getByLabelText(/Instituição/i), 'Não se aplica');
    await user.selectOptions(screen.getByLabelText(/Instituição/i), 'Universidade de Brasilia');
    await user.selectOptions(screen.getByLabelText(/Curso/i), 'Medicina');
    await user.selectOptions(screen.getByLabelText(/Período/i), '3o Periodo');

    expect(screen.getByLabelText(/Instituição/i)).toHaveValue('Universidade de Brasilia');
    expect(screen.getByLabelText(/Curso/i)).toHaveValue('Medicina');
    expect(screen.getByLabelText(/Período/i)).toHaveValue('3o Periodo');
  });

  it('lista de estados contem 27 opcoes', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await screen.findByRole('option', { name: 'DF' });

    const stateSelect = screen.getByLabelText(/Estado/i) as HTMLSelectElement;
    const stateOptionsCount = Array.from(stateSelect.options).filter((option) => option.value).length;

    expect(stateOptionsCount).toBe(27);
    expect(listarEstadosMock).toHaveBeenCalled();
  });

  it('lista nacionalidades retornadas pelo backend', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await screen.findByRole('option', { name: 'Estrangeiro(a)' });

    const nationalitySelect = screen.getByLabelText(/Nacionalidade/i) as HTMLSelectElement;
    const nationalityOptionsCount = Array.from(nationalitySelect.options).filter(
      (option) => option.value,
    ).length;

    expect(nationalityOptionsCount).toBe(2);
    expect(listarNacionalidadesMock).toHaveBeenCalled();
  });

  it('nao exibe nacionalidades locais quando o service retorna vazio', async () => {
    const user = userEvent.setup();
    listarNacionalidadesMock.mockResolvedValueOnce([]);

    renderForm();

    await preencherPasso1(user);
    await screen.findByText('Nenhuma nacionalidade encontrada.');

    const nationalitySelect = screen.getByLabelText(/Nacionalidade/i) as HTMLSelectElement;
    const nationalityOptionsCount = Array.from(nationalitySelect.options).filter(
      (option) => option.value,
    ).length;

    expect(nationalityOptionsCount).toBe(0);
  });

  it('nao exibe estados locais quando o service retorna vazio', async () => {
    const user = userEvent.setup();
    listarEstadosMock.mockResolvedValueOnce([]);

    renderForm();

    await preencherPasso1(user);
    await screen.findByText('Nenhum estado encontrado.');

    const stateSelect = screen.getByLabelText(/Estado/i) as HTMLSelectElement;
    const stateOptionsCount = Array.from(stateSelect.options).filter((option) => option.value).length;

    expect(stateOptionsCount).toBe(0);
  });

  it('carrega cidade por UF e limpa a cidade ao trocar o estado', async () => {
    const user = userEvent.setup();
    renderForm();

    await preencherPasso1(user);
    await screen.findByRole('option', { name: 'DF' });

    const citySelect = screen.getByLabelText(/Cidade/i) as HTMLSelectElement;
    expect(citySelect).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/Estado/i), 'DF');
    await screen.findByRole('option', { name: 'Brasilia' });
    expect(citySelect).toBeEnabled();
    await user.selectOptions(citySelect, 'Brasilia');
    expect(citySelect).toHaveValue('Brasilia');

    await user.selectOptions(screen.getByLabelText(/Estado/i), 'GO');
    await screen.findByRole('option', { name: 'Goiania' });
    expect(citySelect).toHaveValue('');
  });

  it('lista de escolaridade contem 5 opcoes', async () => {
    const user = userEvent.setup();
    renderForm();

    await irParaPasso3(user);

    const educationSelect = screen.getByLabelText(/Escolaridade/i) as HTMLSelectElement;
    const educationOptionsCount = Array.from(educationSelect.options).filter(
      (option) => option.value,
    ).length;

    expect(educationOptionsCount).toBe(5);
    expect(listarOpcoesAcademicasMock).toHaveBeenCalled();
  });

  it('nao exibe opcoes academicas locais quando o service retorna vazio', async () => {
    const user = userEvent.setup();
    listarOpcoesAcademicasMock.mockResolvedValueOnce({
      escolaridades: [],
      instituicoes: [],
      cursos: [],
      periodos: [],
      naoSeAplica: '',
    });

    renderForm();

    await irParaPasso3(user);

    const educationSelect = screen.getByLabelText(/Escolaridade/i) as HTMLSelectElement;
    const institutionSelect = screen.getByLabelText(/Institui/i) as HTMLSelectElement;
    const courseSelect = screen.getByLabelText(/Curso/i) as HTMLSelectElement;
    const periodSelect = screen.getByLabelText(/Per/i) as HTMLSelectElement;

    expect(Array.from(educationSelect.options).filter((option) => option.value)).toHaveLength(0);
    expect(Array.from(institutionSelect.options).filter((option) => option.value)).toHaveLength(0);
    expect(Array.from(courseSelect.options).filter((option) => option.value)).toHaveLength(0);
    expect(Array.from(periodSelect.options).filter((option) => option.value)).toHaveLength(0);
  });

  it('exibe erro inline no email quando a API retorna email ja cadastrado', async () => {
    const user = userEvent.setup();
    registerStudentMock.mockRejectedValueOnce(
      new RegisterStudentError('Email ja cadastrado.', { email: 'Email ja cadastrado.' }),
    );

    renderForm();
    await irParaPasso3(user);

    await user.selectOptions(screen.getByLabelText(/Escolaridade/i), 'Graduação');
    await user.selectOptions(screen.getByLabelText(/Instituição/i), 'Universidade de Brasilia');
    await user.selectOptions(screen.getByLabelText(/Curso/i), 'Medicina');
    await user.selectOptions(screen.getByLabelText(/Período/i), '3o Periodo');
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));

    const emailErrors = await screen.findAllByText(/Email ja cadastrado/i);
    expect(emailErrors).toHaveLength(1);
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
  });

  it('exibe erro inline no nickname quando a API retorna nickname em uso', async () => {
    const user = userEvent.setup();
    registerStudentMock.mockRejectedValueOnce(
      new RegisterStudentError('Nickname ja cadastrado.', {
        nickname: 'Nickname ja cadastrado.',
      }),
    );

    renderForm();
    await irParaPasso3(user);

    await user.selectOptions(screen.getByLabelText(/Escolaridade/i), 'Graduação');
    await user.selectOptions(screen.getByLabelText(/Instituição/i), 'Universidade de Brasilia');
    await user.selectOptions(screen.getByLabelText(/Curso/i), 'Medicina');
    await user.selectOptions(screen.getByLabelText(/Período/i), '3o Periodo');
    await user.click(screen.getByRole('button', { name: /Completar cadastro/i }));

    const nicknameErrors = await screen.findAllByText(/Nickname ja cadastrado/i);
    expect(nicknameErrors).toHaveLength(1);
    expect(screen.getByLabelText(/Nickname/i)).toBeInTheDocument();
  });
});
