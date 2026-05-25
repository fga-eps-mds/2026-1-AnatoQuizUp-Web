import type { QuestionTopic, ApiQuestionType, ApiQuestionDifficulty, QuestionAlternativeKey, PaginationMetadata, QuestionAlternatives } from "../manage-questions";

export type QuizQuestion = {
  id: string;
  tema: QuestionTopic;
  enunciado: string;
  tipo: ApiQuestionType;
  dificuldade: ApiQuestionDifficulty;
  imagem: string | null;
  alternativas: QuestionAlternatives | null;
};

export type ListQuizQuestionResponse = {
    dados: QuizQuestion[];
    metadados: PaginationMetadata;
}


export type QuestaoQuizAnwser = {
    questaoId: string;
    tipo: ApiQuestionType;
    respostaMarcada: QuestionAlternativeKey;
}

export type QuestaoQuizFeedback = {
  correcao: boolean;
  saibaMais: string | null;
  respostaCorreta: QuestionAlternativeKey;
  moedasConcedidas: number;
  saldoMoedas: number;
  moedasJaConcedidas: boolean;
}

export type SaldoMoedasResponse = {
  saldoMoedas: number;
}

export type Dificuldade = "FACIL" | "MEDIA" | "DIFICIL"
type QuantidadePorDificuldade = Record<Dificuldade, number>;

export type QuantidadeQuestoesTema = {
  nome: string;
  totalQuestoes: number;
  porDificuldade: QuantidadePorDificuldade;
}

export type QuantidadeQuestoesTemaResponse = {
  quantidadeDeQuestoesPorTema: QuantidadeQuestoesTema[];
};
