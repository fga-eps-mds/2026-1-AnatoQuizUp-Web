import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import { ESCOLARIDADES } from '../../../shared/constants/escolaridade';
import { registerStudentMock } from './mockRegisterStudentService';
import type {
  RegisterStudentApiPayload,
  RegisterStudentFieldErrors,
  RegisterStudentFormValues,
} from './types';

export class RegisterStudentError extends Error {
  public readonly fieldErrors?: RegisterStudentFieldErrors;

  constructor(message: string, fieldErrors?: RegisterStudentFieldErrors) {
    super(message);
    this.name = 'RegisterStudentError';
    this.fieldErrors = fieldErrors;
  }
}

type ApiErroDetalhe = {
  campo?: string;
  mensagem?: string;
};

type ApiErroResponse = {
  mensagem?: string;
  erro?: {
    mensagem?: string;
    detalhes?: ApiErroDetalhe[] | Record<string, unknown>;
  };
  message?: string;
};

type ApiSuccessResponse<T> = {
  mensagem: string;
  dados: T;
};

type AvailabilityResponse = {
  disponivel: boolean;
};

const ESCOLARIDADE_API_VALUES = [
  'ENSINO_FUNDAMENTAL',
  'ENSINO_MEDIO',
  'GRADUACAO',
  'POS_GRADUACAO',
  'OUTRO',
] as const;

type EscolaridadeApiValue = (typeof ESCOLARIDADE_API_VALUES)[number];

const mapEscolaridadeToApi = (value: string): EscolaridadeApiValue => {
  const index = ESCOLARIDADES.indexOf(value);
  return ESCOLARIDADE_API_VALUES[index] ?? 'OUTRO';
};

const mapValuesToPayload = (values: RegisterStudentFormValues): RegisterStudentApiPayload => ({
  nome: values.fullName.trim(),
  nickname: values.nickname.trim().toLowerCase(),
  email: values.email.trim().toLowerCase(),
  senha: values.password,
  confirmacaoSenha: values.confirmPassword,
  dataNascimento: values.birthDate,
  nacionalidade: values.nationality,
  estado: values.state,
  cidade: values.city.trim(),
  escolaridade: mapEscolaridadeToApi(values.education),
  instituicao: values.institution,
  curso: values.course,
  periodo: values.period,
});

const getBackendMessage = (response: ApiErroResponse): string =>
  response.erro?.mensagem ?? response.mensagem ?? response.message ?? '';

const getNestedValidationMessage = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const errors = (value as { errors?: unknown }).errors;
  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0];
  }

  return null;
};

const extractFieldError = (response: ApiErroResponse, field: 'email' | 'nickname'): string | null => {
  const detalhes = response.erro?.detalhes;
  const backendMessage = getBackendMessage(response);

  if (Array.isArray(detalhes)) {
    const fieldDetail = detalhes.find((detalhe) => detalhe.campo === field);
    if (fieldDetail) return fieldDetail.mensagem ?? backendMessage;
  }

  if (detalhes && typeof detalhes === 'object') {
    const fieldValue = (detalhes as Record<string, unknown>)[field];
    const nestedMessage = getNestedValidationMessage(fieldValue);
    if (nestedMessage) return nestedMessage;

    if (typeof fieldValue === 'string') {
      return /cadastrado|uso|existente|ja/i.test(backendMessage) ? backendMessage : fieldValue;
    }

    const properties = (detalhes as { properties?: Record<string, unknown> }).properties;
    const propertyMessage = properties ? getNestedValidationMessage(properties[field]) : null;
    if (propertyMessage) return propertyMessage;
  }

  if (new RegExp(field, 'i').test(backendMessage) && /cadastrado|uso|existente|ja/i.test(backendMessage)) {
    return backendMessage;
  }

  return null;
};

export const registerStudent = async (values: RegisterStudentFormValues): Promise<void> => {
  if (USE_MOCKS) {
    await registerStudentMock(values);
    return;
  }

  try {
    await httpClient.post('/auth/register', mapValuesToPayload(values));
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new RegisterStudentError('Nao foi possivel concluir o cadastro. Tente novamente.');
    }

    if (!error.response) {
      throw new RegisterStudentError('Nao foi possivel conectar ao servidor. Tente novamente.');
    }

    const responseData = (error.response.data ?? {}) as ApiErroResponse;
    const backendMessage = getBackendMessage(responseData);
    const emailError = extractFieldError(responseData, 'email');
    const nicknameError = extractFieldError(responseData, 'nickname');

    if (emailError) {
      throw new RegisterStudentError(emailError, { email: emailError });
    }

    if (nicknameError) {
      throw new RegisterStudentError(nicknameError, { nickname: nicknameError });
    }

    throw new RegisterStudentError(
      backendMessage || 'Nao foi possivel concluir o cadastro. Tente novamente.',
    );
  }
};

export const validateRegisterStudentIdentity = async (
  values: Pick<RegisterStudentFormValues, 'email' | 'nickname'>,
): Promise<void> => {
  if (USE_MOCKS) return;

  try {
    const email = values.email.trim().toLowerCase();
    const nickname = values.nickname.trim().toLowerCase();
    const [{ data: emailData }, { data: nicknameData }] = await Promise.all([
      httpClient.get<ApiSuccessResponse<AvailabilityResponse & { email: string }>>(
        '/auth/alunos/email-disponivel',
        { params: { email } },
      ),
      httpClient.get<ApiSuccessResponse<AvailabilityResponse & { nickname: string }>>(
        '/auth/alunos/nickname-disponivel',
        { params: { nickname } },
      ),
    ]);
    const fieldErrors: RegisterStudentFieldErrors = {};

    if (!emailData.dados.disponivel) {
      fieldErrors.email = 'Ja existe um usuario cadastrado com este email.';
    }

    if (!nicknameData.dados.disponivel) {
      fieldErrors.nickname = 'Ja existe um usuario cadastrado com este nickname.';
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new RegisterStudentError('Dados de cadastro indisponiveis.', fieldErrors);
    }
  } catch (error) {
    if (error instanceof RegisterStudentError) {
      throw error;
    }

    if (!axios.isAxiosError(error)) {
      throw new RegisterStudentError('Nao foi possivel validar email e nickname. Tente novamente.');
    }

    if (!error.response) {
      throw new RegisterStudentError('Nao foi possivel conectar ao servidor. Tente novamente.');
    }

    const responseData = (error.response.data ?? {}) as ApiErroResponse;
    const backendMessage = getBackendMessage(responseData);
    const emailError = extractFieldError(responseData, 'email');
    const nicknameError = extractFieldError(responseData, 'nickname');

    if (emailError || nicknameError) {
      throw new RegisterStudentError(backendMessage || 'Revise email e nickname.', {
        ...(emailError ? { email: emailError } : {}),
        ...(nicknameError ? { nickname: nicknameError } : {}),
      });
    }

    throw new RegisterStudentError(
      backendMessage || 'Nao foi possivel validar email e nickname. Tente novamente.',
    );
  }
};
