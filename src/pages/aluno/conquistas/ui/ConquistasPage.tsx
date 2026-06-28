// Pagina de conquistas (gamificacao) do aluno. Lista o progresso por conquista
// agrupado em desbloqueadas/em progresso/bloqueadas, destaca o "proximo
// desbloqueio" mais perto de completar e permite gerenciar quais conquistas
// ficam em destaque no perfil.
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  LockKeyhole,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  AchievementCard,
  AchievementDetailsModal,
  AchievementHighlightsModal,
  AchievementMedal,
  AchievementProgress,
  listarProgressoConquistas,
  type ProgressoConquista,
} from '../../../../features/achievements';

// Filtro/categoria de conquistas exibida na pagina.
type FiltroConquista = 'DESBLOQUEADAS' | 'EM_PROGRESSO' | 'BLOQUEADAS';

// Quantidade de cards exibidos inicialmente (o resto entra via "Carregar mais").
const QUANTIDADE_INICIAL = 6;

// Conquista desbloqueada: possui ao menos um tier ja conquistado.
const possuiTierDesbloqueado = (conquista: ProgressoConquista) =>
  conquista.tiers.some((tier) => tier.desbloqueado);

// Em progresso: ainda ha proximo tier e ja houve algum avanco.
const estaEmProgresso = (conquista: ProgressoConquista) =>
  conquista.proximoTier !== null && conquista.valorProgresso > 0;

// Bloqueada: nenhum tier desbloqueado ainda.
const estaBloqueada = (conquista: ProgressoConquista) =>
  !possuiTierDesbloqueado(conquista);

/**
 * Decide se uma conquista pertence ao filtro selecionado.
 * @param conquista conquista a testar
 * @param filtro categoria atual
 */
const filtrarConquista = (
  conquista: ProgressoConquista,
  filtro: FiltroConquista,
) => {
  if (filtro === 'DESBLOQUEADAS') return possuiTierDesbloqueado(conquista);
  if (filtro === 'EM_PROGRESSO') return estaEmProgresso(conquista);
  return estaBloqueada(conquista);
};

// Placeholder animado exibido enquanto o resumo (3 cards) ainda esta carregando.
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

/**
 * Componente de pagina das conquistas do aluno. Carrega o progresso, deriva o
 * resumo e a proxima conquista, e controla os modais de detalhes e de destaques.
 */
