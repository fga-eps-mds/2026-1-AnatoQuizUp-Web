// Servico que fornece a lista de nacionalidades para o cadastro de aluno.
// Usa a constante local em modo mock; senao, consulta o endpoint da API.
import { USE_MOCKS } from '../config/env';
import { NACIONALIDADES } from '../constants/nacionalidades';
import { httpClient } from './httpClient';

// Envelope de sucesso da API (dados opcional).
type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

/**
 * Lista as nacionalidades disponiveis.
 * @returns lista de nacionalidades (vazia se a resposta nao for um array)
 */
export const listarNacionalidades = async (): Promise<string[]> => {
  if (USE_MOCKS) {
    return NACIONALIDADES;
  }
  const { data } = await httpClient.get<ApiSuccessResponse<string[]>>(
    '/autenticacao/alunos/nacionalidades',
  );
  return Array.isArray(data.dados) ? data.dados : [];
};
