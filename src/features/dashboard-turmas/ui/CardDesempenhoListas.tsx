import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCcw,
  Users,
} from 'lucide-react';
import { buscarDesempenhoPorListas } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import type { DesempenhoLista } from '../../../entities/dashboardTurma/model/types';

interface CardDesempenhoListasProps {
  turmaId: string;
}

const formatarPrazo = (prazo: string | null) => {
  if (!prazo) return 'Sem prazo';

  const data = new Date(prazo);
  if (Number.isNaN(data.getTime())) return prazo;

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatarTaxa = (taxa: number, temRespostas: boolean) => {
  if (!temRespostas) return '-';

  return `${taxa.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(taxa) ? 0 : 1,
  })}%`;
};

const calcularPercentual = (lista: DesempenhoLista) => {
  if (lista.totalAlunos <= 0) return 0;

  return Math.min(100, Math.round((lista.totalSubmeteram / lista.totalAlunos) * 100));
};

const prazoExpirado = (prazo: string | null) => {
  if (!prazo) return false;

  const data = new Date(prazo);
  if (Number.isNaN(data.getTime())) return false;

  return data.getTime() < Date.now();
};

export const CardDesempenhoListas = ({ turmaId }: CardDesempenhoListasProps) => {
  const [listas, setListas] = useState<DesempenhoLista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDesempenho = useCallback(async () => {
    setIsLoading(true);
    setErro(null);
    try {
      const dados = await buscarDesempenhoPorListas(turmaId);
      setListas(dados);
    } catch (error) {
      console.error('Erro ao carregar desempenho por lista', error);
      setErro('Nao foi possivel carregar o desempenho por lista.');
    } finally {
      setIsLoading(false);
    }
  }, [turmaId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarDesempenho();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarDesempenho]);

  const totalPublicacoes = useMemo(() => listas.length, [listas]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" />
        Carregando desempenho por lista...
      </div>
    );
  }

  if (erro) {
    return (
      <div
        role="alert"
        className="flex h-64 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-800"
      >
        <AlertCircle size={24} className="mb-3" />
        <p className="font-semibold">{erro}</p>
        <button
          type="button"
          onClick={() => void carregarDesempenho()}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
        >
          <RefreshCcw size={14} />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (listas.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 text-center">
        <ClipboardList size={32} className="mb-3 text-gray-300" />
        <h4 className="text-sm font-bold text-gray-900">Nenhuma lista publicada nesta turma.</h4>
        <p className="mt-1 text-xs text-gray-500">
          As publicacoes aparecem aqui assim que forem vinculadas a turma.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-gray-500">
        <span>{totalPublicacoes} lista(s) publicada(s)</span>
        <span>submissoes</span>
      </div>

      <ul className="space-y-3">
        {listas.map((lista) => {
          const percentual = calcularPercentual(lista);
          const temRespostas = lista.totalSubmeteram > 0;
          const expirado = prazoExpirado(lista.prazo);

          return (
            <li
              key={lista.listaTurmaId}
              className="rounded-lg border border-gray-200 bg-gray-50/70 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{lista.nomeLista}</p>
                  <p
                    className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${
                      expirado ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    <CalendarClock size={13} />
                    {expirado ? 'Prazo expirado' : formatarPrazo(lista.prazo)}
                  </p>
                </div>

                <span className="shrink-0 rounded bg-white px-2 py-1 text-xs font-bold text-gray-700">
                  {percentual}%
                </span>
              </div>

              <div className="mb-4 h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-teal-500"
                  style={{ width: `${percentual}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-white px-2 py-2">
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900">
                    <CheckCircle2 size={14} className="text-teal-600" />
                    {lista.totalSubmeteram}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">responderam</p>
                </div>
                <div className="rounded-md bg-white px-2 py-2">
                  <p className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900">
                    <Users size={14} className="text-amber-600" />
                    {lista.totalPendentes}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">pendentes</p>
                </div>
                <div className="rounded-md bg-white px-2 py-2">
                  <p className="text-sm font-bold text-gray-900">
                    {formatarTaxa(lista.taxaMediaAcerto, temRespostas)}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">acerto medio</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
