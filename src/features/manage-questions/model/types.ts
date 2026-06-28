// Tipos da feature de gerenciamento de questoes. Convivem dois "mundos": os tipos
// do dominio/API (enums em PT-BR maiusculo, ex. Question/UpdateQuestionPayload) e
// os tipos da UI/formulario (rotulos legiveis, ex. ProfessorQuestion/QuestionFormValues).
// Os services mapeiam entre os dois.

// Tipo da questao no formato da API.
export type ApiQuestionType = 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';

// Dificuldade no formato da API.
export type ApiQuestionDifficulty = 'FACIL' | 'MEDIA' | 'DIFICIL';

// Niveis da taxonomia de Bloom (objetivo cognitivo da questao).
export type TaxonomiaBloom =
  | 'LEMBRAR'
  | 'COMPREENDER'
  | 'APLICAR'
  | 'ANALISAR'
  | 'AVALIAR'
  | 'CRIAR';

// Procedencia da questao (de onde foi tirada/criada).
export type OrigemQuestao =
  | 'LIVRO'
  | 'PROVA_ANTERIOR'
  | 'GERADA_POR_IA'
  | 'ELABORADA_POR_PROFESSOR';

// Chaves possiveis de alternativa.
export type QuestionAlternativeKey = 'A' | 'B' | 'C' | 'D' | 'E';

// Situacao da questao (ativa ou removida por soft delete).
export type QuestionStatus = 'ATIVO' | 'INATIVO';

// Tema/assunto ao qual a questao pertence.
export type QuestionTopic = {
  id: string;
  nome: string;
  criadoEm?: string;
  atualizadoEm?: string;
  excluidoEm?: string | null;
};

// Mapa chave -> texto das alternativas (nem toda chave precisa existir).
export type QuestionAlternatives = Partial<Record<QuestionAlternativeKey, string>>;

// Modelo da questao no formato do dominio/API.
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

// Dificuldade no formato legivel da UI.
export type QuestionDifficulty = 'Fácil' | 'Médio' | 'Difícil';

// Tipo no formato legivel da UI.
export type QuestionType = 'Múltipla escolha' | 'Verdadeiro/Falso';

// Alternativa no formato da UI (com flag de correta).
export type QuestionAlternative = {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
};

// Questao no formato consumido pela tela do professor.
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

// Valores do formulario de criar/editar questao (image pode ser File ou URL).
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

// Payload de atualizacao parcial da questao (todos os campos opcionais).
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

// Parametros de listagem de questoes (paginacao + filtros).
export type QuestionListParams = {
  page?: number;
  limit?: number;
  tema?: string;
  tipo?: ApiQuestionType;
  dificuldade?: ApiQuestionDifficulty;
  taxonomiaBloom?: TaxonomiaBloom;
  status?: QuestionStatus;
};

// Parametros de busca: estende a listagem com aliases do termo (q/busca/termo).
export type SearchQuestionsParams = QuestionListParams & {
  q?: string;
  busca?: string;
  termo?: string;
};

// Metadados de paginacao retornados pela API.
export type PaginationMetadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Envelope generico de sucesso (mensagem + dados opcionais).
export type ApiSuccessResponse<T> = {
  mensagem?: string;
  dados?: T;
};

// Envelope generico de resposta paginada (lista + metadados).
export type ApiPaginatedResponse<T> = {
  dados: T[];
  metadados: PaginationMetadata;
};

// Atalho para a resposta paginada de questoes do dominio.
export type ListQuestionsResponse = ApiPaginatedResponse<Question>;

// Payload da listagem de questoes ja no formato da tela do professor.
export type ListProfessorQuestionsPayload = {
  questoes: ProfessorQuestion[];
  total: number;
  metadados: PaginationMetadata;
};
