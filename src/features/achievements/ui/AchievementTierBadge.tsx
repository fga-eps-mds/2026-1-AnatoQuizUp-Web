import { LockKeyhole } from 'lucide-react';

import type { TierConquista } from '../types';
import { ESTILO_POR_TIER } from './achievementVisuals';

type AchievementTierBadgeProps = {
  tier: TierConquista;
  bloqueado?: boolean;
  atual?: boolean;
};

export const AchievementTierBadge = ({
  tier,
  bloqueado = false,
  atual = false,
}: AchievementTierBadgeProps) => {
  const estilo = ESTILO_POR_TIER[tier];

  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-black uppercase ${
        bloqueado
          ? 'border-[#0A1128]/10 bg-[#F1F5F9] text-[#64748B]'
          : estilo.badge
      }`}
    >
      {bloqueado && <LockKeyhole size={12} aria-hidden="true" />}
      {estilo.label}
      {atual && (
        <span className="rounded-full bg-white/75 px-1.5 py-0.5 text-[9px] text-[#0A1128]">
          Atual
        </span>
      )}
    </span>
  );
};
