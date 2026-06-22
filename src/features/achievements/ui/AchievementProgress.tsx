type AchievementProgressProps = {
  valor: number;
  objetivo: number | null;
  percentual?: number;
  concluido?: boolean;
  compacto?: boolean;
  carregando?: boolean;
};

export const AchievementProgress = ({
  valor,
  objetivo,
  percentual,
  concluido = false,
  compacto = false,
  carregando = false,
}: AchievementProgressProps) => {
  if (carregando) {
    return (
      <div className="flex w-full items-center gap-3" aria-label="Carregando progresso">
        <div className="h-2 flex-1 animate-pulse rounded-full bg-[#E2E8F0]" />
        <div className="h-4 w-10 animate-pulse rounded bg-[#E2E8F0]" />
      </div>
    );
  }

  const progresso = concluido
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          percentual ?? (objetivo && objetivo > 0 ? Math.round((valor / objetivo) * 100) : 0),
        ),
      );

  return (
    <div className={`w-full ${compacto ? 'space-y-1' : 'space-y-2'}`}>
      <div className="flex items-center gap-3">
        <div
          className={`${compacto ? 'h-1.5' : 'h-2'} flex-1 overflow-hidden rounded-full bg-[#E2E8F0]`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progresso}
        >
          <div
            className="h-full rounded-full bg-[#14B8A6] transition-[width] duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <span className="min-w-14 text-right text-xs font-black tabular-nums text-[#475569]">
          {objetivo ? `${Math.min(valor, objetivo)} / ${objetivo}` : 'Completa'}
        </span>
      </div>
      {!compacto && (
        <p className="text-xs font-semibold text-[#64748B]">
          {concluido ? 'Todos os tiers foram conquistados.' : `${progresso}% concluído`}
        </p>
      )}
    </div>
  );
};
