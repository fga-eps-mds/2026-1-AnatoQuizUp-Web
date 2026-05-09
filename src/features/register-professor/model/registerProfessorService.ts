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

const mapValuesToPayload = (
  values: RegisterProfessorFormValues,
): RegisterProfessorApiPayload => ({
  nome: values.fullName.trim(),
  email: values.email.trim().toLowerCase(),
  siape: values.siape.trim(),
  instituicao: values.institution,
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

const extractFieldError = (
  response: ApiErroResponse,
  field: Extract<RegisterProfessorField, 'email' | 'siape'>,
): string | null => {
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
      return /cadastrado|uso|existente|ja|já/i.test(backendMessage)
        ? backendMessage
        : fieldValue;
    }

    const properties = (detalhes as { properties?: Record<string, unknown> }).properties;
    const propertyMessage = properties ? getNestedValidationMessage(properties[field]) : null;
    if (propertyMessage) return propertyMessage;
  }

  if (
    new RegExp(field, 'i').test(backendMessage) &&
    /cadastrado|uso|existente|ja|já/i.test(backendMessage)
  ) {
    return backendMessage;
  }

  return null;
};

export const registerProfessor = async (
  values: RegisterProfessorFormValues,
): Promise<void> => {
  if (USE_MOCKS) {
    await registerProfessorMock(values);
    return;
  }

  try {
    await httpClient.post('/auth/professores/register', mapValuesToPayload(values));
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw new RegisterProfessorError('Não foi possível concluir o cadastro. Tente novamente.');
    }

    if (!error.response) {
      throw new RegisterProfessorError('Não foi possível conectar ao servidor. Tente novamente.');
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

    throw new RegisterProfessorError(
      backendMessage || 'Não foi possível concluir o cadastro. Tente novamente.',
    );
  }
};
