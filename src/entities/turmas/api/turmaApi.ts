import { httpClient } from '../../../shared/api/httpClient';
import type {
  AtualizarTurmaPayload,
  FiltrosTurma,
  SalvarTurmaPayload,
  Turma,
  VinculoTurmaAluno,
} from '../model/types';

type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

type TurmaApi = Omit<Turma, 'quantidadeAlunos'> & {
  quantidadeAlunos?: number;
  _count?: {
    alunos?: number;
  };
};

const normalizarTurma = (turma: TurmaApi): Turma => {
  const { _count, quantidadeAlunos, ...dadosTurma } = turma;

  return {
    ...dadosTurma,
    quantidadeAlunos: quantidadeAlunos ?? _count?.alunos ?? 0,
  };
};

export const listarTurmas = async (filtros?: FiltrosTurma) => {
  const response = await httpClient.get<RespostaApi<TurmaApi[]>>('/turmas', {
    params: filtros,
  });
  return response.data.dados.map(normalizarTurma);
};

export const criarTurma = async (payload: SalvarTurmaPayload) => {
  const response = await httpClient.post<RespostaApi<TurmaApi>>('/turmas', payload);
  return normalizarTurma(response.data.dados);
};

export const atualizarTurma = async (id: string, payload: AtualizarTurmaPayload) => {
  const response = await httpClient.patch<RespostaApi<TurmaApi>>(`/turmas/${id}`, payload);
  return normalizarTurma(response.data.dados);
};

export const excluirTurma = async (id: string) => {
  await httpClient.delete(`/turmas/${id}`);
};

export const listarAlunosDaTurma = async (turmaId: string) => {
  const response = await httpClient.get<RespostaApi<VinculoTurmaAluno[]>>(`/turmas/${turmaId}/alunos`);
  return response.data.dados;
};

export const vincularAlunoTurma = async (turmaId: string, alunoId: string) => {
  const response = await httpClient.post<RespostaApi<VinculoTurmaAluno>>(`/turmas/${turmaId}/alunos`, {
    alunoId,
  });
  return response.data.dados;
};

export const desvincularAlunoTurma = async (turmaId: string, alunoId: string) => {
  await httpClient.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
};
