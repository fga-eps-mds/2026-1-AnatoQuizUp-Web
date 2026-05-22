export type StatusLista = 'PUBLICADA' | 'RASCUNHO';

export interface TurmaVinculada {
  id: string;
  nome: string;
}

export interface ListaQuestao {
  id: string;
  nome: string;
  quantidadeQuestoes: number;
  turmas: TurmaVinculada[];
  status: StatusLista;
  criadoEm: string;
}

export interface FiltrosLista {
  busca?: string;
  status?: StatusLista;
}