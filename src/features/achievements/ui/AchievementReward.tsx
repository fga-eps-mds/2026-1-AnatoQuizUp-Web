import { Coins, Gift, ImageOff } from 'lucide-react';

import type { ItemRecompensaConquista } from '../types';

type AchievementRewardProps = {
  moedas?: number;
  item?: ItemRecompensaConquista | null;
  compacto?: boolean;
  carregando?: boolean;
};

export const AchievementReward = ({
  moedas = 0,
  item = null,
  compacto = false,
  carregando = false,
}: AchievementRewardProps) => {
  if (carregando) {
    return (
      <div className="grid min-h-16 grid-cols-2 gap-2" aria-label="Carregando recompensas">
        <div className="animate-pulse rounded-lg bg-[#E2E8F0]" />
        <div className="animate-pulse rounded-lg bg-[#E2E8F0]" />
      </div>
    );
  }

  if (moedas <= 0 && !item) {
    return (
      <div className="flex min-h-12 items-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] px-3 text-xs font-semibold text-[#64748B]">
        <Gift size={16} aria-hidden="true" />
        Sem recompensa adicional
      </div>
    );
  }

  const imagemItem = item?.previewImagemUrl ?? item?.imagemUrl;

  return (
    <div className={`grid gap-2 ${moedas > 0 && item ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {moedas > 0 && (
        <div
          className={`flex items-center gap-2 rounded-lg border border-[#F59E0B]/25 bg-[#FFF8E7] ${
            compacto ? 'min-h-10 px-2.5' : 'min-h-16 px-3'
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-[#0A1128]">
            <Coins size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {!compacto && (
              <p className="text-[10px] font-black uppercase text-[#9A6700]">Recompensa</p>
            )}
            <p className="truncate text-sm font-black text-[#0A1128]">+{moedas} ATP</p>
          </div>
        </div>
      )}

      {item && (
        <div
          className={`flex items-center gap-2 rounded-lg border border-[#14B8A6]/25 bg-[#ECFDF8] ${
            compacto ? 'min-h-10 px-2.5' : 'min-h-16 px-3'
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-[#0D9488] shadow-sm">
            {imagemItem ? (
              <img src={imagemItem} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <ImageOff size={17} aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            {!compacto && (
              <p className="text-[10px] font-black uppercase text-[#0D9488]">Item exclusivo</p>
            )}
            <p className="truncate text-sm font-black text-[#0A1128]">{item.nome}</p>
          </div>
        </div>
      )}
    </div>
  );
};
