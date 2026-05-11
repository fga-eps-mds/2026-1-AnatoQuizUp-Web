import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import { registerProfessorMock } from './mockRegisterProfessorService';
import type {
  RegisterProfessorApiPayload,
  RegisterProfessorField,
  RegisterProfessorFieldErrors,
  RegisterProfessorFormValues,
} from './types';

export class RegisterProfessorError extends Error {
  public readonly fieldErrors?: RegisterProfessorFieldErrors;

  constructor(message: string, fieldErrors?: RegisterProfessorFieldErrors) {
    super(message);
    this.name = 'RegisterProfessorError';
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

type ProfessorUniqueField = Extract<RegisterProfessorField, 'email' | 'siape'>;

const PROFESSOR_REGISTER_ENDPOINT = '/autenticacao/cadastro/professor';
const GENERIC_REGISTER_ERROR = 'Não foi possível concluir o cadastro. Tente novamente.';
const SERVER_UNAVAILABLE_ERROR = 'Não foi possível conectar ao servidor. Tente novamente.';
const DUPLICATED_FIELD_MESSAGE_REGEX = /cadastrado|uso|existente|ja|já/i;
const FIELD_MESSAGE_REGEX: Record<ProfessorUniqueField, RegExp> = {
  email: /email/i,
  siape: /siape/i,
};

const mapValuesToPayload = (
  values: RegisterProfessorFormValues,
): RegisterProfessorApiPayload => ({
  nome: values.fullName.trim(),
  email: values.email.trim().toLowerCase(),
  siape: values.siape.trim(),
  instituicao: 'UnB',
  departamento: values.department.trim(),
  curso: values.course.trim(),
  senha: values.password,
  confirmacaoSenha: values.confirmPassword,
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

const extractFieldErrorFromList = (
  detalhes: ApiErroDetalhe[] | undefined,
  field: ProfessorUniqueField,
  backendMessage: string,
): string | null => {
  const fieldDetail = detalhes?.find((detalhe) => detalhe.campo === field);
  return fieldDetail ? fieldDetail.mensagem ?? backendMessage : null;
};

const extractFieldErrorFromObject = (
  detalhes: Record<string, unknown>,
  field: ProfessorUniqueField,
  backendMessage: string,
): string | null => {
  const fieldValue = detalhes[field];
  const nestedMessage = getNestedValidationMessage(fieldValue);
  if (nestedMessage) return nestedMessage;

  if (typeof fieldValue === 'string') {
    return DUPLICATED_FIELD_MESSAGE_REGEX.test(backendMessage)
      ? backendMessage
      : fieldValue;
  }

  const properties = (detalhes as { properties?: Record<string, unknown> }).properties;
  return properties ? getNestedValidationMessage(properties[field]) : null;
};

const extractFieldErrorFromMessage = (
  backendMessage: string,
  field: ProfessorUniqueField,
): string | null =>
  FIELD_MESSAGE_REGEX[field].test(backendMessage) &&
  DUPLICATED_FIELD_MESSAGE_REGEX.test(backendMessage)
    ? backendMessage
    : null;

const extractFieldError = (
  response: ApiErroResponse,
  field: ProfessorUniqueField,
): string | null => {
  const detalhes = response.erro?.detalhes;
  const backendMessage = getBackendMessage(response);

  if (Array.isArray(detalhes)) {
    return extractFieldErrorFromList(detalhes, field, backendMessage);
  }

  if (detalhes && typeof detalhes === 'object') {
    const objectMessage = extractFieldErrorFromObject(
      detalhes as Record<string, unknown>,
      field,
      backendMessage,
    );
    if (objectMessage) return objectMessage;
  }

  return extractFieldErrorFromMessage(backendMessage, field);
};

export const registerProfessor = async (
  values: RegisterProfessorFormValues,
): Promise<void> => {
  if (USE_MOCKS) {
    await registerProfessorMock(values);
    return;
  }

  try {
    await httpClient.post(PROFESSOR_REGISTER_ENDPOINT, mapValuesToPayload(values));
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new RegisterProfessorError(GENERIC_REGISTER_ERROR);
    }

    if (!error.response) {
      throw new RegisterProfessorError(SERVER_UNAVAILABLE_ERROR);
    }

    const responseData = (error.response.data ?? {}) as ApiErroResponse;
    const backendMessage = getBackendMessage(responseData);
    const emailError = extractFieldError(responseData, 'email');
    const siapeError = extractFieldError(responseData, 'siape');

    if (emailError) {
      throw new RegisterProfessorError(emailError, { email: emailError });
    }

    if (siapeError) {
      throw new RegisterProfessorError(siapeError, { siape: siapeError });
    }

    throw new RegisterProfessorError(backendMessage || GENERIC_REGISTER_ERROR);
  }
};
