// Tratamento de erro proprio da simulacao OSCE (T1.9): traduz falhas da IA em
// avisos claros para o aluno, sem repassar mensagens tecnicas do backend (como o
// "nesta release" do ChatbotOSCE). Outros status (400, 401...) seguem com a
// mensagem de extractErrorMessage, que tambem e usada pelas demais telas.
import axios from 'axios';

import { extractErrorMessage } from '../manage-questions/model/questionService';

// "erro": a IA esta fora ou a avaliacao falhou (vermelho). "alerta": falha
// passageira, que costuma resolver ao tentar de novo (amarelo).
export type GravidadeAvisoOsce = 'erro' | 'alerta';

export type AvisoErroOsce = {
  // Sem titulo quando o aviso so repassa a mensagem atual (status nao classificado).
  titulo?: string;
  texto: string;
  gravidade: GravidadeAvisoOsce;
};

export const AVISO_IA_INDISPONIVEL: AvisoErroOsce = {
  titulo: 'O paciente simulado está fora do ar',
  texto:
    'A IA não está disponível no momento. Sua conversa foi mantida: tente de novo em alguns minutos.',
  gravidade: 'erro',
};

export const AVISO_RESPOSTA_INVALIDA: AvisoErroOsce = {
  titulo: 'O paciente simulado não conseguiu responder',
  texto: 'Houve uma falha ao gerar a resposta. Tente enviar a pergunta de novo.',
  gravidade: 'alerta',
};

export const AVISO_DEMORA: AvisoErroOsce = {
  titulo: 'O paciente simulado demorou para responder',
  texto: 'Verifique sua conexão e tente de novo.',
  gravidade: 'alerta',
};

export const AVISO_FALHA_FINALIZAR: AvisoErroOsce = {
  titulo: 'Não foi possível gerar sua avaliação agora',
  texto: 'A conversa continua na tela. Tente encerrar de novo em alguns minutos.',
  gravidade: 'erro',
};

const CODIGOS_TIMEOUT = new Set(['ECONNABORTED', 'ETIMEDOUT']);

// Classifica a falha do envio de uma fala pelo status HTTP. Devolve null quando o
// erro nao e da IA (ex.: 400, 401), para a tela manter a mensagem atual.
export const classificarErroOsce = (error: unknown): AvisoErroOsce | null => {
  if (!axios.isAxiosError(error)) return null;

  if (error.code && CODIGOS_TIMEOUT.has(error.code)) return AVISO_DEMORA;
  // Sem resposta: rede fora ou servidor que nao respondeu.
  if (!error.response) return AVISO_DEMORA;

  switch (error.response.status) {
    case 503:
      return AVISO_IA_INDISPONIVEL;
    case 502:
      return AVISO_RESPOSTA_INVALIDA;
    case 504:
      return AVISO_DEMORA;
    default:
      return null;
  }
};

// Erro que o servico do OSCE lanca: a mensagem de sempre (para quem so le
// `message`) e, quando a falha e da IA, o aviso pronto para a tela.
export class ErroOsce extends Error {
  readonly aviso: AvisoErroOsce | null;

  constructor(mensagem: string, aviso: AvisoErroOsce | null) {
    super(mensagem);
    this.name = 'ErroOsce';
    this.aviso = aviso;
  }
}

export const criarErroOsce = (error: unknown): ErroOsce => {
  const aviso = classificarErroOsce(error);
  return new ErroOsce(aviso ? aviso.texto : extractErrorMessage(error), aviso);
};

// Aviso a exibir para a falha de uma fala: o classificado ou, sem classificacao,
// a mensagem atual do erro.
export const avisoDaFalhaDeEnvio = (error: unknown): AvisoErroOsce => {
  if (error instanceof ErroOsce && error.aviso) return error.aviso;
  return { texto: (error as Error).message, gravidade: 'erro' };
};
