export type StatusTemaDashboard = "Tranquilo" | "Atenção" | "Crítico";

export interface TemaDashboard {
  temaId: string;
  nome: string;
  totalRespondidas: number;
  acertos: number;
  erros: number;
  taxaAcerto: number;
  status: StatusTemaDashboard;
}

export interface DashboardAlunoResponse {
  totalRespondidas: number;
  totalAcertos: number;
  totalErros: number;
  taxaAcerto: number;
  porTema: TemaDashboard[];
}