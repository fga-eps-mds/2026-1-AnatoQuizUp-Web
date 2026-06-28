/**
 * Modal de gerenciamento de alunos de uma turma (visao do professor).
 *
 * Dois paineis: alunos ja vinculados (com remocao) e busca de alunos no sistema
 * para vincular. A busca tem debounce de 300ms e exige ao menos 2 caracteres.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, UserMinus, UserPlus, X } from 'lucide-react';
import {
  desvincularAlunoTurma,
  listarAlunosDaTurma,
  vincularAlunoTurma,
} from '../../../entities/turmas/api/turmaApi';
import type { Turma, VinculoTurmaAluno } from '../../../entities/turmas/model/types';
import { buscarAlunos, buscarUsuariosPorIds } from '../../../entities/usuarios/api/usuarioApi';
import type { UsuarioResumo } from '../../../entities/usuarios/model/types';

// Tipo das mensagens de feedback repassadas ao componente pai.
type TipoFeedback = 'success' | 'error';

interface ModalGerenciarAlunosProps {
  isOpen: boolean;
  turma: Turma | null;
  onClose: () => void;
  onAfterChange: () => void;
  onFeedback: (message: string, type: TipoFeedback) => void;
}

// Gera um registro de aluno provisorio quando os dados do usuario nao puderam ser carregados.
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

export const ModalGerenciarAlunos = ({
  isOpen,
  turma,
  onClose,
  onAfterChange,
  onFeedback,
}: ModalGerenciarAlunosProps) => {
  // Vinculos ativos e os respectivos dados de usuario ja resolvidos.
  const [vinculos, setVinculos] = useState<VinculoTurmaAluno[]>([]);
  const [alunosVinculados, setAlunosVinculados] = useState<UsuarioResumo[]>([]);
  // Termo de busca e resultados do painel de adicao de alunos.
  const [busca, setBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState<UsuarioResumo[]>([]);
  // Flags de carregamento/busca e id do aluno em operacao (trava o botao individual).
  const [isLoadingVinculos, setIsLoadingVinculos] = useState(isOpen);
  const [isBuscandoAlunos, setIsBuscandoAlunos] = useState(false);
  const [alunoEmOperacao, setAlunoEmOperacao] = useState<string | null>(null);

  // Conjunto de ids ja vinculados, usado para desabilitar o botao "Adicionar" na busca.
  const idsVinculados = useMemo(
    () => new Set(vinculos.map((vinculo) => vinculo.alunoId)),
    [vinculos],
  );

  // Carrega os vinculos da turma e resolve os dados de cada aluno (com fallback).
  const carregarAlunosVinculados = useCallback(async () => {
    if (!turma) return;

    setIsLoadingVinculos(true);

    try {
      const vinculosAtivos = await listarAlunosDaTurma(turma.id);
      const alunoIds = vinculosAtivos.map((vinculo) => vinculo.alunoId);
      const usuarios = await buscarUsuariosPorIds(alunoIds);
      const usuariosPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

      setVinculos(vinculosAtivos);
      setAlunosVinculados(
        alunoIds.map((alunoId) => usuariosPorId.get(alunoId) ?? criarAlunoFallback(alunoId)),
      );
    } catch (error) {
      console.error('Erro ao carregar alunos da turma', error);
      onFeedback('Nao foi possivel carregar os alunos da turma.', 'error');
    } finally {
      setIsLoadingVinculos(false);
    }
  }, [onFeedback, turma]);

  // Recarrega os vinculados sempre que o modal abre.
  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      void carregarAlunosVinculados();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarAlunosVinculados, isOpen]);

  // Busca alunos com debounce de 300ms; ignora termos com menos de 2 caracteres.
  useEffect(() => {
    if (!isOpen) return undefined;

    const termoBusca = busca.trim();
    if (termoBusca.length < 2) {
      return undefined;
    }

    // Flag de cancelamento evita aplicar resultado de uma busca ja superada.
    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsBuscandoAlunos(true);

      try {
        const resultado = await buscarAlunos({ busca: termoBusca, limit: 10 });

        if (!isCancelled) {
          setResultadosBusca(resultado.dados);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Erro ao buscar alunos', error);
          onFeedback('Nao foi possivel buscar alunos.', 'error');
        }
      } finally {
        if (!isCancelled) {
          setIsBuscandoAlunos(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [busca, isOpen, onFeedback]);

  // Sem modal aberto ou turma alvo, nao ha o que renderizar.
  if (!isOpen || !turma) return null;

  /** Vincula um aluno a turma e recarrega a lista de vinculados. */
  const handleVincularAluno = async (alunoId: string) => {
    setAlunoEmOperacao(alunoId);

    try {
      await vincularAlunoTurma(turma.id, alunoId);
      onFeedback('Aluno vinculado com sucesso.', 'success');
      await carregarAlunosVinculados();
      onAfterChange();
    } catch (error) {
      console.error('Erro ao vincular aluno', error);
      onFeedback('Nao foi possivel vincular o aluno.', 'error');
    } finally {
      setAlunoEmOperacao(null);
    }
  };

  /** Remove o vinculo do aluno com a turma e recarrega a lista de vinculados. */
  const handleDesvincularAluno = async (alunoId: string) => {
    setAlunoEmOperacao(alunoId);

    try {
      await desvincularAlunoTurma(turma.id, alunoId);
      onFeedback('Aluno removido da turma com sucesso.', 'success');
      await carregarAlunosVinculados();
      onAfterChange();
    } catch (error) {
      console.error('Erro ao desvincular aluno', error);
      onFeedback('Nao foi possivel remover o aluno.', 'error');
    } finally {
      setAlunoEmOperacao(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-alunos-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-alunos-title" className="text-lg font-bold text-gray-900">
              Alunos da turma
            </h3>
            <p className="text-sm text-gray-500">
              {turma.nome} · {turma.ano}.{turma.semestre}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de alunos"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Duas colunas: alunos vinculados (esquerda) e busca para adicionar (direita). */}
        <div className="grid min-h-0 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Painel esquerdo: alunos ja na turma, com acao de remover. */}
          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Vinculados</h4>
              <span className="text-xs font-medium text-gray-500">
                {alunosVinculados.length} aluno(s)
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
              {isLoadingVinculos ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando alunos...
                </div>
              ) : alunosVinculados.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum aluno vinculado.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {alunosVinculados.map((aluno) => (
                    <li key={aluno.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{aluno.nome}</p>
                        <p className="truncate text-xs text-gray-500">{aluno.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDesvincularAluno(aluno.id)}
                        disabled={alunoEmOperacao === aluno.id}
                        className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {alunoEmOperacao === aluno.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserMinus size={14} />
                        )}
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Painel direito: campo de busca e resultados com acao de adicionar. */}
          <section className="min-h-0">
            <h4 className="mb-3 text-sm font-bold text-gray-900">Buscar alunos</h4>

            <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <Search size={18} className="text-gray-400" />
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome ou email"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
              {busca.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Digite ao menos 2 caracteres para buscar.
                </p>
              ) : isBuscandoAlunos ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Buscando alunos...
                </div>
              ) : resultadosBusca.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum aluno encontrado.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {resultadosBusca.map((aluno) => {
                    const jaVinculado = idsVinculados.has(aluno.id);

                    return (
                      <li key={aluno.id} className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{aluno.nome}</p>
                          <p className="truncate text-xs text-gray-500">{aluno.email}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleVincularAluno(aluno.id)}
                          disabled={jaVinculado || alunoEmOperacao === aluno.id}
                          className="flex shrink-0 items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {alunoEmOperacao === aluno.id ? (
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
          </section>
        </div>
      </div>
    </div>
  );
};
