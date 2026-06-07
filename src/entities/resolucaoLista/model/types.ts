export type StatusResolucao = 'PENDENTE' | 'RESPONDIDA' | 'EXPIRADA' | 'EM_ANDAMENTO' | 'SUBMETIDA';

export interface ResumoListaAluno {
  listaTurmaId: string;
  nome: string;
  temas: string[];
  quantidadeQuestoes: number;
  prazo: string | null;
  status: StatusResolucao;
  gabaritoLiberado: boolean;
}

export interface QuestaoAluno {
  id: string;
  enunciado: string;
  urlImagem: string | null;
  tema: string;
  tipoQuestao: string;
  alternativas: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  } | null;
  respostaMarcada: string | null;
  respostaCorreta?: string;
  saibaMais?: string | null;
}

export interface DetalhesListaAluno {
  id: string;
  nome: string;
  prazo: string | null;
  gabaritoLiberado: boolean;
  status: StatusResolucao;
  questoes: QuestaoAluno[];
}