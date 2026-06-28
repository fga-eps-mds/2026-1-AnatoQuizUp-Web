// Aba "Alunos" da pagina de detalhes da turma. Mostra os alunos matriculados em
// uma tabela e oferece um painel lateral de busca para matricular novos alunos.
// Como o vinculo turma-aluno guarda apenas o id, os dados completos de cada aluno
// sao carregados a parte (com fallback quando algum nao e encontrado).
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Search,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  desvincularAlunoTurma,
  listarAlunosDaTurma,
  vincularAlunoTurma,
} from '../../../entities/turmas/api/turmaApi';
import type { VinculoTurmaAluno } from '../../../entities/turmas/model/types';
import { buscarAlunos, buscarUsuariosPorIds } from '../../../entities/usuarios/api/usuarioApi';
import type { UsuarioResumo } from '../../../entities/usuarios/model/types';

interface AbaAlunosProps {
  turmaId: string;
}

type TipoToast = 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  type: TipoToast;
}

// Paleta de cores de avatar, escolhida de forma estavel a partir do id do aluno.
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

// Cria um aluno "placeholder" quando os dados completos nao puderam ser carregados.
const criarAlunoFallback = (alunoId: string): UsuarioResumo => ({
  id: alunoId,
  nome: 'Aluno sem dados carregados',
  nickname: null,
  email: alunoId,
  perfil: 'ALUNO',
  status: 'ATIVO',
  instituicao: null,
  curso: null,
  semestre: null,
});

