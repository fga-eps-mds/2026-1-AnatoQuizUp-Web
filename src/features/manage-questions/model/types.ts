export type ApiQuestionType = 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO' | 'VERDADEIRO_FALSO';

export type ApiQuestionDifficulty = 'FACIL' | 'MEDIA' | 'MEDIO' | 'DIFICIL';

export type QuestionAlternativeKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionStatus = 'ATIVO' | 'INATIVO';

export type QuestionTopic = {
  id: string;
  nome: string;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

export type QuestionAlternatives = Partial<Record<QuestionAlternativeKey, string>>;

export type Question = {
  id: string;
  tema: QuestionTopic;
  enunciado: string;
  tipo: ApiQuestionType;
  dificuldade: ApiQuestionDifficulty;
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

export type QuestionDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export type QuestionType = 'Múltipla escolha' | 'Verdadeiro/Falso';

export type QuestionAlternative = {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
};

export type ProfessorQuestion = {
  id: string;
  topic: string;
  tags: string[];
  type: QuestionType;
  difficulty: QuestionDifficulty;
  origin: string;
  statement: string;
  explanation?: string;
  alternatives: QuestionAlternative[];
  createdAt: string;
};

export type QuestionFormValues = {
  topic: string;
  tags: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  origin: string;
  statement: string;
  explanation: string;
  alternatives: QuestionAlternative[];
};

export type UpdateQuestionPayload = Partial<{
  tema: string;
  enunciado: string;
  tipo: ApiQuestionType;
  dificuldade: ApiQuestionDifficulty;
  imagem: string | null;
  alternativaCorreta: QuestionAlternativeKey;
  explicacaoPedagogica: string | null;
  alternativas: QuestionAlternatives | null;
}>;

export type QuestionListParams = {
  page?: number;
  limit?: number;
  tema?: string;
  tipo?: ApiQuestionType;
  dificuldade?: ApiQuestionDifficulty;
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
  dados?: T;
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
