import { BarChart3 } from 'lucide-react';
import type { TemaDesempenho } from '../../../entities/dashboardTurma/model/types';

interface GraficoTemasProps {
  temas: TemaDesempenho[];
}

/**
 * Grafico de barras horizontal com a taxa de acerto por tema da turma.
 * A cor da barra/badge reflete o status (Tranquilo/Atencao/Critico) de cada tema.
 */
export const GraficoTemas = ({ temas }: GraficoTemasProps) => {
  // Retorna, num unico string, as classes de cor da barra, do texto e do badge.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Tranquilo': return 'bg-green-500 text-green-700 bg-green-100';
      case 'Atenção': return 'bg-amber-500 text-amber-700 bg-amber-100';
      case 'Crítico': return 'bg-red-500 text-red-700 bg-red-100';
      default: return 'bg-gray-500 text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-900">
          <BarChart3 size={20} className="text-gray-400" />
          Desempenho por Tema
        </h3>
        <span className="text-xs text-gray-400">ordenado por dificuldade</span>
      </div>

      <div className="space-y-5">
        {/* Cabeçalho da listagem (Taxa de acerto por tema) */}
        <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
           <span>Taxa de acerto por tema</span>
        </div>

        {temas.map((tema) => {
          // Separa as classes combinadas em cor da barra, do texto e do fundo do badge.
          const colors = getStatusColor(tema.status).split(' ');
          const barColor = colors[0];
          const textColor = colors[1];
          const badgeBg = colors[2];

          return (
            <div key={tema.nome} className="flex items-center gap-4">
              <span className="w-1/3 truncate text-sm font-bold text-gray-700">
                {tema.nome}
              </span>
              <div className="flex-1">
                {/* Barra de progresso mais fina */}
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${barColor}`}
                    style={{ width: `${tema.taxaAcerto}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex w-24 items-center justify-between">
                <span className="text-sm font-bold text-green-500">{tema.taxaAcerto}%</span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${textColor} ${badgeBg}`}>
                  {tema.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};