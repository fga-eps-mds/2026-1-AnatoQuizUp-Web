import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Coins,
  GraduationCap,
  Mail,
  Pencil,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

import { useAuth } from '../../../../app/providers/AuthProvider';
import { listarAmigos } from '../../../../features/friendship';
import { useStudentCoinsStore } from '../../../../features/student-coins/model/useStudentCoinsStore';
import { httpClient } from '../../../../shared/api/httpClient';
import type { DashboardAlunoResponse } from '../../../dashboardAluno/types';

type StatsPerfil = {
  respondidas: number;
  taxa: number;
  amigos: number;
};

type CardStatProps = {
  icon: ReactNode;
  valor: number | string;
  rotulo: string;
  carregando: boolean;
  tone: 'teal' | 'green' | 'blue';
};

const statToneClass = {
  teal: 'bg-teal-50 text-teal-700',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
} satisfies Record<CardStatProps['tone'], string>;

const montarIniciais = (nome?: string | null) => {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : '';

  return `${primeira}${ultima}`.toUpperCase() || 'A';
};

const formatarValor = (valor: number | string) => (
  typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor
);

const CardStat = ({ icon, valor, rotulo, carregando, tone }: CardStatProps) => (
  <div className="flex min-h-28 items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${statToneClass[tone]}`}>
      {icon}
    </div>
    <div className="min-w-0">
      {carregando ? (
        <div
          role="status"
          aria-label={`Carregando ${rotulo}`}
          className="h-8 w-20 animate-pulse rounded-md bg-gray-200"
        />
      ) : (
        <p className="text-3xl font-black tabular-nums text-[#00214d]">{formatarValor(valor)}</p>
      )}
      <p className="mt-1 text-sm font-bold text-gray-500">{rotulo}</p>
    </div>
  </div>
);

export const PerfilAlunoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const saldoMoedas = useStudentCoinsStore((state) => state.saldoMoedas);
  const [stats, setStats] = useState<StatsPerfil>({
    respondidas: 0,
    taxa: 0,
    amigos: 0,
  });
  const [carregandoStats, setCarregandoStats] = useState(true);

  useEffect(() => {
    let ativo = true;

    const carregarStats = async () => {
      const [dashboard, amigos] = await Promise.allSettled([
        httpClient.get<Pick<DashboardAlunoResponse, 'totalRespondidas' | 'taxaAcerto'>>(
          '/dashboardAluno',
        ),
        listarAmigos({ limit: 1 }),
      ]);

      if (!ativo) {
        return;
      }

      setStats({
        respondidas: dashboard.status === 'fulfilled'
          ? dashboard.value.data.totalRespondidas
          : 0,
        taxa: dashboard.status === 'fulfilled' ? dashboard.value.data.taxaAcerto : 0,
        amigos: amigos.status === 'fulfilled' ? amigos.value.metadados.total : 0,
      });
      setCarregandoStats(false);
    };

    void carregarStats();

    return () => {
      ativo = false;
    };
  }, []);

  if (!user) {
    return null;
  }

  const nickname = user.nickname?.trim();
  const cursoLabel = [user.course, user.institution].filter(Boolean).join(' · ') ||
    'Curso nao informado';
  const saldoFormatado = saldoMoedas.toLocaleString('pt-BR');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-black text-[#00214d]">Meu Perfil</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Sua conta no AnatoQuizUp</p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-[#71edc8] to-[#14b8a6]" />
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[#71edc8] bg-gradient-to-br from-[#0A1128] to-[#0d9488] text-2xl font-black text-[#71edc8]">
              {montarIniciais(user.name)}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-black text-[#00214d]">{user.name}</h2>
              {nickname && (
                <p className="mt-1 text-sm font-bold text-gray-500">@{nickname}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-gray-500">
                <span className="flex min-w-0 items-center gap-1.5">
                  <GraduationCap size={15} />
                  <span className="truncate">{cursoLabel}</span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <Mail size={15} />
                  <span className="truncate">{user.email}</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Coins size={15} />
                  {saldoFormatado} ATP
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/aluno/perfil/editar')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#14b8a6] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d9488]"
            >
              <Pencil size={16} />
              Editar informações
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardStat
            icon={<BookOpen size={20} />}
            valor={stats.respondidas}
            rotulo="Questões respondidas"
            carregando={carregandoStats}
            tone="teal"
          />
          <CardStat
            icon={<Target size={20} />}
            valor={`${stats.taxa}%`}
            rotulo="Taxa de acerto"
            carregando={carregandoStats}
            tone="green"
          />
          <CardStat
            icon={<Users size={20} />}
            valor={stats.amigos}
            rotulo="Amigos"
            carregando={carregandoStats}
            tone="blue"
          />
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-[#00214d]">Personalização de perfil</h3>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              Em breve você poderá usar avatares e itens da Loja para deixar seu perfil com a sua cara.
            </p>
          </div>
          <span className="w-fit shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Em breve
          </span>
        </section>
      </div>
    </div>
  );
};
