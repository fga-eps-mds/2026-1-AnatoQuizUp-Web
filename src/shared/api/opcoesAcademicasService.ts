import { USE_MOCKS } from '../config/env';
import { ESCOLARIDADES } from '../constants/escolaridade';
import { CURSOS, INSTITUICOES, NAO_SE_APLICA, PERIODOS } from '../constants/opcoes-academicas';
import { httpClient } from './httpClient';

type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

export type OpcoesAcademicas = {
  escolaridades: string[];
  instituicoes: string[];
  cursos: string[];
  periodos: string[];
  naoSeAplica: string;
};

const OPCOES_ACADEMICAS_MOCK: OpcoesAcademicas = {
  escolaridades: ESCOLARIDADES,
  instituicoes: INSTITUICOES,
  cursos: CURSOS,
  periodos: PERIODOS,
  naoSeAplica: NAO_SE_APLICA,
};

const OPCOES_ACADEMICAS_VAZIAS: OpcoesAcademicas = {
  escolaridades: [],
  instituicoes: [],
  cursos: [],
  periodos: [],
  naoSeAplica: '',
};

const normalizarOpcoesAcademicas = (opcoes?: OpcoesAcademicas): OpcoesAcademicas => ({
  escolaridades: Array.isArray(opcoes?.escolaridades) ? opcoes.escolaridades : [],
  instituicoes: Array.isArray(opcoes?.instituicoes) ? opcoes.instituicoes : [],
  cursos: Array.isArray(opcoes?.cursos) ? opcoes.cursos : [],
  periodos: Array.isArray(opcoes?.periodos) ? opcoes.periodos : [],
  naoSeAplica: opcoes?.naoSeAplica ?? '',
});

export const listarOpcoesAcademicas = async (): Promise<OpcoesAcademicas> => {
  if (USE_MOCKS) {
    return OPCOES_ACADEMICAS_MOCK;
  }

  const { data } = await httpClient.get<ApiSuccessResponse<OpcoesAcademicas>>(
    '/auth/alunos/opcoes-academicas',
  );
  return normalizarOpcoesAcademicas(data.dados ?? OPCOES_ACADEMICAS_VAZIAS);
};
