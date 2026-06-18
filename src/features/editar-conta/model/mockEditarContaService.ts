import { atualizarUsuarioAutenticadoMock } from '../../auth-by-credencials/model/mockAuthService';
import type { AlterarSenhaPayload, AtualizarDadosPessoaisPayload } from './types';
import { ApelidoEmUsoError, SenhaAtualIncorretaError } from './types';

const NICKNAMES_EM_USO = new Set(['em_uso', 'emuso', 'ocupado']);
const SENHA_ATUAL_MOCK = 'atual123';

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

export const alterarSenhaMock = async (payload: AlterarSenhaPayload): Promise<void> => {
  if (payload.senhaAtual !== SENHA_ATUAL_MOCK) {
    throw new SenhaAtualIncorretaError('Senha atual incorreta.');
  }

  if (payload.novaSenha === payload.senhaAtual) {
    throw new Error('A nova senha deve ser diferente da senha atual.');
  }
};
