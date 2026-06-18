import axios from 'axios';

import { httpClient } from '../../../shared/api/httpClient';
import { USE_MOCKS } from '../../../shared/config/env';
import { alterarSenhaMock, atualizarDadosPessoaisMock } from './mockEditarContaService';
import type { AlterarSenhaPayload, AtualizarDadosPessoaisPayload } from './types';
import { ApelidoEmUsoError, SenhaAtualIncorretaError } from './types';

type ApiErroDetalhe = {
  campo?: string;
  mensagem?: string;
};

type ApiErroResponse = {
  mensagem?: string;
  message?: string;
  erro?: {
    codigo?: string;
    mensagem?: string;
    detalhes?: ApiErroDetalhe[] | Record<string, unknown>;
  };
};

const obterMensagemBackend = (response: ApiErroResponse): string =>
  response.erro?.mensagem ?? response.mensagem ?? response.message ?? '';

const obterMensagemAninhada = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const errors = (value as { errors?: unknown }).errors;
  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0];
  }

  return null;
};

const extrairErroCampo = (response: ApiErroResponse, campo: string): string | null => {
  const detalhes = response.erro?.detalhes;
  const mensagemBackend = obterMensagemBackend(response);

  if (Array.isArray(detalhes)) {
    const detalheCampo = detalhes.find((detalhe) => detalhe.campo === campo);
    if (detalheCampo) return detalheCampo.mensagem ?? mensagemBackend;
  }

  if (detalhes && typeof detalhes === 'object') {
    const valorCampo = (detalhes as Record<string, unknown>)[campo];
    const mensagemAninhada = obterMensagemAninhada(valorCampo);
    if (mensagemAninhada) return mensagemAninhada;

    if (typeof valorCampo === 'string') {
      return /cadastrado|uso|existente|incorreta|invalida|inválida|erro/i.test(mensagemBackend)
        ? mensagemBackend
        : valorCampo;
    }

    const propriedades = (detalhes as { properties?: Record<string, unknown> }).properties;
    const mensagemPropriedade = propriedades ? obterMensagemAninhada(propriedades[campo]) : null;
    if (mensagemPropriedade) return mensagemPropriedade;
  }

  return null;
};

const obterRespostaErro = (err: unknown): ApiErroResponse | null => {
  if (!axios.isAxiosError(err) || !err.response) return null;

  return (err.response.data ?? {}) as ApiErroResponse;
};

const normalizarDadosPessoais = (
  payload: AtualizarDadosPessoaisPayload,
): AtualizarDadosPessoaisPayload => ({
  nome: payload.nome.trim(),
  nickname: payload.nickname.trim().toLowerCase(),
});

export const atualizarDadosPessoais = async (
  payload: AtualizarDadosPessoaisPayload,
): Promise<void> => {
  const dadosNormalizados = normalizarDadosPessoais(payload);

  if (USE_MOCKS) {
    return atualizarDadosPessoaisMock(dadosNormalizados);
  }

  try {
    await httpClient.patch('/usuarios/eu', dadosNormalizados);
  } catch (err) {
    if (!axios.isAxiosError(err)) {
      throw new Error('Nao foi possivel salvar suas informacoes. Tente novamente.');
    }

    if (!err.response) {
      throw new Error('Nao foi possivel conectar ao servidor. Tente novamente.');
    }

    const resposta = obterRespostaErro(err) ?? {};
    const mensagem = obterMensagemBackend(resposta);
    const erroNickname = extrairErroCampo(resposta, 'nickname');

    if (err.response.status === 409 || erroNickname) {
      throw new ApelidoEmUsoError(
        erroNickname || mensagem || 'Ja existe um usuario cadastrado com este nickname.',
      );
    }

    throw new Error(mensagem || 'Nao foi possivel salvar suas informacoes. Tente novamente.');
  }
};

export const alterarSenha = async (payload: AlterarSenhaPayload): Promise<void> => {
  if (USE_MOCKS) {
    return alterarSenhaMock(payload);
  }

  try {
    await httpClient.patch('/usuarios/eu/senha', payload);
  } catch (err) {
    if (!axios.isAxiosError(err)) {
      throw new Error('Nao foi possivel alterar a senha. Tente novamente.');
    }

    if (!err.response) {
      throw new Error('Nao foi possivel conectar ao servidor. Tente novamente.');
    }

    const resposta = obterRespostaErro(err) ?? {};
    const mensagem = obterMensagemBackend(resposta);
    const codigo = resposta.erro?.codigo;
    const erroSenhaAtual = extrairErroCampo(resposta, 'senhaAtual');

    if (
      err.response.status === 400 &&
      (codigo === 'REQUISICAO_INVALIDA' ||
        Boolean(erroSenhaAtual) ||
        /senha atual incorreta/i.test(mensagem))
    ) {
      throw new SenhaAtualIncorretaError(erroSenhaAtual || mensagem || 'Senha atual incorreta.');
    }

    throw new Error(mensagem || 'Nao foi possivel alterar a senha. Tente novamente.');
  }
};

export { ApelidoEmUsoError, SenhaAtualIncorretaError };
export type { AlterarSenhaPayload, AtualizarDadosPessoaisPayload };
