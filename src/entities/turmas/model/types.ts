// Tipos de dominio da entidade Turma (modelo, filtros e payloads de escrita).

// Situacao de uma turma: ativa (em andamento) ou inativa (encerrada).
export type StatusTurma = 'ATIVA' | 'INATIVA';

// Modelo de uma turma como usado pela aplicacao.
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

// Filtros aceitos na listagem de turmas (todos opcionais).
export interface FiltrosTurma {
  busca?: string;
  status?: StatusTurma;
  semestre?: string;
  ano?: number;
}

// Payload para criar uma turma (status opcional, default no backend).
export interface SalvarTurmaPayload {
  codigo: string;
  nome: string;
  semestre: string;
  ano: number;
  descricao: string;
  status?: StatusTurma;
}

// Payload de atualizacao: todos os campos sao opcionais (edicao parcial).
export type AtualizarTurmaPayload = Partial<SalvarTurmaPayload>;

// Vinculo entre uma turma e um aluno matriculado.
export interface VinculoTurmaAluno {
  id: string;
  turmaId: string;
  alunoId: string;
  criadoEm: string;
  atualizadoEm: string;
}
