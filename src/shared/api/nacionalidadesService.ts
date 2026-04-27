import { USE_MOCKS } from '../config/env';
import { NACIONALIDADES } from '../constants/nacionalidades';
import { httpClient } from './httpClient';

type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

export const listarNacionalidades = async (): Promise<string[]> => {
  if (USE_MOCKS) {
    return NACIONALIDADES;
  }

  const { data } = await httpClient.get<ApiSuccessResponse<string[]>>('/auth/alunos/nacionalidades');
  return Array.isArray(data.dados) ? data.dados : [];
};
