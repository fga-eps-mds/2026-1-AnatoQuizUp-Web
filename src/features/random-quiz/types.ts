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
}