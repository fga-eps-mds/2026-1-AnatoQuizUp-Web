import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Inbox } from 'lucide-react';

import { listarTurmas } from '../../../entities/turmas/api/turmaApi';
import type { Turma } from '../../../entities/turmas/model/types';

type Estado = 'carregando' | 'vazio' | 'sucesso' | 'erro';

interface TurmaCardProps {
  turma: Turma;
  onClick: () => void;
}

const TurmaCard = ({ turma, onClick }: TurmaCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-md focus:-translate-y-1 focus:border-teal-400 focus:shadow-md"
  >
    <div className="flex items-start justify-between gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
        <BookOpen size={22} />
      </span>
      <ChevronRight
        size={20}
        className="text-gray-300 transition-colors group-hover:text-teal-500"
      />
    </div>
    <div>
      <h3 className="text-lg font-bold text-[#0A1128]">{turma.nome}</h3>
      <p className="mt-1 text-sm text-gray-500">{turma.ano}.{turma.semestre}</p>
    </div>
  </button>
);

const EstadoCarregando = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[200px] items-center justify-center"
  >
    <span className="animate-pulse text-sm text-gray-500">Carregando turmas...</span>
  </div>
);

const EstadoErro = () => (
  <div
    role="alert"
    className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-6 text-center"
  >
    <p className="text-base font-semibold text-red-800">
      Não foi possível carregar suas turmas.
    </p>
    <p className="text-sm text-red-700">Tente novamente em alguns instantes.</p>
  </div>
);

const EstadoVazio = () => (
  <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
      <Inbox size={32} />
    </span>
    <h2 className="text-lg font-bold text-[#0A1128]">
      Você ainda não foi adicionado a nenhuma turma.
    </h2>
    <p className="max-w-md text-sm text-gray-500">
      Aguarde o convite do seu professor. Assim que você for vinculado a uma turma,
      ela aparecerá aqui.
    </p>
  </div>
);

export const MinhasTurmas = () => {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [estado, setEstado] = useState<Estado>('carregando');

  useEffect(() => {
    let cancelado = false;

    listarTurmas()
      .then((dados) => {
        if (cancelado) return;
        setTurmas(dados);
        setEstado(dados.length === 0 ? 'vazio' : 'sucesso');
      })
      .catch(() => {
        if (cancelado) return;
        setEstado('erro');
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black text-[#0A1128] md:text-3xl">Minhas Turmas</h1>
        <p className="mt-1 text-sm text-gray-500 md:text-base">
          Visualize as turmas em que você está matriculado.
        </p>
      </header>

      {estado === 'carregando' && <EstadoCarregando />}
      {estado === 'erro' && <EstadoErro />}
      {estado === 'vazio' && <EstadoVazio />}
      {estado === 'sucesso' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <TurmaCard
              key={turma.id}
              turma={turma}
              onClick={() => navigate(`/aluno/turmas/${turma.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
