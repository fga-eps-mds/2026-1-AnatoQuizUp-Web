import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, UserMinus, UserPlus, X } from 'lucide-react';
import {
  buscarLista,
  desvincularTurmaLista,
  vincularTurmasLista,
} from '../../entities/lista/api/listaApi';
import type { ListaQuestao } from '../../entities/lista/model/types';
import { listarTurmas } from '../../entities/turmas/api/turmaApi';
import type { Turma } from '../../entities/turmas/model/types';

type TipoFeedback = 'success' | 'error';

interface ModalGerenciarTurmasListaProps {
  isOpen: boolean;
  lista: ListaQuestao | null;
  onClose: () => void;
  onAfterChange: () => void;
  onFeedback: (message: string, type: TipoFeedback) => void;
}

export const ModalGerenciarTurmasLista = ({
  isOpen,
  lista,
  onClose,
  onAfterChange,
  onFeedback,
}: ModalGerenciarTurmasListaProps) => {
  const [listaDetalhe, setListaDetalhe] = useState<ListaQuestao | null>(lista);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [idEmOperacao, setIdEmOperacao] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    if (!lista) return;

    setIsLoading(true);
    try {
      const [listaAtualizada, turmasProfessor] = await Promise.all([
        buscarLista(lista.id),
        listarTurmas(),
      ]);

      setListaDetalhe(listaAtualizada);
      setTurmas(turmasProfessor);
    } catch (error) {
      console.error('Erro ao carregar turmas da lista', error);
      onFeedback('Nao foi possivel carregar as turmas da lista.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [lista, onFeedback]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarDados, isOpen]);

  const idsVinculados = useMemo(
    () => new Set((listaDetalhe?.turmas ?? []).map((turma) => turma.id)),
    [listaDetalhe],
  );

  const turmasVinculadas = useMemo(
    () => turmas.filter((turma) => idsVinculados.has(turma.id)),
    [idsVinculados, turmas],
  );

  const turmasDisponiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return turmas.filter((turma) => {
      if (idsVinculados.has(turma.id)) return false;
      if (statusFiltro && turma.status !== statusFiltro) return false;
      if (!termo) return true;

      return (
        turma.nome.toLowerCase().includes(termo) ||
        turma.codigo.toLowerCase().includes(termo) ||
        turma.descricao.toLowerCase().includes(termo)
      );
    });
  }, [busca, idsVinculados, statusFiltro, turmas]);

  if (!isOpen || !lista) return null;

  const handleVincularTurma = async (turmaId: string) => {
    setIdEmOperacao(turmaId);
    try {
      const listaAtualizada = await vincularTurmasLista(lista.id, [turmaId]);
      setListaDetalhe(listaAtualizada);
      onAfterChange();
      onFeedback('Turma vinculada com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao vincular turma', error);
      onFeedback('Nao foi possivel vincular a turma.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  const handleDesvincularTurma = async (turmaId: string) => {
    setIdEmOperacao(turmaId);
    try {
      const listaAtualizada = await desvincularTurmaLista(lista.id, turmaId);
      setListaDetalhe(listaAtualizada);
      onAfterChange();
      onFeedback('Turma desvinculada da lista.', 'success');
    } catch (error) {
      console.error('Erro ao desvincular turma', error);
      onFeedback('Nao foi possivel desvincular a turma.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-turmas-lista-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-turmas-lista-title" className="text-lg font-bold text-gray-900">
              Turmas da lista
            </h3>
            <p className="text-sm text-gray-500">
              {lista.nome} - {turmasVinculadas.length} turma(s) vinculada(s)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de turmas"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Vinculadas</h4>
              <span className="text-xs font-medium text-gray-500">
                {turmasVinculadas.length} turma(s)
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando turmas...
                </div>
              ) : turmasVinculadas.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma turma vinculada.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {turmasVinculadas.map((turma) => (
                    <li key={turma.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{turma.nome}</p>
                        <p className="truncate text-xs text-gray-500">
                          {turma.codigo} - {turma.ano}.{turma.semestre} - {turma.quantidadeAlunos} aluno(s)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleDesvincularTurma(turma.id)}
                        disabled={idEmOperacao === turma.id}
                        className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {idEmOperacao === turma.id ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Turmas disponiveis</h4>
              <span className="text-xs font-medium text-gray-500">
                {turmasDisponiveis.length} disponivel(is)
              </span>
            </div>

            <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                <Search size={18} className="text-gray-400" />
                <span className="sr-only">Buscar turma</span>
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por nome, codigo ou descricao"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </label>

              <select
                aria-label="Filtrar turmas por status"
                value={statusFiltro}
                onChange={(event) => setStatusFiltro(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Todos os status</option>
                <option value="ATIVA">Ativas</option>
                <option value="INATIVA">Encerradas</option>
              </select>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando turmas...
                </div>
              ) : turmasDisponiveis.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma turma disponivel para os filtros.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {turmasDisponiveis.map((turma) => (
                    <li key={turma.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{turma.nome}</p>
                        <p className="truncate text-xs text-gray-500">
                          {turma.codigo} - {turma.ano}.{turma.semestre} - {turma.quantidadeAlunos} aluno(s)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleVincularTurma(turma.id)}
                        disabled={idEmOperacao === turma.id}
                        className="flex shrink-0 items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                      >
                        {idEmOperacao === turma.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                        Vincular
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
