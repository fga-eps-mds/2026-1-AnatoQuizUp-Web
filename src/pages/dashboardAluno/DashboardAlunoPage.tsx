import { useEffect, useState } from "react";
import { BookOpen, Target, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DashboardAlunoResponse, TemaDashboard } from "./types";
import { httpClient } from "../../shared/api/httpClient";

const COLORS = ["#14b8a6", "#f59e0b", "#f43f5e", "#3b82f6", "#8b5cf6"];

export const DashboardAlunoPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardAlunoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await httpClient.get<DashboardAlunoResponse>("/dashboardAluno");
        setData(response.data);
      } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-[#00214d] animate-pulse">
          Carregando seu progresso...
        </div>
      </div>
    );
  }

  if (!data || data.totalRespondidas === 0) {
    return (
      <div className="flex h-full min-h-[80vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-blue-100 p-8">
          <Brain size={64} className="text-[#00214d]" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-[#00214d]">
          Nenhuma questão respondida ainda!
        </h2>

        <p className="mb-8 max-w-md text-gray-500">
          Você ainda não possui dados estatísticos. Que tal fazer sua primeira questão e começar a acompanhar sua evolução de aprendizado?
        </p>

        <button
          onClick={() => navigate("/aluno/quiz/escolha")}
          className="rounded-lg bg-[#F97316] px-8 py-3 font-bold text-white transition-colors hover:bg-orange-600 shadow-md"
        >
          Fazer Primeira Questão
        </button>
      </div>
    );
  }

  const gradientStops = data.porTema
    .reduce<{ stops: string[]; acumulado: number }>(
      (resultado, tema, index) => {
        const proporcao = (tema.totalRespondidas / data.totalRespondidas) * 100;
        const cor = COLORS[index % COLORS.length];
        const inicio = resultado.acumulado;
        const fim = inicio + proporcao;

        return {
          stops: [...resultado.stops, `${cor} ${inicio}% ${fim}%`],
          acumulado: fim,
        };
      },
      { stops: [], acumulado: 0 },
    )
    .stops.join(", ");

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();

    if (s === "tranquilo") {
      return "text-emerald-600 bg-emerald-100";
    }

    if (s === "atenção") {
      return "text-orange-600 bg-orange-100";
    }

    return "text-red-600 bg-red-100";
  };

  const getBarColor = (status: string) => {
    const s = status.toLowerCase();

    if (s === "tranquilo") {
      return "bg-emerald-500";
    }

    if (s === "atenção") {
      return "bg-orange-500";
    }

    return "bg-red-500";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-[#00214d]">
          Dashboard de Evolução
        </h1>
        <p className="text-gray-500">
          Acompanhe suas estatísticas de resolução e desempenho
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Questões Respondidas
            </p>
            <p className="text-4xl font-black text-[#00214d] mt-2">
              {data.totalRespondidas}
            </p>
          </div>

          <div className="rounded-full bg-blue-50 p-4 text-[#00214d]">
            <BookOpen size={32} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Geral de Acertos
            </p>
            <p className="text-4xl font-black text-[#10B981] mt-2">
              {data.taxaAcerto}%
            </p>
          </div>

          <div className="rounded-full bg-emerald-50 p-4 text-[#10B981]">
            <Target size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold text-[#00214d] mb-1">
            Distribuição por Tema
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Proporção de questões que você já resolveu
          </p>

          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8">
            <div
              className="relative w-48 h-48 rounded-full"
              style={{ background: `conic-gradient(${gradientStops})` }}
            >
              <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-[#00214d]">
                  {data.totalRespondidas}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase">
                  Total
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {data.porTema.map((tema, index) => (
                <div key={tema.temaId} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {tema.nome}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({tema.totalRespondidas})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#00214d] mb-1">
                Desempenho por Tema
              </h2>
              <p className="text-sm text-gray-500">
                Taxa de acerto por tema
              </p>
            </div>

            <span className="text-xs text-gray-400 font-medium">
              ordenado por acertos
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {data.porTema.map((tema: TemaDashboard) => (
              <div key={tema.temaId} className="flex items-center gap-4">
                <div className="w-1/3">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {tema.nome}
                  </p>
                </div>

                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getBarColor(tema.status)}`}
                    style={{ width: `${tema.taxaAcerto}%` }}
                  />
                </div>

                <div className="w-28 flex items-center justify-end gap-2">
                  <span className={`text-sm font-black ${getStatusColor(tema.status).split(" ")[0]}`}>
                    {tema.taxaAcerto}%
                  </span>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest ${getStatusColor(tema.status)}`}>
                    {tema.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};