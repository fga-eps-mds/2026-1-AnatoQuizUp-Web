import type {
  ApiSuccessResponse,
  ListProfessorQuestionsPayload,
  ProfessorQuestion,
  QuestionTopic,
} from './types';

const MOCK_PROFESSOR_ID = '123e4567-e89b-12d3-a456-426614174001';

const IMAGE_TOPIC: QuestionTopic = {
  id: 'tema-imagem',
  nome: 'Imagem',
  criadoEm: '2025-03-01T12:00:00.000Z',
  atualizadoEm: '2025-03-01T12:00:00.000Z',
  excluidoEm: null,
};

const CARDIO_TOPIC: QuestionTopic = {
  id: 'tema-cardiologia',
  nome: 'Cardiologia',
  criadoEm: '2025-03-01T12:00:00.000Z',
  atualizadoEm: '2025-03-01T12:00:00.000Z',
  excluidoEm: null,
};

const MOCK_PROFESSOR_QUESTIONS: ProfessorQuestion[] = [
  {
    id: 'questao-mock-001',
    enunciado:
      'Em uma radiografia de torax, qual sinal radiologico diferencia atelectasia de consolidacao pulmonar?',
    tipoQuestao: 'MULTIPLA_ESCOLHA',
    respostaCorreta: 'C',
    saibaMais:
      'Atelectasia costuma causar perda de volume, enquanto consolidacao preserva ou aumenta discretamente o volume local.',
    status: 'ATIVO',
    feitoPorIa: false,
    urlImagem: 'https://example.com/mock/radiografia-torax.png',
    criadoPorId: MOCK_PROFESSOR_ID,
    temaId: IMAGE_TOPIC.id,
    questaoOriginalId: null,
    tema: IMAGE_TOPIC,
    alternativas: {
      id: 'alternativas-mock-001',
      alternativaA: 'Broncograma aereo sem desvio das estruturas mediastinais',
      alternativaB: 'Aumento difuso da transparencia pulmonar',
      alternativaC: 'Perda de volume com desvio de fissuras, hilo ou mediastino',
      alternativaD: 'Derrame pleural bilateral associado a cardiomegalia',
      alternativaE: 'Presenca de nodulo calcificado isolado',
      questaoId: 'questao-mock-001',
      criadoEm: '2025-03-31T10:00:00.000Z',
      atualizadoEm: '2025-03-31T10:00:00.000Z',
      excluidoEm: null,
    },
    criadoEm: '2025-03-31T10:00:00.000Z',
    atualizadoEm: '2025-03-31T10:00:00.000Z',
    excluidoEm: null,
  },
  {
    id: 'questao-mock-002',
    enunciado:
      'Na ecocardiografia, a janela paraesternal eixo longo permite avaliar o septo interventricular em seu terco medio.',
    tipoQuestao: 'CERTO_ERRADO',
    respostaCorreta: 'C',
    saibaMais:
      'A janela paraesternal eixo longo e uma das incidencias usadas para avaliar ventriculo esquerdo e septo interventricular.',
    status: 'ATIVO',
    feitoPorIa: true,
    urlImagem: null,
    criadoPorId: MOCK_PROFESSOR_ID,
    temaId: CARDIO_TOPIC.id,
    questaoOriginalId: null,
    tema: CARDIO_TOPIC,
    alternativas: null,
    criadoEm: '2025-03-30T14:30:00.000Z',
    atualizadoEm: '2025-03-30T14:30:00.000Z',
    excluidoEm: null,
  },
];

const cloneQuestion = (question: ProfessorQuestion): ProfessorQuestion => ({
  ...question,
  tema: { ...question.tema },
  alternativas: question.alternativas ? { ...question.alternativas } : null,
});

export const listarQuestoesProfessorMock = async (): Promise<
  ApiSuccessResponse<ListProfessorQuestionsPayload>
> => {
  const questoes = MOCK_PROFESSOR_QUESTIONS.map(cloneQuestion);

  return {
    mensagem: 'Questoes listadas com sucesso.',
    dados: {
      questoes,
      total: questoes.length,
    },
  };
};
