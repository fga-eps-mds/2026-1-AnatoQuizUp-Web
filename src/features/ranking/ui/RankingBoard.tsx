import { Trophy } from 'lucide-react';

import type { LinhaRanking } from '../types';
import { PodiumRanking } from './PodiumRanking';
import { RankingRow } from './RankingRow';

type RankingBoardProps = {
  linhas: LinhaRanking[];
  rotuloMetrica: string;
  usuarioAtual?: LinhaRanking | null;
  carregando: boolean;
  erro: string | null;
  mensagemVazio: string;
};

/** Esqueleto de carregamento: quatro linhas pulsantes no lugar do ranking. */
const Esqueleto = () => (
  <div className="flex flex-col gap-3">
    {[0, 1, 2, 3].map((indice) => (
      <div
        key={indice}
        className="h-16 animate-pulse rounded-2xl border border-[#0A1128]/10 bg-white"
      />
    ))}
  </div>
);

/**
 * Quadro de ranking reutilizavel: trata carregamento/erro/vazio e, no sucesso,
 * renderiza o podio (top 3), as demais posicoes e uma linha fixa do usuario atual
 * quando ele esta fora da faixa visivel.
 */
export const RankingBoard = ({
  linhas,
  rotuloMetrica,
  usuarioAtual,
  carregando,
  erro,
  mensagemVazio,
}: RankingBoardProps) => {
  // Estados nao-sucesso resolvidos por retorno antecipado.
  if (carregando) {
    return <Esqueleto />;
  }

  if (erro) {
    return (
      <p className="rounded-2xl bg-rose-50 px-4 py-4 text-sm font-bold text-rose-600">{erro}</p>
    );
  }

  if (linhas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#0A1128]/15 bg-white px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#71edc8]/20 text-[#00A88F]">
          <Trophy size={28} />
        </span>
        <p className="max-w-sm text-sm font-semibold text-[#0A1128]/55">{mensagemVazio}</p>
      </div>
    );
  }

  // Posicoes fora do podio e flag indicando se o usuario atual nao esta na lista exibida.
  const restantes = linhas.filter((linha) => linha.posicao > 3);
  const usuarioForaDaLista =
    usuarioAtual && !linhas.some((linha) => linha.id === usuarioAtual.id);

  return (
    <div className="flex flex-col gap-5">
      <PodiumRanking linhas={linhas} rotuloMetrica={rotuloMetrica} />

      {restantes.length > 0 && (
        <div className="flex flex-col gap-3">
          {restantes.map((linha) => (
            <RankingRow key={linha.id} linha={linha} rotuloMetrica={rotuloMetrica} />
          ))}
        </div>
      )}

      {/* Linha fixa do usuario atual quando ele nao aparece entre as posicoes listadas. */}
      {usuarioForaDaLista && (
        <div className="sticky bottom-4 mt-2">
          <div className="rounded-2xl border border-[#00A88F]/30 bg-white/95 p-1 shadow-lg backdrop-blur">
            <RankingRow linha={usuarioAtual} rotuloMetrica={rotuloMetrica} />
          </div>
        </div>
      )}
    </div>
  );
};
