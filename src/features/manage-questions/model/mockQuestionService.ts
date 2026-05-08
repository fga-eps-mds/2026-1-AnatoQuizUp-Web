import type { ProfessorQuestion, QuestionFormValues } from './types';

let questionsMock: ProfessorQuestion[] = [
  {
    id: 'question-14',
    topic: 'Imagem',
    tags: ['radiografia', 'pulmão'],
    type: 'Múltipla escolha',
    statement: 'Em uma radiografia de tórax, qual o sinal radiológico que diferencia atelectasia de consolidação pulmonar?',
    difficulty: 'Médio',
    origin: 'Manual',
    createdAt: '31/03/2025',
    explanation: '',
    alternatives: [
      { id: 'a', label: 'A', text: 'Broncograma aéreo', isCorrect: false },
      { id: 'b', label: 'B', text: 'Perda de volume pulmonar', isCorrect: true },
    ],
  },
  {
    id: 'question-15',
    topic: 'Imagem',
    tags: ['eco', 'septos'],
    type: 'Múltipla escolha',
    statement: 'Na ecocardiografia, qual janela acústica permite melhor visualização do septo interventricular em seu terço médio?',
    difficulty: 'Difícil',
    origin: 'Manual',
    createdAt: '30/03/2025',
    explanation: '',
    alternatives: [
      { id: 'a', label: 'A', text: 'Paraesternal eixo curto', isCorrect: true },
      { id: 'b', label: 'B', text: 'Subcostal', isCorrect: false },
    ],
  },
];

const toQuestion = (values: QuestionFormValues, id: string = crypto.randomUUID()): ProfessorQuestion => ({
  id,
  topic: values.topic,
  tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
  type: values.type,
  difficulty: values.difficulty,
  origin: values.origin || 'Manual',
  statement: values.statement,
  explanation: values.explanation,
  alternatives: values.alternatives,
  createdAt: new Intl.DateTimeFormat('pt-BR').format(new Date()),
});

export const listProfessorQuestionsMock = async (): Promise<ProfessorQuestion[]> => questionsMock;

export const createQuestionMock = async (values: QuestionFormValues): Promise<ProfessorQuestion> => {
  const question = toQuestion(values);
  questionsMock = [question, ...questionsMock];
  return question;
};

export const updateQuestionMock = async (
  id: string,
  values: QuestionFormValues,
): Promise<ProfessorQuestion> => {
  const updatedQuestion = toQuestion(values, id);
  questionsMock = questionsMock.map((question) => (
    question.id === id ? { ...updatedQuestion, createdAt: question.createdAt } : question
  ));
  return questionsMock.find((question) => question.id === id) ?? updatedQuestion;
};

export const deleteQuestionMock = async (id: string): Promise<void> => {
  questionsMock = questionsMock.filter((question) => question.id !== id);
};
