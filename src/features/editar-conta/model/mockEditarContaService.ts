import { atualizarUsuarioAutenticadoMock } from '../../auth-by-credencials/model/mockAuthService';
import type { AlterarSenhaPayload, AtualizarDadosPessoaisPayload } from './types';
import { ApelidoEmUsoError, SenhaAtualIncorretaError } from './types';

// Servico falso (mock) de edicao de conta usado em desenvolvimento/testes.

// Nicknames que o mock considera "ja em uso" e a senha atual aceita.
const NICKNAMES_EM_USO = new Set(['em_uso', 'emuso', 'ocupado']);
const SENHA_ATUAL_MOCK = 'atual123';

/** Simula a atualizacao de dados pessoais, lancando erro para nicknames reservados. */
export const atualizarDadosPessoaisMock = async (
  payload: AtualizarDadosPessoaisPayload,
): Promise<void> => {
  const nome = payload.nome.trim();
  const nickname = payload.nickname.trim().toLowerCase();

  if (NICKNAMES_EM_USO.has(nickname)) {
    throw new ApelidoEmUsoError('Ja existe um usuario cadastrado com este nickname.');
  }

  atualizarUsuarioAutenticadoMock({
    name: nome,
    nickname,
  });
};

/** Simula a troca de senha, validando a senha atual e a diferenca da nova. */
export const alterarSenhaMock = async (payload: AlterarSenhaPayload): Promise<void> => {
  if (payload.senhaAtual !== SENHA_ATUAL_MOCK) {
    throw new SenhaAtualIncorretaError('Senha atual incorreta.');
  }

  if (payload.novaSenha === payload.senhaAtual) {
    throw new Error('A nova senha deve ser diferente da senha atual.');
  }
};
