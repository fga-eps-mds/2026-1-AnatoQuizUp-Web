import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Target, Users } from 'lucide-react';

import { useAuth } from '../../../../app/providers/AuthProvider';
import {
  AchievementHighlights,
  listarConquistasDestacadas,
  type ConquistaDestacada,
} from '../../../../features/achievements';
import { listarAmigos } from '../../../../features/friendship';
import { useEquippedCosmeticsStore } from '../../../../features/profile-cosmetics';
import { converterEquipadosParaSlots } from '../../../../features/profile-cosmetics';
import { buscarInventarioCompleto } from '../../../../features/loja';
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
  onClick?: () => void;
};

const statToneClass = {
  teal: 'bg-teal-50 text-teal-700',
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
} satisfies Record<CardStatProps['tone'], string>;

const formatarValor = (valor: number | string) =>
  typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor;

const CARD_STAT_BASE_CLASS =
  'flex min-h-28 items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm';

const CARD_STAT_INTERATIVO_CLASS =
  'w-full cursor-pointer text-left transition-colors hover:bg-gray-50 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71edc8] focus-visible:ring-offset-2';

export const CardStat = ({ icon, valor, rotulo, carregando, tone, onClick }: CardStatProps) => {
  const conteudo = (
    <>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${statToneClass[tone]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
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
      {onClick !== undefined && (
        <ChevronRight size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${CARD_STAT_BASE_CLASS} ${CARD_STAT_INTERATIVO_CLASS}`}
      >
        {conteudo}
      </button>
    );
  }

  return <div className={CARD_STAT_BASE_CLASS}>{conteudo}</div>;
};

export const PerfilAlunoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const saldoMoedas = useStudentCoinsStore((state) => state.saldoMoedas);

  const cosmeticos = useEquippedCosmeticsStore((state) => state.cosmeticos);
  // MODIFICAÇÃO: Pegando o setCosmeticos para atualizar a store no load
  const setCosmeticos = useEquippedCosmeticsStore((state) => state.setCosmeticos);

  const [stats, setStats] = useState<StatsPerfil>({
    respondidas: 0,
    taxa: 0,
    amigos: 0,
  });
  const [carregandoStats, setCarregandoStats] = useState(true);
  const [conquistasDestacadas, setConquistasDestacadas] = useState<ConquistaDestacada[]>([]);

  useEffect(() => {
    let ativo = true;

    const carregarStats = async () => {
      // MODIFICAÇÃO: httpClient.get adicionado ao array do Promise.allSettled
      const [dashboard, amigos, inventario, destaques] = await Promise.allSettled([
        httpClient.get<Pick<DashboardAlunoResponse, 'totalRespondidas' | 'taxaAcerto'>>(
          '/dashboardAluno',
        ),
        listarAmigos({ limit: 1 }),
        buscarInventarioCompleto(),
        listarConquistasDestacadas(),
      ]);

      if (!ativo) {
        return;
      }

      setStats({
        respondidas: dashboard.status === 'fulfilled' ? dashboard.value.data.totalRespondidas : 0,
        taxa: dashboard.status === 'fulfilled' ? dashboard.value.data.taxaAcerto : 0,
        amigos: amigos.status === 'fulfilled' ? amigos.value.metadados.total : 0,
      });

      // MODIFICAÇÃO: Sincroniza a store com o banco ao carregar a página (F5)
      if (inventario.status === 'fulfilled') {
        setCosmeticos(converterEquipadosParaSlots(inventario.value));
      }

      setConquistasDestacadas(
        destaques.status === 'fulfilled' && Array.isArray(destaques.value)
          ? destaques.value
          : [],
      );
      setCarregandoStats(false);
    };

    void carregarStats();

    return () => {
      ativo = false;
    };
  }, [setCosmeticos]); // MODIFICAÇÃO: setCosmeticos adicionado à dependência

  if (!user) {
    return null;
  }

  const nickname = user.nickname?.trim();
  const cursoLabel =
    [user.course, user.institution].filter(Boolean).join(' · ') || 'Curso não informado';
  const saldoFormatado = saldoMoedas.toLocaleString('pt-BR');

  const fotoPerfil = cosmeticos.AVATAR ?? cosmeticos.ICONE_PERFIL;
  const temItensEmUso = Boolean(
    fotoPerfil ?? cosmeticos.MOLDURA ?? cosmeticos.TITULO ?? cosmeticos.PLANO_FUNDO,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-black text-[#00214d]">Meu Perfil</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">Sua conta no AnatoQuizUp</p>
        </header>

        <ProfileIdentityCard
          identidade={{
            nome: user.name,
            nickname,
            curso: cursoLabel,
          }}
          cosmeticos={cosmeticos}
          tamanho="md"
          readOnly={false}
          onPersonalizar={() => navigate('/aluno/perfil/personalizar')}
          email={user.email}
          saldo={`${saldoFormatado} ATP`}
          onEditar={() => navigate('/aluno/perfil/editar')}
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardStat
            icon={<BookOpen size={20} />}
            valor={stats.respondidas}
            rotulo="Questões respondidas"
            carregando={carregandoStats}
            tone="teal"
            onClick={() => navigate('/aluno/dashboard')}
          />
          <CardStat
            icon={<Target size={20} />}
            valor={`${stats.taxa}%`}
            rotulo="Taxa de acerto"
            carregando={carregandoStats}
            tone="green"
            onClick={() => navigate('/aluno/dashboard')}
          />
          <CardStat
            icon={<Users size={20} />}
            valor={stats.amigos}
            rotulo="Amigos"
            carregando={carregandoStats}
            tone="blue"
            onClick={() => navigate('/aluno/amigos', { state: { aba: 'amigos' } })}
          />
        </section>

        <AchievementHighlights
          conquistas={conquistasDestacadas}
          onManage={() => navigate('/aluno/conquistas', { state: { gerenciarDestaques: true } })}
        />

        {temItensEmUso && (
          <section aria-label="Itens em uso">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-black text-[#00214d]">Itens em uso</h2>
              <button
                type="button"
                onClick={() => navigate('/aluno/loja')}
                className="text-sm font-bold text-[#14b8a6] hover:underline"
              >
                Personalizar →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { rotulo: 'FOTO DE PERFIL', item: fotoPerfil },
                { rotulo: 'MOLDURA', item: cosmeticos.MOLDURA },
                { rotulo: 'TÍTULO', item: cosmeticos.TITULO },
                { rotulo: 'FUNDO', item: cosmeticos.PLANO_FUNDO },
              ].map(({ rotulo, item }) => (
                <div
                  key={rotulo}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">
                    {rotulo}
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-[#00214d]">
                    {item ? item.nome : '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
