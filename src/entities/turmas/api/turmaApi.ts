// Cliente de API da entidade "Turma". Concentra o CRUD de turmas e o vinculo de
// alunos, normalizando a resposta da API (que pode trazer a contagem de alunos
// em campos diferentes) para o tipo de dominio Turma.
import { httpClient } from '../../../shared/api/httpClient';
import type {
  AtualizarTurmaPayload,
  FiltrosTurma,
  SalvarTurmaPayload,
  Turma,
  VinculoTurmaAluno,
} from '../model/types';

// Envelope padrao das respostas da API: mensagem opcional + payload em "dados".
type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

// Formato cru da turma: a contagem de alunos pode vir como `quantidadeAlunos` ou `_count.alunos`.
type TurmaApi = Omit<Turma, 'quantidadeAlunos'> & {
  quantidadeAlunos?: number;
  _count?: {
    alunos?: number;
  };
};

/**
 * Normaliza a turma crua: unifica a contagem de alunos (cai para 0 se ausente).
 * @param turma turma crua vinda da API
 */
const normalizarTurma = (turma: TurmaApi): Turma => {
  const { _count, quantidadeAlunos, ...dadosTurma } = turma;

  return {
    ...dadosTurma,
    quantidadeAlunos: quantidadeAlunos ?? _count?.alunos ?? 0,
  };
};

// GET /turmas — lista as turmas aplicando filtros opcionais.
export const listarTurmas = async (filtros?: FiltrosTurma) => {
  const response = await httpClient.get<RespostaApi<TurmaApi[]>>('/turmas', {
    params: filtros,
  });
  return response.data.dados.map(normalizarTurma);
};

// POST /turmas — cria uma nova turma.
export const criarTurma = async (payload: SalvarTurmaPayload) => {
  const response = await httpClient.post<RespostaApi<TurmaApi>>('/turmas', payload);
  return normalizarTurma(response.data.dados);
};

// PATCH /turmas/:id — atualiza os dados de uma turma.
export const atualizarTurma = async (id: string, payload: AtualizarTurmaPayload) => {
  const response = await httpClient.patch<RespostaApi<TurmaApi>>(`/turmas/${id}`, payload);
  return normalizarTurma(response.data.dados);
};

// DELETE /turmas/:id — exclui uma turma.
export const excluirTurma = async (id: string) => {
  await httpClient.delete(`/turmas/${id}`);
};

// GET /turmas/:id/alunos — lista os vinculos (alunos) de uma turma.
export const listarAlunosDaTurma = async (turmaId: string) => {
  const response = await httpClient.get<RespostaApi<VinculoTurmaAluno[]>>(`/turmas/${turmaId}/alunos`);
  return response.data.dados;
};

// POST /turmas/:id/alunos — matricula um aluno na turma.
export const vincularAlunoTurma = async (turmaId: string, alunoId: string) => {
  const response = await httpClient.post<RespostaApi<VinculoTurmaAluno>>(`/turmas/${turmaId}/alunos`, {
    alunoId,
  });
  return response.data.dados;
};

// DELETE /turmas/:id/alunos/:alunoId — remove o aluno da turma.
export const desvincularAlunoTurma = async (turmaId: string, alunoId: string) => {
  await httpClient.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
};


// GET /turmas/:id — busca uma turma especifica por id.
export const buscarTurmaPorId = async (id: string) => {
  const response = await httpClient.get<RespostaApi<TurmaApi>>(`/turmas/${id}`);
  return normalizarTurma(response.data.dados);
};
