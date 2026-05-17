export type StatusTurma = 'ATIVA' | 'INATIVA';

export interface Turma {
  id: string;
  codigo: string;
  nome: string;
  semestre: string;
  ano: number;
  descricao: string;
  status: StatusTurma;
  quantidadeAlunos: number;
  criadoEm: string; 
}

export interface FiltrosTurma {
  busca?: string;
  status?: StatusTurma;
  semestre?: string;
  ano?: number;
}

export interface SalvarTurmaPayload {
  codigo: string;
  nome: string;
  semestre: string;
  ano: number;
  descricao: string;
  status?: StatusTurma;
}

export type AtualizarTurmaPayload = Partial<SalvarTurmaPayload>;

export interface VinculoTurmaAluno {
  id: string;
  turmaId: string;
  alunoId: string;
  criadoEm: string;
  atualizadoEm: string;
}
