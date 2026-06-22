export type AtualizarDadosPessoaisPayload = {
  nome: string;
  nickname: string;
};

export type AlterarSenhaPayload = {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
};

export class ApelidoEmUsoError extends Error {
  constructor(message = 'Este apelido ja esta em uso.') {
    super(message);
    this.name = 'ApelidoEmUsoError';
  }
}

export class SenhaAtualIncorretaError extends Error {
  constructor(message = 'Senha atual incorreta.') {
    super(message);
    this.name = 'SenhaAtualIncorretaError';
  }
}
