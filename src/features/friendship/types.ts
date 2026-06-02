export type StatusAmizade = 'PENDENTE' | 'ATIVO' | 'RECUSADO';

export type MetadadosPaginacao = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RespostaPaginada<T> = {
  dados: T[];
  metadados: MetadadosPaginacao;
};

export type ResumoAmigo = {
  id: string;
  nome: string;
  nickname: string | null;
  curso: string | null;
  semestre: string | null;
};

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

export type BuscarColegasParams = {
  nome?: string;
  nickname?: string;
  page?: number;
  limit?: number;
};

export type ListarAmigosParams = {
  nome?: string;
  nickname?: string;
  page?: number;
  limit?: number;
};

export type ListarConvitesParams = {
  page?: number;
  limit?: number;
};

export type Amizade = {
  id: string;
  usuarioOrigemId: string;
  usuarioDestinoId: string;
  statusAmizade: StatusAmizade;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

export type EnviarSolicitacaoResponse = {
  mensagem: string;
  solicitacao: Amizade;
};

export type MensagemResponse = {
  mensagem: string;
};
