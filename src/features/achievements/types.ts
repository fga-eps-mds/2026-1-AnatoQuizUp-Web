import type { TipoItemLoja } from '../loja';

export type TierConquista = 'BRONZE' | 'PRATA' | 'OURO';

export type TipoConquista =
  | 'STREAK_ACERTOS'
  | 'TOTAL_ACERTOS'
  | 'TOTAL_ACERTOS_TEMA'
  | 'PERCENTUAL_ACERTO_TEMA';

export type ItemRecompensaConquista = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: TipoItemLoja;
  valor: string | null;
  imagemUrl: string | null;
  previewImagemUrl: string | null;
};

export type TierProgressoConquista = {
  tier: TierConquista;
  objetivo: number;
  desbloqueado: boolean;
  desbloqueioId: string | null;
  destaque: boolean;
  conquistadoEm: string | null;
  moedas: number;
  item: ItemRecompensaConquista | null;
};

export type ProgressoConquista = {
  id: string;
  nome: string;
  descricao: string;
  tipoConquista: TipoConquista;
  tema: {
    id: string;
    nome: string;
  } | null;
  valorProgresso: number;
  proximoTier: TierConquista | null;
  proximoObjetivo: number | null;
  percentual: number;
  tiers: TierProgressoConquista[];
};

export type ConquistaDesbloqueada = {
  conquistaId: string;
  desbloqueioId: string;
  nome: string;
  descricao: string;
  tier: TierConquista;
  tipoConquista: TipoConquista;
  temaId: string | null;
  moedasConcedidas: number;
  saldoMoedas: number;
  itemConcedido: ItemRecompensaConquista | null;
};

export type ConquistaDestacada = {
  desbloqueioId: string;
  conquistaId: string;
  nome: string;
  descricao: string;
  tier: TierConquista;
  tipoConquista: TipoConquista;
  tema: {
    id: string;
    nome: string;
  } | null;
  conquistadoEm: string;
};

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

export type RespostaDestaques = {
  mensagem: string;
  dados: ConquistaDestacada[];
};

export type ListarConquistasParams = {
  page?: number;
  limit?: number;
};
