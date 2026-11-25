// Aviso de falha da IA no chat OSCE (T1.9): titulo, texto para o aluno e a acao de
// tentar de novo. As cores seguem a gravidade: vermelho quando a IA esta fora ou a
// avaliacao falhou, amarelo quando a falha e passageira.
import { AlertTriangle } from 'lucide-react';

import type { AvisoErroOsce, GravidadeAvisoOsce } from '../../../features/osce/erroOsce';

const CORES: Record<
  GravidadeAvisoOsce,
  { caixa: string; titulo: string; texto: string; botao: string }
> = {
  erro: {
    caixa: 'border-[#FECACA] bg-[#FEF2F2]',
    titulo: 'text-[#7F1D1D]',
    texto: 'text-[#B91C1C]',
    botao: 'border-[#B91C1C] text-[#991B1B] hover:bg-[#FEF2F2]',
  },
  alerta: {
    caixa: 'border-[#FDE68A] bg-[#FFFBEB]',
    titulo: 'text-[#78350F]',
    texto: 'text-[#92400E]',
    botao: 'border-[#92400E] text-[#92400E] hover:bg-[#FFFBEB]',
  },
};

type AvisoFalhaOsceProps = {
  aviso: AvisoErroOsce;
  rotuloAcao: string;
  onAcao: () => void;
  acaoDesabilitada?: boolean;
};

export const AvisoFalhaOsce = ({
  aviso,
  rotuloAcao,
  onAcao,
  acaoDesabilitada = false,
}: AvisoFalhaOsceProps) => {
  const cores = CORES[aviso.gravidade];

  return (
    <div
      role="alert"
      className={`mt-3 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${cores.caixa}`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${cores.titulo}`} aria-hidden="true" />
        <div>
          {aviso.titulo && <p className={`text-sm font-black ${cores.titulo}`}>{aviso.titulo}</p>}
          <p className={`text-sm font-medium ${cores.texto}`}>{aviso.texto}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAcao}
        disabled={acaoDesabilitada}
        className={`min-h-[36px] shrink-0 self-start rounded-lg border bg-white px-3 text-xs font-bold disabled:opacity-50 sm:self-center ${cores.botao}`}
      >
        {rotuloAcao}
      </button>
    </div>
  );
};
