import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  AchievementCard,
  AchievementDetailsModal,
  AchievementMedal,
  AchievementProgress,
  listarProgressoConquistas,
  type ProgressoConquista,
} from '../../../../features/achievements';

type FiltroConquista = 'TODAS' | 'DESBLOQUEADAS' | 'EM_PROGRESSO' | 'BLOQUEADAS';

const FILTROS: Array<{ id: FiltroConquista; label: string }> = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'DESBLOQUEADAS', label: 'Desbloqueadas' },
  { id: 'EM_PROGRESSO', label: 'Em progresso' },
  { id: 'BLOQUEADAS', label: 'Bloqueadas' },
];

const QUANTIDADE_INICIAL = 6;

const possuiTierDesbloqueado = (conquista: ProgressoConquista) =>
  conquista.tiers.some((tier) => tier.desbloqueado);

const estaEmProgresso = (conquista: ProgressoConquista) =>
  conquista.proximoTier !== null && conquista.valorProgresso > 0;

const estaBloqueada = (conquista: ProgressoConquista) =>
  !possuiTierDesbloqueado(conquista);

const filtrarConquista = (
  conquista: ProgressoConquista,
  filtro: FiltroConquista,
) => {
  if (filtro === 'DESBLOQUEADAS') return possuiTierDesbloqueado(conquista);
  if (filtro === 'EM_PROGRESSO') return estaEmProgresso(conquista);
  if (filtro === 'BLOQUEADAS') return estaBloqueada(conquista);
  return true;
};

const ResumoSkeleton = () => (
  <div className="grid gap-3 sm:grid-cols-3">
    {[0, 1, 2].map((item) => (
      <div
        key={item}
        className="min-h-28 animate-pulse rounded-lg border border-[#E2E8F0] bg-white p-4"
      >
        <div className="h-10 w-10 rounded-lg bg-[#E2E8F0]" />
        <div className="mt-3 h-6 w-16 rounded bg-[#E2E8F0]" />
        <div className="mt-2 h-3 w-28 rounded bg-[#E2E8F0]" />
      </div>
    ))}
  </div>
);

