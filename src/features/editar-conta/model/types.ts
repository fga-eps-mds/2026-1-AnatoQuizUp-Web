// Tipos e erros do dominio de edicao de conta.

// Payload de atualizacao dos dados pessoais (nome e apelido).
export type AtualizarDadosPessoaisPayload = {
  nome: string;
  nickname: string;
};

// Payload de troca de senha.
export type AlterarSenhaPayload = {
  senhaAtual: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
};

// Erro especifico: apelido ja utilizado por outro usuario.
export class ApelidoEmUsoError extends Error {
  constructor(message = 'Este apelido ja esta em uso.') {
    super(message);
    this.name = 'ApelidoEmUsoError';
  }
}

// Erro especifico: senha atual informada nao confere.
export class SenhaAtualIncorretaError extends Error {
  constructor(message = 'Senha atual incorreta.') {
    super(message);
    this.name = 'SenhaAtualIncorretaError';
  }
}
