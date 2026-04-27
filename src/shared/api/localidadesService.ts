import { USE_MOCKS } from '../config/env';
import { listarCidadesLocaisPorUf, type Cidade } from '../constants/cidades';
import { ESTADOS_BRASIL, type Estado } from '../constants/estados';
import { httpClient } from './httpClient';

type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

export const listarEstados = async (): Promise<Estado[]> => {
  if (USE_MOCKS) {
    return ESTADOS_BRASIL;
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Estado[]>>(
    '/auth/alunos/localidades/estados',
  );
  return Array.isArray(data.dados) ? data.dados : [];
};

export const listarCidadesPorUf = async (uf: string): Promise<Cidade[]> => {
  const normalizedUf = uf.trim().toUpperCase();
  if (!normalizedUf) return [];

  if (USE_MOCKS) {
    return listarCidadesLocaisPorUf(normalizedUf);
  }

  const { data } = await httpClient.get<ApiSuccessResponse<Cidade[]>>(
    `/auth/alunos/localidades/estados/${normalizedUf}/cidades`,
  );
  return Array.isArray(data.dados) ? data.dados : [];
};