export const ConquistasPage = () => {
  const navigate = useNavigate();
  const [conquistas, setConquistas] = useState<ProgressoConquista[]>([]);
  const [filtro, setFiltro] = useState<FiltroConquista>('TODAS');
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(QUANTIDADE_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [recarregar, setRecarregar] = useState(0);
  const [conquistaSelecionada, setConquistaSelecionada] =
    useState<ProgressoConquista | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregarConquistas = async () => {
      setCarregando(true);
      setErro(null);

      try {
        const resposta = await listarProgressoConquistas({ page: 1, limit: 100 });

        if (ativo) {
          setConquistas(resposta.dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar suas conquistas.',
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    void carregarConquistas();

    return () => {
      ativo = false;
    };
  }, [recarregar]);

  const resumo = useMemo(() => {
    const tiersDesbloqueados = conquistas.reduce(
      (total, conquista) =>
        total + conquista.tiers.filter((tier) => tier.desbloqueado).length,
      0,
    );
    const emProgresso = conquistas.filter(estaEmProgresso).length;
    const destaques = conquistas.reduce(
      (total, conquista) =>
        total + conquista.tiers.filter((tier) => tier.destaque).length,
      0,
    );

    return { tiersDesbloqueados, emProgresso, destaques };
  }, [conquistas]);

  const proximaConquista = useMemo(
    () =>
      conquistas
        .filter((conquista) => conquista.proximoTier !== null)
        .sort((a, b) => {
          if (a.percentual !== b.percentual) return b.percentual - a.percentual;
          return a.nome.localeCompare(b.nome);
        })[0] ?? null,
    [conquistas],
  );

  const conquistasFiltradas = useMemo(
    () => conquistas.filter((conquista) => filtrarConquista(conquista, filtro)),
    [conquistas, filtro],
  );

  const conquistasVisiveis = conquistasFiltradas.slice(0, quantidadeVisivel);
  const podeCarregarMais = quantidadeVisivel < conquistasFiltradas.length;

  const selecionarFiltro = (novoFiltro: FiltroConquista) => {
    setFiltro(novoFiltro);
    setQuantidadeVisivel(QUANTIDADE_INICIAL);
  };

  return (
    <main className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#14B8A6]/12 text-[#0D9488]">
              <Trophy size={24} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-[#0A1128]">Minhas Conquistas</h1>
              <p className="mt-1 text-sm font-semibold text-[#64748B]">
                Acompanhe seus marcos, tiers e próximos desafios.
              </p>
            </div>
          </div>
        </header>

        {carregando ? (
          <ResumoSkeleton />
        ) : (
          <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumo de conquistas">
            <ResumoCard
              icon={CheckCircle2}
              valor={resumo.tiersDesbloqueados}
              titulo="tiers desbloqueados"
              descricao="Marcos conquistados"
              tom="teal"
            />
            <ResumoCard
              icon={CircleDashed}
              valor={resumo.emProgresso}
              titulo="em progresso"
              descricao="Desafios em andamento"
              tom="amber"
            />
            <ResumoCard
              icon={Star}
              valor={resumo.destaques}
              titulo="destaques no perfil"
              descricao="Máximo de 3 medalhas"
              tom="rose"
            />
          </section>
        )}

        {erro && (
          <section
            role="alert"
            className="flex min-h-36 flex-col items-center justify-center gap-4 rounded-lg border border-rose-200 bg-white px-5 text-center"
          >
            <p className="text-sm font-bold text-rose-600">{erro}</p>
            <button
              type="button"
              onClick={() => setRecarregar((valor) => valor + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0A1128] px-4 py-2 text-sm font-bold text-white"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Tentar novamente
            </button>
          </section>
        )}

        {!erro && (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0">
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white sm:grid-cols-4">
                {FILTROS.map((item) => {
                  const ativo = filtro === item.id;
                  const quantidade = conquistas.filter((conquista) =>
                    filtrarConquista(conquista, item.id),
                  ).length;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selecionarFiltro(item.id)}
                      aria-pressed={ativo}
                      className={`min-h-12 border-b border-r border-[#E2E8F0] px-3 text-sm font-black transition-colors last:border-r-0 sm:border-b-0 ${
                        ativo
                          ? 'bg-[#ECFDF8] text-[#0D9488]'
                          : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0A1128]'
                      }`}
                    >
                      {item.label}
                      <span className="ml-2 text-xs tabular-nums opacity-70">
                        {quantidade}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {carregando &&
                  Array.from({ length: 6 }, (_, index) => (
                    <AchievementCard key={index} carregando />
                  ))}

                {!carregando &&
                  conquistasVisiveis.map((conquista) => (
                    <AchievementCard
                      key={conquista.id}
                      conquista={conquista}
                      onSelect={setConquistaSelecionada}
                    />
                  ))}
              </div>

              {!carregando && conquistasFiltradas.length === 0 && (
                <div className="mt-4 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-white px-5 text-center">
                  <Trophy size={30} className="text-[#94A3B8]" aria-hidden="true" />
                  <p className="mt-3 text-sm font-black text-[#0A1128]">
                    Nenhuma conquista nesta categoria
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#64748B]">
                    Continue respondendo questões para avançar.
                  </p>
                </div>
              )}

              {podeCarregarMais && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setQuantidadeVisivel((valor) => valor + 6)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-5 text-sm font-black text-[#0A1128] hover:border-[#14B8A6]"
                  >
                    Carregar mais conquistas
                    <ChevronDown size={17} aria-hidden="true" />
                  </button>
                </div>
              )}
            </section>

            <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
              <section className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
                <h2 className="text-base font-black text-[#0A1128]">
                  Próximo desbloqueio
                </h2>

                {carregando ? (
                  <div className="mt-5 flex gap-4">
                    <div className="h-20 w-20 animate-pulse rounded-full bg-[#E2E8F0]" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 animate-pulse rounded bg-[#E2E8F0]" />
                      <div className="h-4 animate-pulse rounded bg-[#E2E8F0]" />
                      <div className="h-2 animate-pulse rounded bg-[#E2E8F0]" />
                    </div>
                  </div>
                ) : proximaConquista ? (
                  <div className="mt-5">
                    <div className="flex items-center gap-4">
                      <AchievementMedal
                        tipo={proximaConquista.tipoConquista}
                        tier={proximaConquista.proximoTier}
                        tamanho="sm"
                        nome={proximaConquista.nome}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#0A1128]">
                          {proximaConquista.nome}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase text-[#64748B]">
                          Próximo tier: {proximaConquista.proximoTier?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <AchievementProgress
                        valor={proximaConquista.valorProgresso}
                        objetivo={proximaConquista.proximoObjetivo}
                        percentual={proximaConquista.percentual}
                        compacto
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setConquistaSelecionada(proximaConquista)}
                      className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#ECFDF8] text-sm font-black text-[#0D9488] hover:bg-[#D8FAEF]"
                    >
                      Ver detalhes
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg bg-[#ECFDF8] p-4 text-sm font-bold text-[#0D9488]">
                    Todos os desafios disponíveis foram concluídos.
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
                <h2 className="text-base font-black text-[#0A1128]">Como evoluir</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#64748B]">
                  Acertos totais, domínio dos temas e sequências sem erro aumentam seu
                  progresso automaticamente.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/aluno/quiz/escolha')}
                  className="mt-4 min-h-10 w-full rounded-lg bg-[#14B8A6] px-4 text-sm font-black text-white hover:bg-[#0D9488]"
                >
                  Continuar estudando
                </button>
              </section>
            </aside>
          </div>
        )}
      </div>

      {conquistaSelecionada && (
        <AchievementDetailsModal
          conquista={conquistaSelecionada}
          onClose={() => setConquistaSelecionada(null)}
        />
      )}
    </main>
  );
};

type ResumoCardProps = {
  icon: typeof Trophy;
  valor: number;
  titulo: string;
  descricao: string;
  tom: 'teal' | 'amber' | 'rose';
};

const TONS = {
  teal: 'bg-[#CCFBF1] text-[#0D9488]',
  amber: 'bg-[#FEF3C7] text-[#B45309]',
  rose: 'bg-[#FFE4E6] text-[#E11D48]',
};

const ResumoCard = ({
  icon: Icon,
  valor,
  titulo,
  descricao,
  tom,
}: ResumoCardProps) => (
  <article className="flex min-h-28 items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${TONS[tom]}`}
    >
      <Icon size={23} aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-black tabular-nums text-[#0A1128]">{valor}</p>
      <h2 className="text-sm font-black text-[#0A1128]">{titulo}</h2>
      <p className="mt-1 text-xs font-semibold text-[#64748B]">{descricao}</p>
    </div>
  </article>
);
