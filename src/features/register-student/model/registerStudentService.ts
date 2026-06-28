// Servico de cadastro de aluno. Mapeia os valores do formulario para o payload
// da API, envia o cadastro e verifica a disponibilidade de email/nickname.
// Concentra tambem o tratamento dos varios formatos de erro que o backend pode
// retornar, convertendo-os em RegisterStudentError com erros por campo quando possivel.
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

/**
 * Erro de dominio do cadastro de aluno. Alem da mensagem geral, pode carregar
 * `fieldErrors` para que o formulario destaque os campos especificos com problema.
 */
export class RegisterStudentError extends Error {
  public readonly fieldErrors?: RegisterStudentFieldErrors;

  constructor(message: string, fieldErrors?: RegisterStudentFieldErrors) {
    super(message);
    this.name = 'RegisterStudentError';
    this.fieldErrors = fieldErrors;
  }
}

// Detalhe de erro por campo no formato { campo, mensagem }.
type ApiErroDetalhe = {
  campo?: string;
  mensagem?: string;
};

// Formato (heterogeneo) das respostas de erro da API que precisamos interpretar.
type ApiErroResponse = {
  mensagem?: string;
  erro?: {
    mensagem?: string;
    detalhes?: ApiErroDetalhe[] | Record<string, unknown>;
  };
  message?: string;
};

// Envelope de sucesso da API: mensagem + payload em "dados".
type ApiSuccessResponse<T> = {
  mensagem: string;
  dados: T;
};

// Resposta das checagens de disponibilidade (email/nickname).
type AvailabilityResponse = {
  disponivel: boolean;
};

// Valores de escolaridade aceitos pela API, na mesma ordem de ESCOLARIDADES (UI).
const ESCOLARIDADE_API_VALUES = [
  'ENSINO_FUNDAMENTAL',
  'ENSINO_MEDIO',
  'GRADUACAO',
  'POS_GRADUACAO',
  'OUTRO',
] as const;

type EscolaridadeApiValue = (typeof ESCOLARIDADE_API_VALUES)[number];

/**
 * Converte o rotulo de escolaridade da UI no enum esperado pela API (por indice),
 * caindo em 'OUTRO' quando nao houver correspondencia.
 * @param value rotulo selecionado no formulario
 */
const mapEscolaridadeToApi = (value: string): EscolaridadeApiValue => {
  const index = ESCOLARIDADES.indexOf(value);
  return ESCOLARIDADE_API_VALUES[index] ?? 'OUTRO';
};

/**
 * Monta o payload da API a partir dos valores do formulario, normalizando
 * (trim/lowercase) e traduzindo nomes de campos PT-BR.
 * @param values valores do formulario
 */
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

// Extrai a mensagem de erro do backend tentando os varios campos possiveis.
const getBackendMessage = (response: ApiErroResponse): string =>
  response.erro?.mensagem ?? response.mensagem ?? response.message ?? '';

/**
 * Tenta extrair a primeira mensagem de validacao de uma estrutura aninhada do
 * tipo `{ errors: [string, ...] }`.
 * @param value valor possivelmente contendo erros de validacao
 */
const getNestedValidationMessage = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const errors = (value as { errors?: unknown }).errors;
  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0];
  }

  return null;
};

/**
 * Procura, nos varios formatos possiveis de resposta de erro, uma mensagem
 * especifica para o campo informado (email ou nickname). Cobre detalhes em
 * array, em objeto, em `properties` e ate heuristica sobre a mensagem geral.
 * @param response resposta de erro da API
 * @param field campo de interesse
 * @returns mensagem do campo ou null se nao houver
 */
const extractFieldError = (response: ApiErroResponse, field: 'email' | 'nickname'): string | null => {
  const detalhes = response.erro?.detalhes;
  const backendMessage = getBackendMessage(response);

  // Caso 1: detalhes em array no formato { campo, mensagem }.

  if (Array.isArray(detalhes)) {
    const fieldDetail = detalhes.find((detalhe) => detalhe.campo === field);
    if (fieldDetail) return fieldDetail.mensagem ?? backendMessage;
  }

  // Caso 2: detalhes em objeto indexado por campo (varios sub-formatos).
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

  // Caso 3: heuristica sobre a mensagem geral (cita o campo e indica "ja em uso").
  if (new RegExp(field, 'i').test(backendMessage) && /cadastrado|uso|existente|ja/i.test(backendMessage)) {
    return backendMessage;
  }

  return null;
};

/**
 * Efetua o cadastro do aluno. Usa o mock quando habilitado; caso contrario, envia
 * o payload a API e traduz qualquer erro em RegisterStudentError (com erros de
 * email/nickname destacados quando o backend os informa).
 * @param values valores completos do formulario
 * @throws RegisterStudentError em qualquer falha de rede ou validacao
 */
export const registerStudent = async (values: RegisterStudentFormValues): Promise<void> => {
  // Em modo mock, nao toca na rede.
  if (USE_MOCKS) {
    await registerStudentMock(values);
    return;
  }

  try {
    await httpClient.post('/autenticacao/cadastro', mapValuesToPayload(values));
  } catch (error) {
    // Erro que nao e do axios: falha inesperada generica.
    if (!axios.isAxiosError(error)) {
      throw new RegisterStudentError('Nao foi possivel concluir o cadastro. Tente novamente.');
    }

    // Sem resposta: provavelmente falha de conexao.
    if (!error.response) {
      throw new RegisterStudentError('Nao foi possivel conectar ao servidor. Tente novamente.');
    }

    // Ha resposta de erro: tenta isolar mensagens por campo antes da geral.
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

/**
 * Verifica, antes de avancar no cadastro, se email e nickname ainda estao
 * disponiveis (duas chamadas em paralelo). Lanca RegisterStudentError com os
 * campos indisponiveis quando algum ja estiver em uso.
 * @param values email e nickname a checar
 * @throws RegisterStudentError quando indisponivel ou em falha de rede
 */
export const validateRegisterStudentIdentity = async (
  values: Pick<RegisterStudentFormValues, 'email' | 'nickname'>,
): Promise<void> => {
  // Em modo mock, considera sempre disponivel.
  if (USE_MOCKS) return;

  try {
    const email = values.email.trim().toLowerCase();
    const nickname = values.nickname.trim().toLowerCase();
    const [{ data: emailData }, { data: nicknameData }] = await Promise.all([
      httpClient.get<ApiSuccessResponse<AvailabilityResponse & { email: string }>>(
        '/autenticacao/alunos/email-disponivel',
        { params: { email } },
      ),
      httpClient.get<ApiSuccessResponse<AvailabilityResponse & { nickname: string }>>(
        '/autenticacao/alunos/nickname-disponivel',
        { params: { nickname } },
      ),
    ]);
    // Monta os erros de campo conforme a disponibilidade retornada.
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
    // Erro de dominio ja tratado: apenas repropaga.
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
