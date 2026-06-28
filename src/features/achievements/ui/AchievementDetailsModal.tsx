import { useEffect } from 'react';
import { CheckCircle2, Gift, ImageOff, LockKeyhole, X } from 'lucide-react';

import type { ProgressoConquista } from '../types';
import { AchievementMedal } from './AchievementMedal';
import { AchievementProgress } from './AchievementProgress';
import { AchievementTierBadge } from './AchievementTierBadge';
import {
  obterTierMaisAlto,
  ORDEM_TIERS,
  ROTULO_POR_TIPO,
} from './achievementVisuals';

type AchievementDetailsModalProps = {
  conquista: ProgressoConquista;
  onClose: () => void;
};

/**
 * Modal de detalhes de uma conquista: medalha, progresso atual e a grade de tiers
 * (bronze/prata/ouro) com seus objetivos e itens exclusivos recompensados.
 */
export const AchievementDetailsModal = ({
  conquista,
  onClose,
}: AchievementDetailsModalProps) => {
  // Bloqueia o scroll do body enquanto aberto e fecha o modal ao pressionar Escape.
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', fecharComEscape);

    // Restaura o overflow e remove o listener ao desmontar.
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [onClose]);

  // Define o tier exibido na medalha principal e se a conquista esta concluida.
  const tierMaisAlto = obterTierMaisAlto(conquista.tiers);
  const tierVisual = conquista.proximoTier ?? tierMaisAlto ?? 'BRONZE';
  const concluida = conquista.proximoTier === null && conquista.tiers.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1128]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        // Fecha somente quando o clique ocorre no backdrop, nao dentro do dialogo.
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-details-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-black uppercase text-[#0D9488]">
              Detalhes da conquista
            </p>
            <h2
              id="achievement-details-title"
              className="mt-1 text-xl font-black text-[#0A1128]"
            >
              {conquista.nome}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A1128]"
            aria-label="Fechar detalhes da conquista"
          >
            <X size={21} />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          {/* Bloco superior: medalha principal + descricao e barra de progresso. */}
          <div className="grid items-center gap-5 sm:grid-cols-[144px_1fr]">
            <div className="flex justify-center">
              <AchievementMedal
                tipo={conquista.tipoConquista}
                tier={tierVisual}
                bloqueada={conquista.valorProgresso === 0 && !tierMaisAlto}
                destacada={conquista.tiers.some((tier) => tier.destaque)}
                tamanho="lg"
                nome={conquista.nome}
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-[#64748B]">
                {ROTULO_POR_TIPO[conquista.tipoConquista]}
                {conquista.tema?.nome ? ` · ${conquista.tema.nome}` : ''}
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-[#475569]">
                {conquista.descricao}
              </p>

              <div className="mt-5 rounded-lg bg-[#F8FAFC] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-[#0A1128]">Seu progresso</span>
                  <AchievementTierBadge
                    tier={tierVisual}
                    atual={!concluida}
                  />
                </div>
                <AchievementProgress
                  valor={conquista.valorProgresso}
                  objetivo={conquista.proximoObjetivo}
                  percentual={conquista.percentual}
                  concluido={concluida}
                />
              </div>
            </div>
          </div>

          <section className="mt-7" aria-labelledby="achievement-tiers-title">
            <h3
              id="achievement-tiers-title"
              className="text-base font-black text-[#0A1128]"
            >
              Tiers
            </h3>

            {/* Grade de tiers na ordem fixa; cada card mostra estado, objetivo e item. */}
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {ORDEM_TIERS.map((tier) => {
                const registro = conquista.tiers.find((item) => item.tier === tier);

                // Pula tiers que essa conquista nao possui.
                if (!registro) return null;

                // Classifica o card como atual (proximo marco), bloqueado ou ja conquistado.
                const atual = conquista.proximoTier === tier;
                const bloqueado = !registro.desbloqueado && !atual;

                return (
                  <article
                    key={tier}
                    className={`flex min-h-72 flex-col rounded-lg border p-4 transition-colors ${
                      atual
                        ? 'border-[#14B8A6] bg-[#F3FFFB] shadow-[0_0_0_3px_rgba(20,184,166,0.1)]'
                        : bloqueado
                          ? 'border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <AchievementTierBadge
                        tier={tier}
                        bloqueado={bloqueado}
                        atual={atual}
                      />
                      {registro.desbloqueado ? (
                        <CheckCircle2 size={19} className="text-[#0D9488]" aria-hidden="true" />
                      ) : (
                        <LockKeyhole size={17} className="text-[#94A3B8]" aria-hidden="true" />
                      )}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <AchievementMedal
                        tipo={conquista.tipoConquista}
                        tier={tier}
                        bloqueada={bloqueado}
                        destacada={registro.destaque}
                        tamanho="sm"
                        nome={`${conquista.nome} ${tier}`}
                      />
                    </div>

                    <p
                      className={`mt-4 text-center text-sm font-black ${
                        bloqueado ? 'text-[#94A3B8]' : 'text-[#0A1128]'
                      }`}
                    >
                      Objetivo: {registro.objetivo}
                    </p>
                    <p
                      className={`mt-1 min-h-9 text-center text-xs font-semibold ${
                        bloqueado ? 'text-[#A8B3C2]' : 'text-[#64748B]'
                      }`}
                    >
                      {registro.desbloqueado
                        ? 'Tier conquistado'
                        : atual
                          ? 'Seu próximo marco'
                          : 'Disponível após o tier anterior'}
                    </p>

                    {/* Rodape do card: item exclusivo recompensado pelo tier (ou aviso de ausencia). */}
                    <div className="mt-auto pt-4">
                      <p
                        className={`mb-2 text-center text-[10px] font-black uppercase ${
                          bloqueado ? 'text-[#A8B3C2]' : 'text-[#64748B]'
                        }`}
                      >
                        Item exclusivo
                      </p>
                      {registro.item ? (
                        <div
                          className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center ${
                            bloqueado
                              ? 'border-[#E2E8F0] bg-[#F1F5F9] grayscale'
                              : 'border-[#14B8A6]/25 bg-[#ECFDF8]'
                          }`}
                        >
                          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                            {registro.item.previewImagemUrl ?? registro.item.imagemUrl ? (
                              <img
                                src={
                                  registro.item.previewImagemUrl ??
                                  registro.item.imagemUrl ??
                                  undefined
                                }
                                alt=""
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <ImageOff size={18} className="text-[#94A3B8]" aria-hidden="true" />
                            )}
                          </span>
                          <span
                            className={`text-xs font-black leading-4 ${
                              bloqueado ? 'text-[#94A3B8]' : 'text-[#0A1128]'
                            }`}
                          >
                            {registro.item.nome}
                          </span>
                        </div>
                      ) : (
                        <div className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 text-center text-[#94A3B8]">
                          <Gift size={18} aria-hidden="true" />
                          <span className="text-xs font-bold">
                            Sem item exclusivo
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};
