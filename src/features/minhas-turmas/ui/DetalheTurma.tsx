import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap, UserCircle2 } from 'lucide-react';

import { httpClient } from '../../../shared/api/httpClient';
import type { Turma } from '../../../entities/turmas/model/types';
import { buscarUsuarioPorId } from '../../../entities/usuarios/api/usuarioApi';
import type { UsuarioPublico } from '../../../entities/usuarios/model/types';

type EstadoDetalhe = 'carregando' | 'sucesso' | 'erro' | 'nao-encontrada';

interface TurmaApi extends Omit<Turma, 'quantidadeAlunos'> {
  quantidadeAlunos?: number;
  _count?: { alunos?: number };
  professorId: string;
}

interface RespostaApi<T> {
  mensagem?: string;
  dados: T;
}

const normalizarTurma = (turma: TurmaApi): Turma & { professorId: string } => {
  const { _count, quantidadeAlunos, ...resto } = turma;

  return {
    ...resto,
    quantidadeAlunos: quantidadeAlunos ?? _count?.alunos ?? 0,
  };
};

const buscarTurma = async (id: string) => {
  const response = await httpClient.get<RespostaApi<TurmaApi>>(`/turmas/${id}`);
  return normalizarTurma(response.data.dados);
};

const ehErroNaoEncontrado = (erro: unknown) => {
  return axios.isAxiosError(erro) && erro.response?.status === 404;
};

const EstadoCarregando = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[200px] items-center justify-center"
  >
    <span className="animate-pulse text-sm text-gray-500">Carregando detalhes...</span>
  </div>
);

interface EstadoNaoEncontradaProps {
  onVoltar: () => void;
}

const EstadoNaoEncontrada = ({ onVoltar }: EstadoNaoEncontradaProps) => (
  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
    <h2 className="text-lg font-bold text-[#0A1128]">Turma não encontrada.</h2>
    <p className="max-w-md text-sm text-gray-500">
      Esta turma não existe ou você não está vinculado a ela.
    </p>
    <button
      type="button"
      onClick={onVoltar}
      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-500"
    >
      <ArrowLeft size={16} />
      Voltar para minhas turmas
    </button>
  </div>
);

const EstadoErro = () => (
  <div
    role="alert"
    className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-6 text-center"
  >
    <p className="text-base font-semibold text-red-800">
      Não foi possível carregar os detalhes da turma.
    </p>
    <p className="text-sm text-red-700">Tente novamente em alguns instantes.</p>
  </div>
);

export const DetalheTurma = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [turma, setTurma] = useState<(Turma & { professorId: string }) | null>(null);
  const [professor, setProfessor] = useState<UsuarioPublico | null>(null);
  const [estado, setEstado] = useState<EstadoDetalhe>(id ? 'carregando' : 'nao-encontrada');

  useEffect(() => {
    if (!id) return undefined;

    let cancelado = false;

    const carregar = async () => {
      try {
        const turmaCarregada = await buscarTurma(id);
        if (cancelado) return;

        setTurma(turmaCarregada);

        try {
          const professorCarregado = await buscarUsuarioPorId(turmaCarregada.professorId);
          if (!cancelado) setProfessor(professorCarregado);
        } catch {
          if (!cancelado) setProfessor(null);
        }

        if (!cancelado) setEstado('sucesso');
      } catch (erro) {
        if (cancelado) return;
        setEstado(ehErroNaoEncontrado(erro) ? 'nao-encontrada' : 'erro');
      }
    };

    void carregar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  const voltar = () => navigate('/aluno/turmas');

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <button
        type="button"
        onClick={voltar}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900"
      >
        <ArrowLeft size={16} />
        Voltar para minhas turmas
      </button>

      {estado === 'carregando' && <EstadoCarregando />}
      {estado === 'erro' && <EstadoErro />}
      {estado === 'nao-encontrada' && <EstadoNaoEncontrada onVoltar={voltar} />}

      {estado === 'sucesso' && turma && (
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <header className="mb-6 flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <BookOpen size={26} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-[#0A1128] md:text-3xl">{turma.nome}</h1>
              <p className="mt-1 text-sm text-gray-500 md:text-base">
                {turma.ano}.{turma.semestre}
              </p>
            </div>
          </header>

          <section className="mb-6">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
              <GraduationCap size={16} />
              Descrição da matéria
            </h2>
            <p className="text-base text-[#0A1128]">{turma.descricao}</p>
          </section>

          <section>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500">
              <UserCircle2 size={16} />
              Professor responsável
            </h2>
            <p className="text-base text-[#0A1128]">
              {professor?.nome ?? 'Professor não disponível'}
            </p>
          </section>
        </article>
      )}
    </section>
  );
};
