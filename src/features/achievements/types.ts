// Tipos do dominio de conquistas (gamificacao) compartilhados pela feature.
import type { TipoItemLoja } from '../loja';

// Niveis de uma conquista, em ordem crescente de dificuldade.
export type TierConquista = 'BRONZE' | 'PRATA' | 'OURO';

// Criterios possiveis de uma conquista (streak, total/percentual de acertos, por tema).
export type TipoConquista =
  | 'STREAK_ACERTOS'
  | 'TOTAL_ACERTOS'
  | 'TOTAL_ACERTOS_TEMA'
  | 'PERCENTUAL_ACERTO_TEMA';

// Item da loja concedido como recompensa ao desbloquear um tier.
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

// Progresso de um tier especifico: objetivo, estado de desbloqueio e recompensas.
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

// Visao agregada de uma conquista para o aluno: progresso atual e todos os seus tiers.
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

// Evento de desbloqueio recem-ocorrido, com moedas/saldo e item concedidos.
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

// Conquista que o aluno fixou para exibir em destaque no perfil.
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

// Metadados de paginacao retornados pela API de conquistas.
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

// Resposta do endpoint de conquistas destacadas do perfil.
export type RespostaDestaques = {
  mensagem: string;
  dados: ConquistaDestacada[];
};

// Parametros de paginacao aceitos ao listar conquistas.
export type ListarConquistasParams = {
  page?: number;
  limit?: number;
};