export const ConquistasPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Estado de navegacao opcional: pode pedir para abrir uma conquista ou o modal de destaques.
  const estadoNavegacao = location.state as {
    abrirConquistaId?: string;
    gerenciarDestaques?: boolean;
  } | null;
  const [conquistas, setConquistas] = useState<ProgressoConquista[]>([]);
  const [filtro, setFiltro] = useState<FiltroConquista>('DESBLOQUEADAS');
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(QUANTIDADE_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [recarregar, setRecarregar] = useState(0);
  const [conquistaSelecionadaId, setConquistaSelecionadaId] = useState<string | null>(
    estadoNavegacao?.abrirConquistaId ?? null,
  );
  const [gerenciandoDestaques, setGerenciandoDestaques] = useState(
    estadoNavegacao?.gerenciarDestaques ?? false,
  );
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Carrega o progresso de todas as conquistas ao montar e a cada nova tentativa.
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

  // Contagens por categoria, exibidas nos tres cards-resumo (que tambem filtram).
  const resumo = useMemo(() => {
    const desbloqueadas = conquistas.filter(possuiTierDesbloqueado).length;
    const emProgresso = conquistas.filter(estaEmProgresso).length;
    const bloqueadas = conquistas.filter(estaBloqueada).length;

    return { desbloqueadas, emProgresso, bloqueadas };
  }, [conquistas]);

  // Conquista mais perto de concluir: maior percentual primeiro (desempate por nome).
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

  // Conquistas que passam pelo filtro atual, e o subconjunto realmente visivel.
  const conquistasFiltradas = useMemo(
    () => conquistas.filter((conquista) => filtrarConquista(conquista, filtro)),
    [conquistas, filtro],
  );

  const conquistasVisiveis = conquistasFiltradas.slice(0, quantidadeVisivel);
  const podeCarregarMais = quantidadeVisivel < conquistasFiltradas.length;
  // Conquista cujo modal de detalhes esta aberto (se houver).
  const conquistaSelecionada = useMemo(
    () =>
      conquistas.find((conquista) => conquista.id === conquistaSelecionadaId) ??
      null,
    [conquistaSelecionadaId, conquistas],
  );

  // Troca o filtro e reseta a paginacao para a quantidade inicial.
  const selecionarFiltro = (novoFiltro: FiltroConquista) => {
    setFiltro(novoFiltro);
    setQuantidadeVisivel(QUANTIDADE_INICIAL);
  };

  /**
   * Aplica localmente o novo conjunto de destaques apos salvar no modal,
   * marcando cada tier como destacado conforme os ids retornados.
   * @param desbloqueiosDestacados ids dos desbloqueios marcados como destaque
   */
  const atualizarDestaques = (desbloqueiosDestacados: Set<string>) => {
    setConquistas((atuais) =>
      atuais.map((conquista) => ({
        ...conquista,
        tiers: conquista.tiers.map((tier) => ({
          ...tier,
          destaque:
            tier.desbloqueioId !== null &&
            desbloqueiosDestacados.has(tier.desbloqueioId),
        })),
      })),
    );
    setGerenciandoDestaques(false);
    setMensagemSucesso('Conquistas em destaque atualizadas.');
    window.setTimeout(() => setMensagemSucesso(null), 3500);
  };

  // Limpa o estado de navegacao apos consumi-lo, evitando reabrir o modal ao voltar.
  useEffect(() => {
    if (
      !estadoNavegacao?.abrirConquistaId &&
      !estadoNavegacao?.gerenciarDestaques
    ) {
      return;
    }

    navigate('/aluno/conquistas', { replace: true, state: null });
  }, [
    estadoNavegacao?.abrirConquistaId,
    estadoNavegacao?.gerenciarDestaques,
    navigate,
  ]);

  return (
    <main className="min-h-full bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
          <button
            type="button"
            onClick={() => setGerenciandoDestaques(true)}
            disabled={!conquistas.some(possuiTierDesbloqueado)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#14B8A6] bg-white px-4 text-sm font-black text-[#0D9488] hover:bg-[#ECFDF8] disabled:cursor-not-allowed disabled:border-[#CBD5E1] disabled:text-[#94A3B8]"
          >
            <Star size={17} aria-hidden="true" />
            Gerenciar destaques
          </button>
        </header>

        {mensagemSucesso && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-[#14B8A6]/30 bg-[#ECFDF8] px-4 py-3 text-sm font-bold text-[#0D9488]"
          >
            <CheckCircle2 size={18} aria-hidden="true" />
            {mensagemSucesso}
          </div>
        )}

        {/* Resumo: tres cards clicaveis que tambem funcionam como filtros. */}
        {carregando ? (
          <ResumoSkeleton />
        ) : (
          <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumo de conquistas">
            <ResumoCard
              icon={CheckCircle2}
              valor={resumo.desbloqueadas}
              titulo="Conquistas desbloqueadas"
              tom="teal"
              ativo={filtro === 'DESBLOQUEADAS'}
              onClick={() => selecionarFiltro('DESBLOQUEADAS')}
            />
            <ResumoCard
              icon={CircleDashed}
              valor={resumo.emProgresso}
              titulo="Em progresso"
              tom="amber"
              ativo={filtro === 'EM_PROGRESSO'}
              onClick={() => selecionarFiltro('EM_PROGRESSO')}
            />
            <ResumoCard
              icon={LockKeyhole}
              valor={resumo.bloqueadas}
              titulo="Bloqueadas"
              tom="rose"
              ativo={filtro === 'BLOQUEADAS'}
              onClick={() => selecionarFiltro('BLOQUEADAS')}
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
          <div className="flex flex-col gap-5">
            {/* Destaque do proximo desbloqueio: a conquista mais perto de completar. */}
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
                <div className="mt-4 grid items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                  <AchievementMedal
                    tipo={proximaConquista.tipoConquista}
                    tier={proximaConquista.proximoTier}
                    tamanho="sm"
                    nome={proximaConquista.nome}
                  />
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-black text-[#0A1128]">
                        {proximaConquista.nome}
                      </p>
                      <p className="text-xs font-bold uppercase text-[#64748B]">
                        Próximo tier: {proximaConquista.proximoTier?.toLowerCase()}
                      </p>
                    </div>
                    <AchievementProgress
                      valor={proximaConquista.valorProgresso}
                      objetivo={proximaConquista.proximoObjetivo}
                      percentual={proximaConquista.percentual}
                      compacto
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setConquistaSelecionadaId(proximaConquista.id)}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#ECFDF8] px-5 text-sm font-black text-[#0D9488] hover:bg-[#D8FAEF]"
                  >
                    Ver detalhes
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-[#ECFDF8] p-4 text-sm font-bold text-[#0D9488]">
                  Todos os desafios disponíveis foram concluídos.
                </div>
              )}
            </section>

            <section className="min-w-0">
              <div className="grid gap-4">
                {carregando &&
                  Array.from({ length: 6 }, (_, index) => (
                    <AchievementCard key={index} carregando />
                  ))}

                {!carregando &&
                  conquistasVisiveis.map((conquista) => (
                    <AchievementCard
                      key={conquista.id}
                      conquista={conquista}
                      onSelect={(item) => setConquistaSelecionadaId(item.id)}
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

            <section className="rounded-lg border border-[#E2E8F0] bg-white p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-black text-[#0A1128]">Como evoluir</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#64748B]">
                    Acertos totais, domínio dos temas e sequências sem erro aumentam seu
                    progresso automaticamente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/aluno/quiz/escolha')}
                  className="min-h-10 shrink-0 rounded-lg bg-[#14B8A6] px-5 text-sm font-black text-white hover:bg-[#0D9488]"
                >
                  Continuar estudando
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {conquistaSelecionada && (
        <AchievementDetailsModal
          conquista={conquistaSelecionada}
          onClose={() => setConquistaSelecionadaId(null)}
        />
      )}

      {gerenciandoDestaques && (
        <AchievementHighlightsModal
          conquistas={conquistas}
          onClose={() => setGerenciandoDestaques(false)}
          onSaved={atualizarDestaques}
        />
      )}
    </main>
  );
};

type ResumoCardProps = {
  icon: typeof Trophy;
  valor: number;
  titulo: string;
  tom: 'teal' | 'amber' | 'rose';
  ativo: boolean;
  onClick: () => void;
};

const TONS = {
  teal: 'bg-[#CCFBF1] text-[#0D9488]',
  amber: 'bg-[#FEF3C7] text-[#B45309]',
  rose: 'bg-[#FFE4E6] text-[#E11D48]',
};

/**
 * Card-resumo clicavel que mostra a contagem de uma categoria e atua como filtro.
 * @param valor quantidade de conquistas na categoria
 * @param titulo rotulo da categoria
 * @param tom cor do card (teal/amber/rose)
 * @param ativo indica se este filtro esta selecionado
 * @param onClick seleciona este filtro
 */
const ResumoCard = ({
  icon: Icon,
  valor,
  titulo,
  tom,
  ativo,
  onClick,
}: ResumoCardProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={ativo}
    className={`flex min-h-24 items-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition-colors ${
      ativo
        ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/10'
        : 'border-[#E2E8F0] hover:border-[#14B8A6]/50'
    }`}
  >
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${TONS[tom]}`}
    >
      <Icon size={23} aria-hidden="true" />
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-black tabular-nums text-[#0A1128]">{valor}</p>
      <h2 className="text-sm font-black text-[#0A1128]">{titulo}</h2>
    </div>
  </button>
);
