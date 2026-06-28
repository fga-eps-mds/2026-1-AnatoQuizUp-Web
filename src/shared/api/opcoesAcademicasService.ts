// Servico das opcoes academicas (escolaridade, instituicao, curso, periodo) usadas
// no cadastro de aluno. Em modo mock devolve as constantes locais; senao consulta a
// API e normaliza o retorno garantindo arrays validos para cada campo.
import { USE_MOCKS } from '../config/env';
import { ESCOLARIDADES } from '../constants/escolaridade';
import { CURSOS, INSTITUICOES, NAO_SE_APLICA, PERIODOS } from '../constants/opcoes-academicas';
import { httpClient } from './httpClient';

// Envelope de sucesso da API (dados opcional).
type ApiSuccessResponse<T> = {
  mensagem: string;
  dados?: T;
};

// Conjunto de opcoes academicas oferecidas ao formulario de cadastro.
export type OpcoesAcademicas = {
  escolaridades: string[];
  instituicoes: string[];
  cursos: string[];
  periodos: string[];
  naoSeAplica: string;
};

// Opcoes academicas locais usadas quando os mocks estao habilitados.
const OPCOES_ACADEMICAS_MOCK: OpcoesAcademicas = {
  escolaridades: ESCOLARIDADES,
  instituicoes: INSTITUICOES,
  cursos: CURSOS,
  periodos: PERIODOS,
  naoSeAplica: NAO_SE_APLICA,
};

// Valor neutro usado como fallback quando a API nao retorna dados.
const OPCOES_ACADEMICAS_VAZIAS: OpcoesAcademicas = {
  escolaridades: [],
  instituicoes: [],
  cursos: [],
  periodos: [],
  naoSeAplica: '',
};

/**
 * Garante que cada campo seja um array valido (ou string para naoSeAplica),
 * protegendo a UI de respostas malformadas da API.
 * @param opcoes opcoes possivelmente incompletas
 */
const normalizarOpcoesAcademicas = (opcoes?: OpcoesAcademicas): OpcoesAcademicas => ({
  escolaridades: Array.isArray(opcoes?.escolaridades) ? opcoes.escolaridades : [],
  instituicoes: Array.isArray(opcoes?.instituicoes) ? opcoes.instituicoes : [],
  cursos: Array.isArray(opcoes?.cursos) ? opcoes.cursos : [],
  periodos: Array.isArray(opcoes?.periodos) ? opcoes.periodos : [],
  naoSeAplica: opcoes?.naoSeAplica ?? '',
});

/**
 * Lista as opcoes academicas, normalizadas. Usa o mock quando habilitado.
 * @returns opcoes academicas saneadas
 */
export const listarOpcoesAcademicas = async (): Promise<OpcoesAcademicas> => {
  if (USE_MOCKS) {
    return OPCOES_ACADEMICAS_MOCK;
  }

  const { data } = await httpClient.get<ApiSuccessResponse<OpcoesAcademicas>>(
    '/autenticacao/alunos/opcoes-academicas',
  );
  return normalizarOpcoesAcademicas(data.dados ?? OPCOES_ACADEMICAS_VAZIAS);
};
