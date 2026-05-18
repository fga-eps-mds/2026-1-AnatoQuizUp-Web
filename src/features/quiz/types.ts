import type { QuestionTopic, ApiQuestionType, ApiQuestionDifficulty, QuestionAlternatives, QuestionStatus, ApiPaginatedResponse, QuestionAlternativeKey } from "../manage-questions";

export type QuizQuestion = {
  id: string;
  tema: QuestionTopic;
  enunciado: string;
  tipo: ApiQuestionType;
  dificuldade: ApiQuestionDifficulty;
  imagem: string | null;
  alternativas: QuestionAlternatives | null;
  status: QuestionStatus;
};

export type ListQuizQuestionReponse = ApiPaginatedResponse<QuizQuestion>;

export type QuizQuestionAwnser = {
    questaoId: string;
    tipo: ApiQuestionType;
    respostaMarcada: QuestionAlternativeKey;
}

export type QuizQuestionFeedback = {
    correcao: boolean;
    explicacaoPedagogica: string | null;
}