export type StatusLista = 'PUBLICADA' | 'RASCUNHO';

export interface TurmaVinculada {
  id: string;
  nome: string;
}

export interface QuestaoVinculada {
  id: string;
  enunciado: string;
  tema?: string;
  tipo?: string;
  dificuldade?: string;
  ordem: number;
}

export interface ListaQuestao {
  id: string;
  nome: string;
  quantidadeQuestoes: number;
  turmas: TurmaVinculada[];
  status: StatusLista;
  criadoEm: string;
  atualizadoEm?: string;
  questoes?: QuestaoVinculada[];
}

export interface FiltrosLista {
  busca?: string;
  status?: StatusLista;
}

export interface CriarListaPayload {
  nome: string;
  questoesIds?: string[];
  turmasIds?: string[];
}

export interface AtualizarListaPayload {
  nome: string;
}
