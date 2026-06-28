// Servico de cadastro de professor. Mapeia os valores do formulario para o
// payload da API (instituicao fixa "UnB") e envia o cadastro. Concentra a
// interpretacao dos varios formatos de erro do backend, extraindo mensagens
// especificas para os campos unicos (email e SIAPE) quando possivel.
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

/**
 * Erro de dominio do cadastro de professor; pode carregar `fieldErrors` para
 * destacar campos especificos (ex.: email/SIAPE ja em uso) no formulario.
 */
export class RegisterProfessorError extends Error {
  public readonly fieldErrors?: RegisterProfessorFieldErrors;

  constructor(message: string, fieldErrors?: RegisterProfessorFieldErrors) {
    super(message);
    this.name = 'RegisterProfessorError';
    this.fieldErrors = fieldErrors;
  }
}

// Detalhe de erro por campo { campo, mensagem }.
type ApiErroDetalhe = {
  campo?: string;
  mensagem?: string;
};

// Formato (heterogeneo) das respostas de erro da API.
type ApiErroResponse = {
  mensagem?: string;
  erro?: {
    mensagem?: string;
    detalhes?: ApiErroDetalhe[] | Record<string, unknown>;
  };
  message?: string;
};

// Campos cuja unicidade o backend valida (email e SIAPE).
type ProfessorUniqueField = Extract<RegisterProfessorField, 'email' | 'siape'>;

// Endpoint, mensagens padrao e regex usados na deteccao de erros duplicados.
const PROFESSOR_REGISTER_ENDPOINT = '/autenticacao/cadastro/professor';
const GENERIC_REGISTER_ERROR = 'Não foi possível concluir o cadastro. Tente novamente.';
const SERVER_UNAVAILABLE_ERROR = 'Não foi possível conectar ao servidor. Tente novamente.';
const DUPLICATED_FIELD_MESSAGE_REGEX = /cadastrado|uso|existente|ja|já/i;
const FIELD_MESSAGE_REGEX: Record<ProfessorUniqueField, RegExp> = {
  email: /email/i,
  siape: /siape/i,
};

/**
 * Monta o payload da API a partir do formulario, normalizando os campos e
 * fixando a instituicao como "UnB".
 * @param values valores do formulario de professor
 */
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

// Extrai a mensagem geral de erro tentando os varios campos possiveis.
const getBackendMessage = (response: ApiErroResponse): string =>
  response.erro?.mensagem ?? response.mensagem ?? response.message ?? '';

// Tenta extrair a primeira mensagem de validacao de `{ errors: [string, ...] }`.
const getNestedValidationMessage = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const errors = (value as { errors?: unknown }).errors;
  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0];
  }

  return null;
};

// Erro do campo quando os detalhes vem como array { campo, mensagem }.
const extractFieldErrorFromList = (
  detalhes: ApiErroDetalhe[] | undefined,
  field: ProfessorUniqueField,
  backendMessage: string,
): string | null => {
  const fieldDetail = detalhes?.find((detalhe) => detalhe.campo === field);
  return fieldDetail ? fieldDetail.mensagem ?? backendMessage : null;
};

// Erro do campo quando os detalhes vem como objeto indexado por campo.
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

// Erro do campo por heuristica: a mensagem geral cita o campo e indica duplicidade.
const extractFieldErrorFromMessage = (
  backendMessage: string,
  field: ProfessorUniqueField,
): string | null =>
  FIELD_MESSAGE_REGEX[field].test(backendMessage) &&
  DUPLICATED_FIELD_MESSAGE_REGEX.test(backendMessage)
    ? backendMessage
    : null;

/**
 * Tenta obter a mensagem de erro especifica de um campo unico (email/SIAPE),
 * passando pelas tres estrategias: lista, objeto e heuristica sobre a mensagem.
 * @param response resposta de erro da API
 * @param field campo de interesse
 */
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

/**
 * Efetua o cadastro do professor. Usa o mock quando habilitado; senao envia o
 * payload e traduz erros em RegisterProfessorError, destacando email/SIAPE quando
 * o backend indica duplicidade.
 * @param values valores completos do formulario
 * @throws RegisterProfessorError em qualquer falha
 */
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
    // Erro fora do axios: falha generica.
    if (!axios.isAxiosError(error)) {
      throw new RegisterProfessorError(GENERIC_REGISTER_ERROR);
    }

    // Sem resposta: provavel falha de conexao.
    if (!error.response) {
      throw new RegisterProfessorError(SERVER_UNAVAILABLE_ERROR);
    }

    // Ha resposta: isola erros por campo antes de cair na mensagem geral.
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
