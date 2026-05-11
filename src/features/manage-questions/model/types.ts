export type QuestionType = 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';

export type QuestionDifficulty = 'FACIL' | 'MEDIA' | 'DIFICIL';

export type QuestionAlternativeKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionStatus = 'ATIVO' | 'INATIVO';

export type QuestionTopic = {
  id: string;
  nome: string;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

export type QuestionAlternatives = Record<QuestionAlternativeKey, string>;

export type Question = {
  id: string;
  tema: QuestionTopic;
  enunciado: string;
  tipo: QuestionType;
  dificuldade: QuestionDifficulty;
  imagem: string | null;
  alternativaCorreta: QuestionAlternativeKey;
  explicacaoPedagogica: string | null;
  alternativas: QuestionAlternatives | null;
  status: QuestionStatus;
  criadoPorId: string;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

export type ProfessorQuestion = Question;

export type UpdateQuestionPayload = Partial<{
  tema: string;
  enunciado: string;
  tipo: QuestionType;
  dificuldade: QuestionDifficulty;
  imagem: string | null;
  alternativaCorreta: QuestionAlternativeKey;
  explicacaoPedagogica: string | null;
  alternativas: QuestionAlternatives | null;
}>;

export type QuestionListParams = {
  page?: number;
  limit?: number;
  tema?: string;
  tipo?: QuestionType;
  dificuldade?: QuestionDifficulty;
  status?: QuestionStatus;
};

export type SearchQuestionsParams = QuestionListParams & {
  q?: string;
  busca?: string;
  termo?: string;
};

export type PaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccessResponse<T> = {
  mensagem?: string;
  dados: T;
};

export type ApiPaginatedResponse<T> = {
  dados: T[];
  metadados: PaginationMetadata;
};

export type ListQuestionsResponse = ApiPaginatedResponse<Question>;

export type ListProfessorQuestionsPayload = {
  questoes: ProfessorQuestion[];
  total: number;
  metadados: PaginationMetadata;
};
