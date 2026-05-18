import { USE_MOCKS } from '../config/env';
import { httpClient } from './httpClient';

export type Alternativa = {
  id: string; 
  texto: string;
};

export type QuestaoAPI = {
  id: string;
  enunciado: string;
  tipoQuestao: 'MULTIPLA_ESCOLHA' | 'CERTO_ERRADO';
  respostaCorreta: string;
  saibaMais: string | null;
  dificuldade: 'FACIL' | 'MEDIA' | 'DIFICIL';
  temaId: string;
  alternativas: Alternativa[];
};

type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

const MOCK_QUESTOES_API: QuestaoAPI[] = [
  {
    id: 'mock-1',
    enunciado: 'Qual a principal indicação para o uso de contraste paramagnético (gadolínio) em exames de RM?',
    tipoQuestao: 'MULTIPLA_ESCOLHA',
    respostaCorreta: 'B',
    saibaMais: 'O gadolínio não ultrapassa a barreira hematoencefálica (BHE) íntegra. Seu realce indica quebra da BHE, achado fundamental no diagnóstico de tumores.',
    dificuldade: 'MEDIA',
    temaId: 'tema-seed-neuro',
    alternativas: [
      { id: 'A', texto: 'Avaliação de fraturas cranianas simples' },
      { id: 'B', texto: 'Pesquisa de quebra da barreira hematoencefálica' },
      { id: 'C', texto: 'Quantificação de cálcio nos gânglios da base' },
      { id: 'D', texto: 'Estudo do fluxo sem contraste' },
      { id: 'E', texto: 'Rastreio de osteoporose' }
    ],
  },
  {
    id: 'mock-2',
    enunciado: 'A veia cava inferior está posicionada à direita da aorta abdominal, anterior ao corpo vertebral. Essa relação anatômica é frequentemente utilizada como referência vascular.',
    tipoQuestao: 'CERTO_ERRADO',
    respostaCorreta: 'C',
    saibaMais: 'A afirmação está perfeita. A veia cava inferior tipicamente ascende à direita da aorta abdominal.',
    dificuldade: 'FACIL',
    temaId: 'tema-seed-abdome',
    alternativas: [
      { id: 'C', texto: 'Certo' },
      { id: 'E', texto: 'Errado' }
    ],
  },
  {
    id: 'mock-3',
    enunciado: 'Paciente feminino, 29 anos, chega mancando ao PS com quadro de dor intensa em fossa ilíaca direita. Apresenta dor à descompressão brusca. Qual o exame de imagem mais indicado para auxiliar no diagnóstico?',
    tipoQuestao: 'MULTIPLA_ESCOLHA',
    respostaCorreta: 'B',
    saibaMais: 'A Ultrassonografia é um exame rápido, não invasivo e não utiliza radiação ionizante, excelente para avaliar inflamação na fossa ilíaca direita (suspeita de apendicite).',
    dificuldade: 'FACIL',
    temaId: 'tema-seed-abdome',
    alternativas: [
      { id: 'A', texto: 'Radiografia' },
      { id: 'B', texto: 'Ultrassonografia' },
      { id: 'C', texto: 'TC com contraste' },
      { id: 'D', texto: 'TC sem contraste' },
      { id: 'E', texto: 'Videolaparoscopia' }
    ],
  }
];

export const buscarQuestoesPorTema = async (temaId: string, dificuldade: string): Promise<QuestaoAPI[]> => {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_QUESTOES_API;
  }

  const { data } = await httpClient.get<ApiSuccessResponse<QuestaoAPI[]>>(
    '/aluno/quiz/questoes',
    {
      params: {
        temaId,
        dificuldade
      }
    }
  );
  
  return Array.isArray(data.dados) ? data.dados : [];
};