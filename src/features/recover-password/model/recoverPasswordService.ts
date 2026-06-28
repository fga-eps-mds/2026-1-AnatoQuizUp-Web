// Servico de recuperacao de senha. Solicita o envio das instrucoes por email e
// redefine a senha a partir do token recebido, devolvendo a mensagem do backend
// ou lancando um erro com mensagem amigavel.
import axios from 'axios';
import { httpClient } from '../../../shared/api/httpClient';

// Resposta padrao do backend para essas operacoes (apenas mensagem).
type BackendMessageResponse = {
  mensagem: string;
  dados: null;
};

/**
 * Extrai a mensagem de erro de uma resposta do backend (varios formatos).
 * @param err erro capturado
 * @returns mensagem do backend ou null
 */
const extractErrorMessage = (err: unknown): string | null => {
  if (!axios.isAxiosError(err) || !err.response) return null;

  const responseData = err.response.data as {
    message?: string;
    mensagem?: string;
    erro?: { mensagem?: string };
  };

  return responseData.erro?.mensagem ?? responseData.mensagem ?? responseData.message ?? null;
};

// POST /autenticacao/recuperar-senha — solicita o email com instrucoes de recuperacao.
export const requestPasswordRecovery = async (email: string): Promise<string> => {
  try {
    const { data } = await httpClient.post<BackendMessageResponse>('/autenticacao/recuperar-senha', {
      email,
    });

    return data.mensagem;
  } catch (err) {
    const message = extractErrorMessage(err);
    throw new Error(message ?? 'Nao foi possivel enviar as instrucoes de recuperacao.');
  }
};

// POST /autenticacao/redefinir-senha — redefine a senha usando o token recebido.
export const resetPassword = async (token: string, senha: string): Promise<string> => {
  try {
    const { data } = await httpClient.post<BackendMessageResponse>('/autenticacao/redefinir-senha', {
      token,
      senha,
    });

    return data.mensagem;
  } catch (err) {
    const message = extractErrorMessage(err);
    throw new Error(message ?? 'Link expirado ou invalido.');
  }
};
