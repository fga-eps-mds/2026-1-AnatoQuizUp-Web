import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, LoaderCircle, Star, X } from 'lucide-react';

import { alterarDestaqueConquista } from '../achievementService';
import type {
  ProgressoConquista,
  TierConquista,
  TipoConquista,
} from '../types';
import { AchievementMedal } from './AchievementMedal';
import { AchievementTierBadge } from './AchievementTierBadge';

type AchievementHighlightsModalProps = {
  conquistas: ProgressoConquista[];
  onClose: () => void;
  onSaved: (desbloqueiosDestacados: Set<string>) => void;
};

type OpcaoDestaque = {
  desbloqueioId: string;
  conquistaId: string;
  nome: string;
  tier: TierConquista;
  tipoConquista: TipoConquista;
  destaque: boolean;
};

const LIMITE_DESTAQUES = 3;

export const AchievementHighlightsModal = ({
  conquistas,
  onClose,
  onSaved,
}: AchievementHighlightsModalProps) => {
  const opcoes = useMemo<OpcaoDestaque[]>(
    () =>
      conquistas.flatMap((conquista) =>
        conquista.tiers
          .filter(
            (tier): tier is typeof tier & { desbloqueioId: string } =>
              tier.desbloqueado && Boolean(tier.desbloqueioId),
          )
          .map((tier) => ({
            desbloqueioId: tier.desbloqueioId,
            conquistaId: conquista.id,
            nome: conquista.nome,
            tier: tier.tier,
            tipoConquista: conquista.tipoConquista,
            destaque: tier.destaque,
          })),
      ),
    [conquistas],
  );

  const selecaoInicial = useMemo(
    () => new Set(opcoes.filter((opcao) => opcao.destaque).map((opcao) => opcao.desbloqueioId)),
    [opcoes],
  );
  const [selecionados, setSelecionados] = useState<Set<string>>(
    () => new Set(selecaoInicial),
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !salvando) onClose();
    };

    document.addEventListener('keydown', fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [onClose, salvando]);

  const alterado =
    selecionados.size !== selecaoInicial.size ||
    [...selecionados].some((id) => !selecaoInicial.has(id));

  const alternarDestaque = (desbloqueioId: string) => {
    setErro(null);
    setSelecionados((atuais) => {
      const novaSelecao = new Set(atuais);

      if (novaSelecao.has(desbloqueioId)) {
        novaSelecao.delete(desbloqueioId);
      } else if (novaSelecao.size < LIMITE_DESTAQUES) {
        novaSelecao.add(desbloqueioId);
      }

      return novaSelecao;
    });
  };

  const salvar = async () => {
    const removidos = [...selecaoInicial].filter((id) => !selecionados.has(id));
    const adicionados = [...selecionados].filter((id) => !selecaoInicial.has(id));

    setSalvando(true);
    setErro(null);

    try {
      for (const desbloqueioId of removidos) {
        await alterarDestaqueConquista(desbloqueioId, false);
      }

      for (const desbloqueioId of adicionados) {
        await alterarDestaqueConquista(desbloqueioId, true);
      }

      onSaved(new Set(selecionados));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar as conquistas em destaque.',
      );
    } finally {
      setSalvando(false);
    }
  };

  const destaquesSelecionados = opcoes.filter((opcao) =>
    selecionados.has(opcao.desbloqueioId),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1128]/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !salvando) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-highlights-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Star size={19} className="text-[#D89B00]" aria-hidden="true" />
              <h2
                id="achievement-highlights-title"
                className="text-xl font-black text-[#0A1128]"
              >
                Selecionar conquistas em destaque
              </h2>
            </div>
            <p className="mt-1 text-sm font-medium text-[#64748B]">
              Escolha até três conquistas para exibir no seu perfil.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A1128] disabled:opacity-50"
            aria-label="Fechar gerenciamento de destaques"
          >
            <X size={21} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold ${
              selecionados.size === LIMITE_DESTAQUES
                ? 'border-[#14B8A6]/30 bg-[#ECFDF8] text-[#0D9488]'
                : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
            }`}
          >
            <Check size={17} aria-hidden="true" />
            {selecionados.size} de {LIMITE_DESTAQUES} conquistas selecionadas
          </div>

          {erro && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              {erro}
            </div>
          )}

          {opcoes.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {opcoes.map((opcao) => {
                const selecionada = selecionados.has(opcao.desbloqueioId);
                const limiteAtingido =
                  selecionados.size === LIMITE_DESTAQUES && !selecionada;

                return (
                  <button
                    key={opcao.desbloqueioId}
                    type="button"
                    disabled={salvando || limiteAtingido}
                    onClick={() => alternarDestaque(opcao.desbloqueioId)}
                    aria-pressed={selecionada}
                    className={`relative flex min-h-44 flex-col items-center justify-center gap-3 rounded-lg border p-4 text-center transition-colors ${
                      selecionada
                        ? 'border-[#14B8A6] bg-[#F3FFFB] ring-2 ring-[#14B8A6]/10'
                        : 'border-[#E2E8F0] bg-white hover:border-[#14B8A6]/50'
                    } disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    <span
                      className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                        selecionada
                          ? 'border-[#14B8A6] bg-[#14B8A6] text-white'
                          : 'border-[#CBD5E1] bg-white text-transparent'
                      }`}
                    >
                      <Check size={15} aria-hidden="true" />
                    </span>
                    <AchievementMedal
                      tipo={opcao.tipoConquista}
                      tier={opcao.tier}
                      destacada={selecionada}
                      tamanho="sm"
                      nome={opcao.nome}
                    />
                    <div>
                      <p className="line-clamp-2 text-sm font-black text-[#0A1128]">
                        {opcao.nome}
                      </p>
                      <div className="mt-2 flex justify-center">
                        <AchievementTierBadge tier={opcao.tier} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
              <p className="text-sm font-black text-[#0A1128]">
                Nenhuma conquista desbloqueada
              </p>
              <p className="mt-1 text-sm font-medium text-[#64748B]">
                Conclua desafios para poder destacá-los no perfil.
              </p>
            </div>
          )}

          <section className="mt-6 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <h3 className="text-sm font-black text-[#0A1128]">Prévia no perfil</h3>
            {destaquesSelecionados.length > 0 ? (
              <div className="mt-4 flex flex-wrap justify-center gap-6">
                {destaquesSelecionados.map((opcao) => (
                  <div
                    key={opcao.desbloqueioId}
                    className="flex w-28 flex-col items-center gap-2 text-center"
                  >
                    <AchievementMedal
                      tipo={opcao.tipoConquista}
                      tier={opcao.tier}
                      destacada
                      tamanho="sm"
                      nome={opcao.nome}
                    />
                    <p className="line-clamp-2 text-xs font-black text-[#0A1128]">
                      {opcao.nome}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-center text-sm font-medium text-[#64748B]">
                Selecione uma conquista para visualizar a prévia.
              </p>
            )}
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="min-h-11 rounded-lg border border-[#CBD5E1] px-5 text-sm font-black text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void salvar()}
            disabled={salvando || !alterado}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#14B8A6] px-5 text-sm font-black text-white hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
            Salvar destaques
          </button>
        </footer>
      </section>
    </div>
  );
};
