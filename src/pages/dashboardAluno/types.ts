export type StatusTemaDashboard = "Tranquilo" | "Atenção" | "Crítico";
export type StatusListaDashboard = "SUBMETIDA" | "EM_ANDAMENTO" | "NAO_RESPONDEU";

export interface TemaDashboard {
  temaId: string;
  nome: string;
  totalRespondidas: number;
  acertos: number;
  erros: number;
  taxaAcerto: number;
  status: StatusTemaDashboard;
}

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

export interface DashboardAlunoResponse {
  totalRespondidas: number;
  totalAcertos: number;
  totalErros: number;
  taxaAcerto: number;
  porTema: TemaDashboard[];
  porLista: ListaDashboard[];
}