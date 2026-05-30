import { Activity } from 'lucide-react';

export const EmptyState = () => (
  <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
      <Activity size={32} />
    </div>
    <h3 className="mb-2 text-lg font-bold text-gray-900">Ainda não há dados suficientes</h3>
    <p className="max-w-md text-sm text-gray-500">
      Incentive seus alunos a praticarem as listas! Os gráficos de desempenho aparecerão assim que os primeiros exercícios forem respondidos.
    </p>
  </div>
);