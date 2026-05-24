export type DistribuicaoAlternativas = Record<string, number>;

export type HistoricoQuestaoDetalhe = {
  tema: {
    id: string;
    nome: string;
  };
  enunciado: string;
  tipoQuestao: string;
  respostaCorreta: string;
  dificuldade: string;
  saibaMais: string | null;
  alternativas: Record<string, string> | null;
};

export type ItemHistoricoQuiz = {
  id: string;
  criadoEm: string;
  respostaMarcada: string;
  questaoId: string;
  tentativas: number;
  distribuicao: DistribuicaoAlternativas;
  questao: HistoricoQuestaoDetalhe;
};

export type HistoricoQuizResponse = {
  dados: ItemHistoricoQuiz[];
  metadados: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};