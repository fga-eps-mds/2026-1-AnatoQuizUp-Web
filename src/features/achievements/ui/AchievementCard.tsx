import { CheckCircle2, ChevronRight, LockKeyhole } from 'lucide-react';

import type { ProgressoConquista } from '../types';
import { AchievementMedal } from './AchievementMedal';
import { AchievementProgress } from './AchievementProgress';
import { AchievementTierBadge } from './AchievementTierBadge';
import {
  obterTierMaisAlto,
  ROTULO_POR_TIPO,
} from './achievementVisuals';

type AchievementCardProps = {
  conquista?: ProgressoConquista;
  onSelect?: (conquista: ProgressoConquista) => void;
  carregando?: boolean;
  compacto?: boolean;
};

/**
 * Card de uma conquista: medalha, titulo/tipo, descricao, barra de progresso e
 * status atual. Renderiza esqueleto enquanto carrega e vira botao quando ha onSelect.
 */
export const AchievementCard = ({
  conquista,
  onSelect,
  carregando = false,
  compacto = false,
}: AchievementCardProps) => {
  // Estado de carregamento (ou sem dados): renderiza um esqueleto animado.
  if (carregando || !conquista) {
    return (
      <div
        className={`grid min-h-44 grid-cols-[96px_1fr] gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4 ${
          compacto ? 'min-h-32' : ''
        }`}
        aria-label="Carregando conquista"
      >
        <div className="h-24 w-24 animate-pulse rounded-full bg-[#E2E8F0]" />
        <div className="space-y-3 pt-1">
          <div className="h-5 w-2/3 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-[#E2E8F0]" />
          <div className="h-9 w-full animate-pulse rounded bg-[#E2E8F0]" />
          <AchievementProgress valor={0} objetivo={1} carregando />
        </div>
      </div>
    );
  }

  // Deriva o estado visual da conquista (tier exibido, concluida, bloqueada, destaque).
  const tierMaisAlto = obterTierMaisAlto(conquista.tiers);
  const proximoTier = conquista.proximoTier;
  const tierVisual = proximoTier ?? tierMaisAlto ?? 'BRONZE';
  const totalmenteConcluida = proximoTier === null && conquista.tiers.length > 0;
  const bloqueada = !tierMaisAlto && conquista.valorProgresso === 0;
  const destacada = conquista.tiers.some((tier) => tier.destaque);
  const objetivoAtual = conquista.proximoObjetivo;

  // Conteudo do card, reutilizado tanto no <button> clicavel quanto no <article> estatico.
  const conteudo = (
    <>
      <AchievementMedal
        tipo={conquista.tipoConquista}
        tier={tierVisual}
        bloqueada={bloqueada}
        destacada={destacada}
        tamanho={compacto ? 'sm' : 'md'}
        nome={conquista.nome}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[#0A1128]">
              {conquista.nome}
            </h3>
            <p className="mt-0.5 text-xs font-bold text-[#64748B]">
              {ROTULO_POR_TIPO[conquista.tipoConquista]}
              {conquista.tema?.nome ? ` · ${conquista.tema.nome}` : ''}
            </p>
          </div>
          <AchievementTierBadge
            tier={tierVisual}
            bloqueado={bloqueada}
            atual={!bloqueada && !totalmenteConcluida}
          />
        </div>

        {!compacto && (
          <p className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-[#475569]">
            {conquista.descricao}
          </p>
        )}

        <AchievementProgress
          valor={conquista.valorProgresso}
          objetivo={objetivoAtual}
          percentual={conquista.percentual}
          concluido={totalmenteConcluida}
          compacto={compacto}
        />

        <div className="flex min-h-5 items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${
              totalmenteConcluida
                ? 'text-[#0D9488]'
                : bloqueada
                  ? 'text-[#64748B]'
                  : 'text-[#0A1128]'
            }`}
          >
            {totalmenteConcluida ? (
              <CheckCircle2 size={14} aria-hidden="true" />
            ) : bloqueada ? (
              <LockKeyhole size={13} aria-hidden="true" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-[#14B8A6]" />
            )}
            {totalmenteConcluida
              ? 'Conquista completa'
              : bloqueada
                ? 'Ainda não iniciada'
                : `Em progresso para ${tierVisual.toLowerCase()}`}
          </span>

          {onSelect && <ChevronRight size={17} className="shrink-0 text-[#94A3B8]" />}
        </div>
      </div>
    </>
  );

  const className = `grid w-full grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-[#E2E8F0] bg-white p-4 text-left shadow-sm transition-colors ${
    compacto ? 'min-h-28' : 'min-h-44'
  } ${onSelect ? 'cursor-pointer hover:border-[#14B8A6]/60 hover:bg-[#F8FFFD]' : ''}`;

  // Com handler de selecao vira botao clicavel; sem ele, apenas um cartao informativo.
  if (onSelect) {
    return (
      <button type="button" className={className} onClick={() => onSelect(conquista)}>
        {conteudo}
      </button>
    );
  }

  return <article className={className}>{conteudo}</article>;
};
