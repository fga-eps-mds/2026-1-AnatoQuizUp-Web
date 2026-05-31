import { useEffect, useState } from 'react';
import { BarChart3, X } from 'lucide-react';
import { buscarDesempenhoIndividual } from '../../../entities/dashboardTurma/api/dashboardTurmaApi';
import { buscarUsuariosPorIds } from '../../../entities/usuarios/api/usuarioApi';
import type { DesempenhoAluno } from '../../../entities/dashboardTurma/model/types';
import type { UsuarioResumo } from '../../../entities/usuarios/model/types';

type AlunoComDesempenho = DesempenhoAluno & { usuario: UsuarioResumo | null };

interface Props {
  turmaId: string;
}

const AVATAR_COLORS = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
];

function avatarColor(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(nome: string): string {
  const parts = nome.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatarData(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  const mesmodia = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, '0');

  if (mesmodia(d, hoje)) return `Hoje, ${hh}h${mm}`;
  if (mesmodia(d, ontem)) return `Ontem, ${hh}h${mm}`;
  return d.toLocaleDateString('pt-BR');
}

function barColor(taxa: number): string {
  if (taxa >= 70) return 'bg-green-500';
  if (taxa >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function textColor(taxa: number): string {
  if (taxa >= 70) return 'text-green-600';
  if (taxa >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export const TabelaDesempenhoIndividual = ({ turmaId }: Props) => {
  const [alunos, setAlunos] = useState<AlunoComDesempenho[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<AlunoComDesempenho | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const individual = await buscarDesempenhoIndividual(turmaId);
        const ids = individual.alunos.map((a) => a.alunoId);
        const usuarios = ids.length > 0 ? await buscarUsuariosPorIds(ids) : [];
        const porId = new Map(usuarios.map((u) => [u.id, u]));

        setAlunos(
          individual.alunos.map((stats) => ({
            ...stats,
            usuario: porId.get(stats.alunoId) ?? null,
          })),
        );
      } catch (err) {
        console.error('Erro ao carregar desempenho individual:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [turmaId]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Carregando desempenho individual...
      </div>
    );
  }

  if (alunos.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Nenhum aluno encontrado na turma.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Alunos da turma</span>
        <span className="text-xs text-gray-400">clique em um aluno para ver histórico detalhado</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Aluno</th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Questões Respondidas
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Taxa de Acerto
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Última Atividade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {alunos.map((aluno) => {
              const nome = aluno.usuario?.nome ?? 'Aluno desconhecido';
              const email = aluno.usuario?.email ?? aluno.alunoId;

              return (
                <tr
                  key={aluno.alunoId}
                  onClick={() => setSelected(aluno)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(aluno.alunoId)}`}
                      >
                        {initials(nome)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{nome}</p>
                        <p className="text-xs text-gray-400">{email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 font-semibold text-gray-900">{aluno.totalRespondidas}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${barColor(aluno.taxaAcerto)}`}
                          style={{ width: `${aluno.taxaAcerto}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${textColor(aluno.taxaAcerto)}`}>
                        {aluno.taxaAcerto}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-500">{formatarData(aluno.ultimaAtividade)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColor(selected.alunoId)}`}
                >
                  {initials(selected.usuario?.nome ?? '?')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selected.usuario?.nome ?? 'Aluno'}</h3>
                  <p className="text-sm text-gray-400">{selected.usuario?.email}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fechar detalhes do aluno"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{selected.totalRespondidas}</p>
                <p className="text-xs text-gray-500">Questões</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-bold text-green-600">{selected.totalAcertos}</p>
                <p className="text-xs text-gray-500">Acertos</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className={`text-lg font-bold ${textColor(selected.taxaAcerto)}`}>{selected.taxaAcerto}%</p>
                <p className="text-xs text-gray-500">Taxa Geral</p>
              </div>
            </div>

            {selected.desempenhoPorTema.length > 0 ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">Desempenho por Tema</span>
                </div>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {selected.desempenhoPorTema.map((tema) => (
                    <div key={tema.nome} className="flex items-center gap-3">
                      <span className="w-1/3 truncate text-sm font-medium text-gray-700">{tema.nome}</span>
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${barColor(tema.taxaAcerto)}`}
                            style={{ width: `${tema.taxaAcerto}%` }}
                          />
                        </div>
                      </div>
                      <span className={`w-10 text-right text-sm font-bold ${textColor(tema.taxaAcerto)}`}>
                        {tema.taxaAcerto}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-gray-400">Nenhuma questão respondida ainda.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
