export type QuestionType = 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';

export type QuestionAlternativeKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionStatus = 'ATIVO' | 'INATIVO';

export type QuestionTopic = {
  id: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

export type QuestionAlternatives = {
  id: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  alternativaE: string;
  questaoId: string;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

export type ProfessorQuestion = {
  id: string;
  enunciado: string;
  tipoQuestao: QuestionType;
  respostaCorreta: QuestionAlternativeKey;
  saibaMais: string | null;
  status: QuestionStatus;
  feitoPorIa: boolean;
  urlImagem: string | null;
  criadoPorId: string;
  temaId: string;
  questaoOriginalId: string | null;
  tema: QuestionTopic;
  alternativas: QuestionAlternatives | null;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

export type ListProfessorQuestionsPayload = {
  questoes: ProfessorQuestion[];
  total: number;
};

export type ApiSuccessResponse<T> = {
  mensagem: string;
  dados: T;
};
