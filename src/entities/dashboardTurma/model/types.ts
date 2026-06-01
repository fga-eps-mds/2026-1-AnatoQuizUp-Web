export type StatusDesempenho = 'Tranquilo' | 'Atenção' | 'Crítico';

export interface TemaDesempenho {
  nome: string;
  totalRespondidas: number;
  taxaAcerto: number;
  status: StatusDesempenho;
}

export interface DashboardMacro {
  totalAlunos: number;
  totalQuestoesRespondidas: number;
  taxaMediaAcertos: number;
  desempenhoPorTema: TemaDesempenho[];
}

export interface DesempenhoAluno {
  alunoId: string;
  totalRespondidas: number;
  totalAcertos: number;
  taxaAcerto: number;
  ultimaAtividade: string | null;
  desempenhoPorTema: TemaDesempenho[];
}

export interface DashboardIndividual {
  alunos: DesempenhoAluno[];
}