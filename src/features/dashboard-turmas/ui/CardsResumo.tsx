import { Users, Clock, CheckCircle2 } from 'lucide-react';
import type { DashboardMacro } from '../../../entities/dashboardTurma/model/types';

interface CardsResumoProps {
  dados: DashboardMacro;
}

/**
 * Tres cartoes-resumo do dashboard da turma: total de alunos, questoes respondidas
 * e taxa media de acertos (exibida apenas quando ha respostas).
 */
export const CardsResumo = ({ dados }: CardsResumoProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Alunos matriculados na turma. */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
          <Users size={28} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{dados.totalAlunos}</p>
          <p className="text-xs font-medium text-gray-500">Alunos matriculados<br/>na turma</p>
        </div>
      </div>

      {/* Total de questoes respondidas pela turma. */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-teal-500">
          <Clock size={28} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{dados.totalQuestoesRespondidas}</p>
          <p className="text-xs font-medium text-gray-500">Questões respondidas<br/>pela turma no total</p>
        </div>
      </div>

      {/* Taxa media de acertos da turma. */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-green-500">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {dados.totalQuestoesRespondidas > 0 ? `${dados.taxaMediaAcertos}%` : '-'}
          </p>
          <p className="text-xs font-medium text-gray-500">Taxa média de acertos<br/>da turma inteira</p>
        </div>
      </div>
    </div>
  );
};