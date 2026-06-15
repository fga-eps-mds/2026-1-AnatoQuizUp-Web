export type ApiQuestionType = 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';

export type ApiQuestionDifficulty = 'FACIL' | 'MEDIA' | 'DIFICIL';

export type TaxonomiaBloom =
  | 'LEMBRAR'
  | 'COMPREENDER'
  | 'APLICAR'
  | 'ANALISAR'
  | 'AVALIAR'
  | 'CRIAR';

export type OrigemQuestao =
  | 'LIVRO'
  | 'PROVA_ANTERIOR'
  | 'GERADA_POR_IA'
  | 'ELABORADA_POR_PROFESSOR';

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
  saibaMais: string | null;
  taxonomiaBloom?: TaxonomiaBloom | null;
  origemQuestao?: OrigemQuestao;
  regiaoAnatomica?: string | null;
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
  origemQuestao: OrigemQuestao;
  statement: string;
  explanation?: string;
  taxonomiaBloom?: TaxonomiaBloom | null;
  regiaoAnatomica?: string | null;
  alternatives: QuestionAlternative[];
  createdAt: string;
  image?: string | null;
};

export type QuestionFormValues = {
  topic: string;
  tags: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  origemQuestao: OrigemQuestao;
  statement: string;
  explanation: string;
  taxonomiaBloom: TaxonomiaBloom | '';
  regiaoAnatomica: string;
  alternatives: QuestionAlternative[];
  image: File | string | null;
};

export type UpdateQuestionPayload = Partial<{
  tema: string;
  enunciado: string;
  tipo: ApiQuestionType;
  dificuldade: ApiQuestionDifficulty;
  imagem: string | null;
  alternativaCorreta: QuestionAlternativeKey;
  saibaMais: string | null;
  taxonomiaBloom: TaxonomiaBloom | null;
  origemQuestao: OrigemQuestao;
  regiaoAnatomica: string | null;
  alternativas: QuestionAlternatives | null;
}>;

export type QuestionListParams = {
  page?: number;
  limit?: number;
  tema?: string;
  tipo?: ApiQuestionType;
  dificuldade?: ApiQuestionDifficulty;
  taxonomiaBloom?: TaxonomiaBloom;
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
