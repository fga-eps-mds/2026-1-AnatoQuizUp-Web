import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Edit, Plus, Search, Trash2, Users } from 'lucide-react';
import type { SalvarTurmaPayload, StatusTurma, Turma } from '../../../entities/turmas/model/types';
import {
  atualizarTurma,
  criarTurma,
  excluirTurma,
  listarTurmas,
} from '../../../entities/turmas/api/turmaApi';
import { ModalExcluirTurma } from './ModalExcluirTurma';
import { ModalGerenciarAlunos } from './ModalGerenciarAlunos';
import { ModalTurma } from './ModalTurma';

type ToastType = 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

const anosDisponiveis = () => {
  const anoAtual = new Date().getFullYear();
  return [anoAtual + 1, anoAtual, anoAtual - 1, anoAtual - 2];
};

export const ListaTurmas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [anoFiltro, setAnoFiltro] = useState('');
  const [semestreFiltro, setSemestreFiltro] = useState('');
  const [atualizarLista, setAtualizarLista] = useState(0);

  const [isModalExcluirOpen, setIsModalExcluirOpen] = useState(false);
  const [isModalTurmaOpen, setIsModalTurmaOpen] = useState(false);
  const [isModalAlunosOpen, setIsModalAlunosOpen] = useState(false);
  const [modoModalTurma, setModoModalTurma] = useState<'create' | 'edit'>('create');
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [turmaAlunos, setTurmaAlunos] = useState<Turma | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTurma, setIsSavingTurma] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const anos = useMemo(() => anosDisponiveis(), []);

  const mostrarToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const dados = await listarTurmas({
          busca: busca || undefined,
          status: statusFiltro ? (statusFiltro as StatusTurma) : undefined,
          ano: anoFiltro ? Number(anoFiltro) : undefined,
          semestre: semestreFiltro || undefined,
        });
        setTurmas(dados);
      } catch (error) {
        console.error('Erro ao carregar turmas', error);
        mostrarToast('Nao foi possivel carregar as turmas.', 'error');
      }
    };

    void fetchTurmas();
  }, [anoFiltro, atualizarLista, busca, mostrarToast, semestreFiltro, statusFiltro]);

  const atualizarTurmas = () => {
    setAtualizarLista((prev) => prev + 1);
  };

  const handleAbrirModalExcluir = (turma: Turma) => {
    setTurmaSelecionada(turma);
    setIsModalExcluirOpen(true);
  };

  const handleAbrirModalCriar = () => {
    setModoModalTurma('create');
    setTurmaSelecionada(null);
    setIsModalTurmaOpen(true);
  };

  const handleAbrirModalEditar = (turma: Turma) => {
    setModoModalTurma('edit');
    setTurmaSelecionada(turma);
    setIsModalTurmaOpen(true);
  };

  const handleAbrirModalAlunos = (turma: Turma) => {
    setTurmaAlunos(turma);
    setIsModalAlunosOpen(true);
  };

  const handleFecharModalTurma = () => {
    setIsModalTurmaOpen(false);
    setTurmaSelecionada(null);
  };

  const handleSalvarTurma = async (payload: SalvarTurmaPayload) => {
    setIsSavingTurma(true);

    try {
      if (modoModalTurma === 'create') {
        await criarTurma(payload);
        mostrarToast('Turma criada com sucesso.');
      } else if (turmaSelecionada) {
        await atualizarTurma(turmaSelecionada.id, payload);
        mostrarToast('Turma atualizada com sucesso.');
      }

      handleFecharModalTurma();
      atualizarTurmas();
    } catch (error) {
      console.error('Erro ao salvar turma', error);
      mostrarToast('Nao foi possivel salvar a turma.', 'error');
    } finally {
      setIsSavingTurma(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!turmaSelecionada) return;

    setIsDeleting(true);

    try {
      await excluirTurma(turmaSelecionada.id);
      setIsModalExcluirOpen(false);
      setTurmaSelecionada(null);
      mostrarToast('Turma excluida com sucesso.');
      atualizarTurmas();
    } catch (error) {
      console.error('Erro ao excluir turma', error);
      mostrarToast('Nao foi possivel excluir a turma.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
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

      <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Suas turmas</h2>
          <p className="text-sm text-gray-500">{turmas.length} turmas cadastradas</p>
        </div>

        <button
          onClick={handleAbrirModalCriar}
          className="flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-500"
        >
          <Plus size={18} />
          Nova Turma
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar turma"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select
          aria-label="Filtrar por ano"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          value={anoFiltro}
          onChange={(e) => setAnoFiltro(e.target.value)}
        >
          <option value="">Todos os anos</option>
          {anos.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por semestre"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          value={semestreFiltro}
          onChange={(e) => setSemestreFiltro(e.target.value)}
        >
          <option value="">Todos os semestres</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>

        <select
          aria-label="Filtrar por status"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="ATIVA">Ativa</option>
          <option value="INATIVA">Encerrada</option>
        </select>

        <span className="text-sm text-gray-500">{turmas.length} resultado(s)</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">Turma</th>
              <th className="px-6 py-4">Semestre</th>
              <th className="px-6 py-4">Descricao</th>
              <th className="px-6 py-4">Alunos</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Criada em</th>
              <th className="px-6 py-4">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {turmas.map((turma) => (
              <tr key={turma.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">{turma.nome}</td>
                <td className="px-6 py-4">{turma.ano}.{turma.semestre}</td>
                <td className="px-6 py-4">{turma.descricao}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 font-medium text-gray-900">
                    <Users size={16} className="text-gray-400" />
                    {turma.quantidadeAlunos}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    turma.status === 'ATIVA'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${turma.status === 'ATIVA' ? 'bg-teal-600' : 'bg-amber-600'}`} />
                    {turma.status === 'ATIVA' ? 'Ativa' : 'Encerrada'}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(turma.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAbrirModalAlunos(turma)}
                      className="flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                    >
                      <Users size={14} />
                      Alunos
                    </button>
                    <button
                      onClick={() => handleAbrirModalEditar(turma)}
                      className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleAbrirModalExcluir(turma)}
                      className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {turmas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma turma encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalTurma
        key={`${modoModalTurma}-${turmaSelecionada?.id ?? 'nova'}-${isModalTurmaOpen ? 'open' : 'closed'}`}
        isOpen={isModalTurmaOpen}
        mode={modoModalTurma}
        turma={turmaSelecionada}
        isLoading={isSavingTurma}
        onClose={handleFecharModalTurma}
        onSubmit={handleSalvarTurma}
      />

      <ModalGerenciarAlunos
        key={`${turmaAlunos?.id ?? 'sem-turma'}-${isModalAlunosOpen ? 'open' : 'closed'}`}
        isOpen={isModalAlunosOpen}
        turma={turmaAlunos}
        onClose={() => setIsModalAlunosOpen(false)}
        onAfterChange={atualizarTurmas}
        onFeedback={mostrarToast}
      />

      <ModalExcluirTurma
        isOpen={isModalExcluirOpen}
        onClose={() => setIsModalExcluirOpen(false)}
        onConfirm={handleConfirmarExclusao}
        turma={turmaSelecionada}
        isLoading={isDeleting}
      />
    </div>
  );
};
