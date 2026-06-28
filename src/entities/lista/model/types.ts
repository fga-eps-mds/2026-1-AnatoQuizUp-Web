// Tipos de dominio da entidade Lista de questoes (modelo, vinculos e payloads).

// Situacao da lista: publicada (visivel a alunos) ou rascunho.
export type StatusLista = 'PUBLICADA' | 'RASCUNHO';

// Turma a qual uma lista esta vinculada (resumo id + nome).
export interface TurmaVinculada {
  id: string;
  nome: string;
}

// Questao pertencente a uma lista, com sua posicao (ordem) na sequencia.
export interface QuestaoVinculada {
  id: string;
  enunciado: string;
  tema?: string;
  tipo?: string;
  dificuldade?: string;
  ordem: number;
}

// Modelo completo de uma lista de questoes usado pela aplicacao.
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

// Filtros aceitos na listagem de listas (busca textual e status).
export interface FiltrosLista {
  busca?: string;
  status?: StatusLista;
}

// Payload de criacao de lista (questoes e turmas opcionais ja no ato).
export interface CriarListaPayload {
  nome: string;
  questoesIds?: string[];
  turmasIds?: string[];
}

// Payload de atualizacao da lista (apenas o nome e editavel aqui).
export interface AtualizarListaPayload {
  nome: string;
}

// Vinculo entre uma lista e uma turma (com prazo e liberacao de gabarito).
export interface VinculoListaTurma {
  id: string;
  listaQuestaoId: string;
  nome: string;
  quantidadeQuestoes: number;
  prazo: string | null;
  gabaritoLiberado: boolean;
}

// Payload ao vincular uma lista a uma turma (prazo/gabarito opcionais).
export interface VincularListaTurmaPayload {
  prazo?: string | null;
  gabaritoLiberado?: boolean;
}

// Payload ao atualizar um vinculo existente (prazo/gabarito).
export interface AtualizarVinculoListaTurmaPayload {
  prazo?: string | null;
  gabaritoLiberado?: boolean;
}
