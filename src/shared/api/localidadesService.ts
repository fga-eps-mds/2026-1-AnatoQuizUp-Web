// Servico de localidades (estados e cidades) usado no cadastro de aluno. Quando
// os mocks estao habilitados, devolve as listas locais; caso contrario, consulta
// os endpoints publicos de localidades da API.
import { USE_MOCKS } from '../config/env';
import { listarCidadesLocaisPorUf, type Cidade } from '../constants/cidades';
import { ESTADOS_BRASIL, type Estado } from '../constants/estados';
import { httpClient } from './httpClient';

// Envelope de sucesso da API (dados pode vir ausente em respostas vazias).
type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

/**
 * Lista os estados (UFs). Usa a lista local em modo mock; senao, consulta a API.
 * @returns lista de estados (vazia se a resposta nao for um array)
 */
export const listarEstados = async (): Promise<Estado[]> => {
  if (USE_MOCKS) {
    return ESTADOS_BRASIL;
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Estado[]>>(
    '/autenticacao/alunos/localidades/estados',
  );
  return Array.isArray(data.dados) ? data.dados : [];
};

/**
 * Lista as cidades de uma UF. Normaliza a UF (trim/maiuscula) e retorna vazio se ausente.
 * @param uf sigla do estado
 * @returns lista de cidades da UF
 */
export const listarCidadesPorUf = async (uf: string): Promise<Cidade[]> => {
  const normalizedUf = uf.trim().toUpperCase();
  if (!normalizedUf) return [];

  if (USE_MOCKS) {
    return listarCidadesLocaisPorUf(normalizedUf);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Cidade[]>>(
    `/autenticacao/alunos/localidades/estados/${normalizedUf}/cidades`,
  );
  return Array.isArray(data.dados) ? data.dados : [];
};
