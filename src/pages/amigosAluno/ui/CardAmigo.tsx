import { ChevronRight } from 'lucide-react';
import type { MouseEvent } from 'react';

import type { ResumoAmizade } from '../../../features/friendship';
import type { SlotsCosmeticos } from '../../../shared/ui/profile-identity-card';
import { AvatarCosmetico } from '../../../shared/ui/profile-identity-card';

export type CardAmigoProps = {
  amizade: ResumoAmizade;
  cosmeticos: SlotsCosmeticos;
  processando: boolean;
  onVerPerfil: () => void;
  onDesfazer: (event: MouseEvent<HTMLButtonElement>) => void;
};

const FUNDO_PADRAO = 'linear-gradient(135deg, #e8f9f4 0%, #c5f5e7 100%)';

export const CardAmigo = ({
  amizade,
  cosmeticos,
  processando,
  onVerPerfil,
  onDesfazer,
}: CardAmigoProps) => {
  const { amigo } = amizade;
  const fundo = cosmeticos.PLANO_FUNDO;
  const titulo = cosmeticos.TITULO;

  const cursoLabel = [
    amigo.curso,
    amigo.semestre && `${amigo.semestre}° semestre`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      onClick={onVerPerfil}
      className="flex min-h-[160px] cursor-pointer overflow-hidden rounded-2xl border border-[#0A1128]/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Painel lateral colorido com o fundo do amigo */}
      <div
        className="flex w-24 shrink-0 items-center justify-center sm:w-28"
        style={{ background: fundo?.valor ?? FUNDO_PADRAO }}
      >
        <AvatarCosmetico
          identidade={{ nome: amigo.nome, nickname: amigo.nickname }}
          cosmeticos={cosmeticos}
          tamanho="md"
        />
      </div>

      {/* Conteudo a direita */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div className="min-w-0">
          {titulo ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#B45309]">
              <span aria-hidden="true">🏆</span>
              <span>{titulo.nome}</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400">
              Sem título equipado
            </span>
          )}

          <h4 className="mt-1 truncate text-base font-black text-[#0A1128]">
            {amigo.nome}
          </h4>

          <p className="text-sm font-semibold text-[#0A1128]/55">
            {amigo.nickname ? `@${amigo.nickname}` : 'Sem nickname'}
          </p>

          {cursoLabel && (
            <p className="mt-0.5 truncate text-xs font-semibold text-[#0A1128]/45">
              {cursoLabel}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onVerPerfil();
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-[#0A1128]/15 px-3 py-2 text-xs font-black text-[#0A1128] transition hover:bg-[#F8FAFC]"
          >
            Ver perfil
            <ChevronRight size={14} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDesfazer(event);
            }}
            disabled={processando}
            className="inline-flex items-center rounded-xl border border-rose-200 px-3 py-2 text-xs font-black text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#0A1128]/10 disabled:text-[#0A1128]/40"
          >
            {processando ? 'Removendo...' : 'Desfazer amizade'}
          </button>
        </div>
      </div>
    </article>
  );
};
