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
