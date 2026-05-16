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