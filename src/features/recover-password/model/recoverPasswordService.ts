import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';

type BackendMessageResponse = {
  mensagem: string;
  dados: null;
};

const extractErrorMessage = (err: unknown): string | null => {
  if (!axios.isAxiosError(err) || !err.response) return null;

  const responseData = err.response.data as {
    message?: string;
    mensagem?: string;
    erro?: { mensagem?: string };
  };

  return responseData.erro?.mensagem ?? responseData.mensagem ?? responseData.message ?? null;
};

export const requestPasswordRecovery = async (email: string): Promise<string> => {
  try {
    const { data } = await httpClient.post<BackendMessageResponse>('/auth/forgot-password', {
      email,
    });

    return data.mensagem;
  } catch (err) {
    const message = extractErrorMessage(err);
    throw new Error(message ?? 'Nao foi possivel enviar as instrucoes de recuperacao.');
  }
};

export const resetPassword = async (token: string, senha: string): Promise<string> => {
  try {
    const { data } = await httpClient.post<BackendMessageResponse>('/auth/reset-password', {
      token,
      senha,
    });

    return data.mensagem;
  } catch (err) {
    const message = extractErrorMessage(err);
    throw new Error(message ?? 'Link expirado ou invalido.');
  }
};
