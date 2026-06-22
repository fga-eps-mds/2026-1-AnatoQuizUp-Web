import { LockKeyhole, Star } from 'lucide-react';

import type { TierConquista, TipoConquista } from '../types';
import {
  ESTILO_POR_TIER,
  ICONE_POR_TIPO,
} from './achievementVisuals';

type AchievementMedalProps = {
  tipo: TipoConquista;
  tier?: TierConquista | null;
  bloqueada?: boolean;
  destacada?: boolean;
  tamanho?: 'sm' | 'md' | 'lg';
  nome?: string;
};

const TAMANHOS = {
  sm: {
    externo: 'h-14 w-14',
    interno: 'h-10 w-10',
    icone: 22,
    cadeado: 'h-5 w-5 -bottom-1 -right-1',
  },
  md: {
    externo: 'h-24 w-24',
    interno: 'h-[68px] w-[68px]',
    icone: 36,
    cadeado: 'h-7 w-7 -bottom-1 -right-1',
  },
  lg: {
    externo: 'h-36 w-36',
    interno: 'h-[104px] w-[104px]',
    icone: 54,
    cadeado: 'h-9 w-9 bottom-0 right-0',
  },
} as const;

export const AchievementMedal = ({
  tipo,
  tier = 'BRONZE',
  bloqueada = false,
  destacada = false,
  tamanho = 'md',
  nome = 'Conquista',
}: AchievementMedalProps) => {
  const Icone = ICONE_POR_TIPO[tipo];
  const estilo = ESTILO_POR_TIER[tier ?? 'BRONZE'];
  const dimensoes = TAMANHOS[tamanho];

  return (
    <div
      className={`relative shrink-0 ${dimensoes.externo}`}
      role="img"
      aria-label={`${nome}, tier ${estilo.label}${bloqueada ? ', bloqueada' : ''}`}
    >
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border-[5px] ${
          bloqueada
            ? 'border-[#CBD5E1] bg-[#E2E8F0] shadow-inner grayscale'
            : `${estilo.aro} bg-gradient-to-br ${estilo.medalha} ${estilo.brilho}`
        }`}
      >
        <div
          className={`flex items-center justify-center rounded-full border-2 ${
            bloqueada
              ? 'border-[#94A3B8]/40 bg-[#F1F5F9] text-[#94A3B8]'
              : 'border-white/55 bg-white/25 text-white shadow-inner'
          } ${dimensoes.interno}`}
        >
          <Icone size={dimensoes.icone} strokeWidth={2.4} aria-hidden="true" />
        </div>
      </div>

      {bloqueada && (
        <span
          className={`absolute flex items-center justify-center rounded-full border-2 border-white bg-[#475569] text-white shadow-md ${dimensoes.cadeado}`}
        >
          <LockKeyhole size={tamanho === 'lg' ? 18 : 13} aria-hidden="true" />
        </span>
      )}

      {destacada && !bloqueada && (
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#FACC15] text-[#7C5200] shadow-md">
          <Star size={15} fill="currentColor" aria-hidden="true" />
        </span>
      )}
    </div>
  );
};