// Deriva uma cor de avatar deterministica a partir do hash simples do id.
const avatarColor = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.codePointAt(0)!, 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// Extrai as iniciais do nome (1a e ultima palavra) para o avatar.
const iniciais = (nome: string) => {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes.at(-1)![0]}`.toUpperCase();
};

// Formata a data ISO para o padrao curto pt-BR (devolve o original se invalida).
const formatarData = (iso: string) => {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleDateString('pt-BR');
};

/**
 * Componente da aba de alunos. Carrega os matriculados, gerencia a busca com
 * debounce e as acoes de adicionar/remover alunos da turma.
 * @param turmaId id da turma cujos alunos serao gerenciados
 */
export const AbaAlunos = ({ turmaId }: AbaAlunosProps) => {
  const [vinculos, setVinculos] = useState<VinculoTurmaAluno[]>([]);
  const [alunos, setAlunos] = useState<UsuarioResumo[]>([]);
  const [busca, setBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<UsuarioResumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuscando, setIsBuscando] = useState(false);
  const [emOperacao, setEmOperacao] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Conjunto de ids ja matriculados (para marcar "Vinculado" nos resultados de busca).
  const idsVinculados = useMemo(
    () => new Set(vinculos.map((vinculo) => vinculo.alunoId)),
    [vinculos],
  );

  // Indice vinculo por alunoId (para recuperar a data de matricula na tabela).
  const vinculosPorAlunoId = useMemo(
    () => new Map(vinculos.map((vinculo) => [vinculo.alunoId, vinculo])),
    [vinculos],
  );

  const mostrarToast = useCallback((message: string, type: TipoToast = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  // Carrega os vinculos da turma e, a partir dos ids, os dados completos de cada
  // aluno (usando fallback quando algum usuario nao for encontrado).
  const carregarAlunos = useCallback(async () => {
    setIsLoading(true);

    try {
      const vinculosAtivos = await listarAlunosDaTurma(turmaId);
      const alunoIds = vinculosAtivos.map((vinculo) => vinculo.alunoId);
      const usuarios = await buscarUsuariosPorIds(alunoIds);
      const usuariosPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

      setVinculos(vinculosAtivos);
      setAlunos(alunoIds.map((alunoId) => usuariosPorId.get(alunoId) ?? criarAlunoFallback(alunoId)));
    } catch (error) {
      console.error('Erro ao carregar alunos da turma', error);
      mostrarToast('Nao foi possivel carregar os alunos da turma.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [mostrarToast, turmaId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarAlunos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarAlunos]);

  // Busca de alunos com debounce (300ms) e cancelamento: so dispara com 2+ caracteres
  // e descarta resultados de buscas antigas que retornem fora de ordem.
  useEffect(() => {
    const termoBusca = busca.trim();

    if (termoBusca.length < 2) {
      const timeoutId = window.setTimeout(() => {
        setResultadosBusca([]);
        setIsBuscando(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsBuscando(true);

      try {
        const resultado = await buscarAlunos({ busca: termoBusca, limit: 10 });

        if (!isCancelled) {
          setResultadosBusca(resultado.dados);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Erro ao buscar alunos', error);
          mostrarToast('Nao foi possivel buscar alunos.', 'error');
        }
      } finally {
        if (!isCancelled) {
          setIsBuscando(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [busca, mostrarToast]);

  // Matricula um aluno na turma e recarrega a lista.
  const handleAdicionar = async (alunoId: string) => {
    setEmOperacao(alunoId);

    try {
      await vincularAlunoTurma(turmaId, alunoId);
      mostrarToast('Aluno adicionado a turma.');
      await carregarAlunos();
    } catch (error) {
      console.error('Erro ao vincular aluno', error);
      mostrarToast('Nao foi possivel adicionar o aluno.', 'error');
    } finally {
      setEmOperacao(null);
    }
  };

  // Remove um aluno da turma e recarrega a lista.
  const handleRemover = async (alunoId: string) => {
    setEmOperacao(alunoId);

    try {
      await desvincularAlunoTurma(turmaId, alunoId);
      mostrarToast('Aluno removido da turma.');
      await carregarAlunos();
    } catch (error) {
      console.error('Erro ao desvincular aluno', error);
      mostrarToast('Nao foi possivel remover o aluno.', 'error');
    } finally {
      setEmOperacao(null);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {toast && (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-6 top-6 z-[60] flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'border-teal-200 bg-teal-50 text-teal-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Coluna principal: tabela de alunos matriculados (ou estados de carga/vazio). */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Alunos matriculados</h3>
            <p className="text-sm text-gray-500">{alunos.length} aluno(s) nesta turma</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            <Users size={14} />
            Matriculas ativas
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-12 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" />
            Carregando alunos matriculados...
          </div>
        ) : alunos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <GraduationCap size={36} className="mb-3 text-gray-300" />
            <h4 className="text-base font-bold text-gray-900">Nenhum aluno matriculado ainda.</h4>
            <p className="mt-1 max-w-md text-sm text-gray-500">
              Use o painel de busca para adicionar alunos a esta turma.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Aluno</th>
                  <th className="px-4 py-3">Curso</th>
                  <th className="px-4 py-3">Semestre</th>
                  <th className="px-4 py-3">Matriculado em</th>
                  <th className="px-4 py-3 text-right">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {alunos.map((aluno) => {
                  const vinculo = vinculosPorAlunoId.get(aluno.id);

                  return (
                    <tr key={aluno.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(aluno.id)}`}
                          >
                            {iniciais(aluno.nome)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-gray-900">{aluno.nome}</p>
                            <p className="truncate text-xs text-gray-500">{aluno.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{aluno.curso ?? 'Curso nao informado'}</td>
                      <td className="px-4 py-4">{aluno.semestre ?? 'Semestre nao informado'}</td>
                      <td className="px-4 py-4">{formatarData(vinculo!.criadoEm)}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void handleRemover(aluno.id)}
                          disabled={emOperacao === aluno.id}
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {emOperacao === aluno.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <UserMinus size={14} />
                          )}
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Painel lateral: busca de alunos com debounce para matricular na turma. */}
      <aside className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">Adicionar aluno</h3>
        <p className="mt-1 text-sm text-gray-500">
          Busque por nome ou email para matricular um aluno nesta turma.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
          <Search size={18} className="text-gray-400" />
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar aluno"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          {busca.trim().length < 2 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Digite ao menos 2 caracteres para buscar.
            </p>
          ) : isBuscando ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              Buscando alunos...
            </div>
          ) : resultadosBusca.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Nenhum aluno encontrado.</p>
          ) : (
            <ul className="max-h-[420px] divide-y divide-gray-200 overflow-y-auto">
              {resultadosBusca.map((aluno) => {
                const jaVinculado = idsVinculados.has(aluno.id);

                return (
                  <li key={aluno.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{aluno.nome}</p>
                      <p className="truncate text-xs text-gray-500">{aluno.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleAdicionar(aluno.id)}
                      disabled={jaVinculado || emOperacao === aluno.id}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {emOperacao === aluno.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UserPlus size={14} />
                      )}
                      {jaVinculado ? 'Vinculado' : 'Adicionar'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </section>
  );
};
