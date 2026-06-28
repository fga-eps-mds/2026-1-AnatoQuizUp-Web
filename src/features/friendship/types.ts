// Tipos do dominio de amizades (feature friendship).

// Estado de uma amizade: pendente (convite), ativa (aceita) ou recusada.
export type StatusAmizade = 'PENDENTE' | 'ATIVO' | 'RECUSADO';

// Metadados de paginacao retornados pelas listagens.
export type MetadadosPaginacao = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Envelope generico de resposta paginada (dados + metadados).
export type RespostaPaginada<T> = {
  dados: T[];
  metadados: MetadadosPaginacao;
};

// Dados resumidos do amigo exibidos nas listas/cartoes.
export type ResumoAmigo = {
  id: string;
  nome: string;
  nickname: string | null;
  curso: string | null;
  semestre: string | null;
};

// Amizade ja resolvida com os dados do amigo embutidos (visao de lista).
export type ResumoAmizade = {
  id: string;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
  usuarioOrigemId: string;
  usuarioDestinoId: string;
  statusAmizade: StatusAmizade;
  amigo: ResumoAmigo;
};

// Parametros de busca de colegas (para enviar convites).
export type BuscarColegasParams = {
  nome?: string;
  nickname?: string;
  page?: number;
  limit?: number;
};

// Parametros de listagem da lista de amigos (com filtros e paginacao).
export type ListarAmigosParams = {
  nome?: string;
  nickname?: string;
  page?: number;
  limit?: number;
};

// Parametros de listagem dos convites de amizade pendentes.
export type ListarConvitesParams = {
  page?: number;
  limit?: number;
};

// Registro cru de amizade (sem os dados do amigo embutidos).
export type Amizade = {
  id: string;
  usuarioOrigemId: string;
  usuarioDestinoId: string;
  statusAmizade: StatusAmizade;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

// Resposta ao enviar um convite de amizade.
export type EnviarSolicitacaoResponse = {
  mensagem: string;
  solicitacao: Amizade;
};

// Resposta generica que carrega apenas uma mensagem.
export type MensagemResponse = {
  mensagem: string;
};

// Perfil publico de um usuario, incluindo a flag de privacidade.
export type PerfilPublico = {
  id: string;
  nome: string;
  nickname: string | null;
  curso: string | null;
  semestre: string | null;
  perfilPrivado: boolean;
};
