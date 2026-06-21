import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Coins,
  Mail,
  Pencil,
  Target,
  Users,
} from 'lucide-react';

import { useAuth } from '../../../../app/providers/AuthProvider';
import { listarAmigos } from '../../../../features/friendship';
import { useEquippedCosmeticsStore } from '../../../../features/profile-cosmetics';
import { useStudentCoinsStore } from '../../../../features/student-coins/model/useStudentCoinsStore';
import { httpClient } from '../../../../shared/api/httpClient';
import { ProfileIdentityCard } from '../../../../shared/ui/profile-identity-card';
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
  const cosmeticos = useEquippedCosmeticsStore((state) => state.cosmeticos);
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
    'Curso não informado';
  const saldoFormatado = saldoMoedas.toLocaleString('pt-BR');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-black text-[#00214d]">Meu Perfil</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Sua conta no AnatoQuizUp</p>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
          <ProfileIdentityCard
            identidade={{
              nome: user.name,
              nickname,
              curso: cursoLabel,
            }}
            cosmeticos={cosmeticos}
            tamanho="md"
            readOnly={false}
            onPersonalizar={() => navigate('/aluno/loja')}
          />

          <aside
            aria-label="Informações da conta"
            className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-black text-[#00214d]">Informações da conta</h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Seus dados de acesso e saldo atual.
              </p>
            </div>

            <div className="flex min-w-0 items-start gap-2 text-sm font-semibold text-gray-500">
              <Mail size={16} className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-all">{user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
              <Coins size={16} />
              {saldoFormatado} ATP
            </div>

            <button
              type="button"
              onClick={() => navigate('/aluno/perfil/editar')}
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#14b8a6] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d9488]"
            >
              <Pencil size={16} />
              Editar informações
            </button>
          </aside>
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

      </div>
    </div>
  );
};
