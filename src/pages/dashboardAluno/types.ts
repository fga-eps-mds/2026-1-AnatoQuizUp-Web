// Tipos da resposta do dashboard do aluno.

// Faixas de status de um tema (por desempenho) e o status do aluno numa lista.
export type StatusTemaDashboard = "Tranquilo" | "Atenção" | "Crítico";
export type StatusListaDashboard = "SUBMETIDA" | "EM_ANDAMENTO" | "NAO_RESPONDEU";

// Desempenho agregado por tema.
export interface TemaDashboard {
  temaId: string;
  nome: string;
  totalRespondidas: number;
  acertos: number;
  erros: number;
  taxaAcerto: number;
  status: StatusTemaDashboard;
}

// Desempenho do aluno em uma lista publicada.
export interface ListaDashboard {
  listaTurmaId: string;
  nomeLista: string;
  totalQuestoes: number;
  acertos: number;
  taxaAcerto: number;
  status: StatusListaDashboard;
  submissaoEm: string | null;
  prazo: string | null;
}

// Resposta completa do dashboard: totais gerais + detalhamento por tema e por lista.
export interface DashboardAlunoResponse {
  totalRespondidas: number;
  totalAcertos: number;
  totalErros: number;
  taxaAcerto: number;
  porTema: TemaDashboard[];
  porLista: ListaDashboard[];
}