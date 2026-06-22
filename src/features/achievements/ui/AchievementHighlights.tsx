import { Star } from 'lucide-react';

import type { ConquistaDestacada } from '../types';
import { AchievementMedal } from './AchievementMedal';

type AchievementHighlightsProps = {
  conquistas: ConquistaDestacada[];
  onManage?: () => void;
  compact?: boolean;
};

export const AchievementHighlights = ({
  conquistas,
  onManage,
  compact = false,
}: AchievementHighlightsProps) => (
  <section
    aria-label="Conquistas em destaque"
    className={`rounded-lg border border-[#E2E8F0] bg-white ${
      compact ? 'p-3' : 'p-5 shadow-sm'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Star size={18} className="text-[#D89B00]" fill="currentColor" aria-hidden="true" />
        <h2 className={`${compact ? 'text-sm' : 'text-base'} font-black text-[#0A1128]`}>
          Conquistas em destaque
        </h2>
      </div>
      {onManage && (
        <button
          type="button"
          onClick={onManage}
          className="text-sm font-black text-[#0D9488] hover:underline"
        >
          Gerenciar destaques
        </button>
      )}
    </div>

    {conquistas.length > 0 ? (
      <div className={`mt-4 flex flex-wrap ${compact ? 'gap-3' : 'justify-center gap-7'}`}>
        {conquistas.slice(0, 3).map((conquista) => (
          <div
            key={conquista.desbloqueioId}
            className={`flex flex-col items-center gap-2 text-center ${
              compact ? 'w-[72px]' : 'w-28'
            }`}
          >
            <AchievementMedal
              tipo={conquista.tipoConquista}
              tier={conquista.tier}
              destacada
              tamanho="sm"
              nome={conquista.nome}
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-xs font-black leading-4 text-[#0A1128]">
                {conquista.nome}
              </p>
              {!compact && (
                <p className="mt-1 text-[10px] font-black uppercase text-[#64748B]">
                  {conquista.tier.toLowerCase()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-4 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-center">
        <p className="text-sm font-bold text-[#64748B]">
          Nenhuma conquista em destaque.
        </p>
      </div>
    )}
  </section>
);
