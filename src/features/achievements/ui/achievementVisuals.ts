/**
 * Constantes e helpers visuais compartilhados pelos componentes de conquistas:
 * ordem dos tiers, icones e rotulos por tipo, estilos (gradientes/badges) por tier
 * e utilitario para descobrir o tier mais alto ja desbloqueado.
 */
import {
  Brain,
  Flame,
  Footprints,
  Percent,
  type LucideIcon,
} from 'lucide-react';

import type { TierConquista, TipoConquista } from '../types';

// Ordem crescente dos tiers, usada para iterar e comparar progresso.
export const ORDEM_TIERS: TierConquista[] = ['BRONZE', 'PRATA', 'OURO'];

// Icone (lucide) associado a cada tipo de conquista.
export const ICONE_POR_TIPO: Record<TipoConquista, LucideIcon> = {
  TOTAL_ACERTOS: Footprints,
  TOTAL_ACERTOS_TEMA: Brain,
  STREAK_ACERTOS: Flame,
  PERCENTUAL_ACERTO_TEMA: Percent,
};

// Rotulo legivel em PT-BR para cada tipo de conquista.
export const ROTULO_POR_TIPO: Record<TipoConquista, string> = {
  TOTAL_ACERTOS: 'Total de acertos',
  TOTAL_ACERTOS_TEMA: 'Acertos no tema',
  STREAK_ACERTOS: 'Sequência de acertos',
  PERCENTUAL_ACERTO_TEMA: 'Domínio do tema',
};

// Conjunto de classes Tailwind por tier: rotulo, badge, gradiente da medalha, aro e brilho.
export const ESTILO_POR_TIER: Record<
  TierConquista,
  {
    label: string;
    badge: string;
    medalha: string;
    aro: string;
    brilho: string;
  }
> = {
  BRONZE: {
    label: 'Bronze',
    badge: 'border-[#C8793F]/30 bg-[#FFF3E8] text-[#9A4F22]',
    medalha: 'from-[#F2B57E] via-[#C8793F] to-[#8B451F]',
    aro: 'border-[#8B451F]/35',
    brilho: 'shadow-[0_8px_20px_rgba(154,79,34,0.24)]',
  },
  PRATA: {
    label: 'Prata',
    badge: 'border-[#94A3B8]/35 bg-[#F1F5F9] text-[#526174]',
    medalha: 'from-[#E2E8F0] via-[#A8B4C4] to-[#64748B]',
    aro: 'border-[#64748B]/35',
    brilho: 'shadow-[0_8px_20px_rgba(100,116,139,0.24)]',
  },
  OURO: {
    label: 'Ouro',
    badge: 'border-[#E3A008]/35 bg-[#FFF8DB] text-[#9A6700]',
    medalha: 'from-[#FFE58A] via-[#F5B51B] to-[#C77B00]',
    aro: 'border-[#C77B00]/35',
    brilho: 'shadow-[0_8px_20px_rgba(227,160,8,0.28)]',
  },
};

/**
 * Retorna o tier mais alto que ja foi desbloqueado, ou null se nenhum foi.
 * @param tiers Lista de tiers da conquista com seu estado de desbloqueio.
 */
export const obterTierMaisAlto = (
  tiers: Array<{ tier: TierConquista; desbloqueado: boolean }>,
): TierConquista | null => {
  // Filtra na ordem oficial e pega o ultimo (mais alto) desbloqueado.
  const desbloqueados = ORDEM_TIERS.filter((tier) =>
    tiers.some((registro) => registro.tier === tier && registro.desbloqueado),
  );

  return desbloqueados.at(-1) ?? null;
};
