import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Edit,
  FileText,
  HelpCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { ListaQuestao, StatusLista } from '../../entities/lista/model/types';
import {
  atualizarLista,
  criarLista,
  excluirLista,
  listarListas,
  baixarPdfLista,
} from '../../entities/lista/api/listaApi';
import { ModalExcluirLista } from './ModalExcluirLista';
import { ModalGerenciarQuestoesLista } from './ModalGerenciarQuestoesLista';
import { ModalLista } from './ModalLista';

type TipoToast = 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  type: TipoToast;
}

const statusLabel: Record<StatusLista, string> = {
  RASCUNHO: 'Rascunho',
  PUBLICADA: 'Publicada',
};

export const ListarListas = () => {
  const [listas, setListas] = useState<ListaQuestao[]>([]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [isModalListaOpen, setIsModalListaOpen] = useState(false);
  const [modoModalLista, setModoModalLista] = useState<'create' | 'edit'>('create');
  const [listaSelecionada, setListaSelecionada] = useState<ListaQuestao | null>(null);
  const [listaParaQuestoes, setListaParaQuestoes] = useState<ListaQuestao | null>(null);
  const [listaParaExcluir, setListaParaExcluir] = useState<ListaQuestao | null>(null);
  const [isSavingLista, setIsSavingLista] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mostrarToast = useCallback((message: string, type: TipoToast = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });

    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  const solicitarAtualizacao = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const carregarListas = useCallback(async () => {
    setIsLoading(true);
    try {
      const dados = await listarListas({
        busca: busca.trim() || undefined,
        status: statusFiltro ? (statusFiltro as StatusLista) : undefined,
      });
      setListas(dados);
    } catch (error) {
      console.error('Erro ao buscar listas', error);
      mostrarToast('Nao foi possivel carregar as listas.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [busca, mostrarToast, statusFiltro]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarListas();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarListas, refreshKey]);

  const handleAbrirCriacao = () => {
    setModoModalLista('create');
    setListaSelecionada(null);
    setIsModalListaOpen(true);
  };

  const handleAbrirEdicao = (lista: ListaQuestao) => {
    setModoModalLista('edit');
    setListaSelecionada(lista);
    setIsModalListaOpen(true);
  };

  const handleFecharModalLista = () => {
    if (isSavingLista) return;
    setIsModalListaOpen(false);
    setListaSelecionada(null);
  };

  const handleSalvarLista = async (nome: string) => {
    setIsSavingLista(true);
    try {
      if (modoModalLista === 'create') {
        await criarLista({ nome });
        mostrarToast('Lista criada com sucesso.');
      } else if (listaSelecionada) {
        await atualizarLista(listaSelecionada.id, { nome });
        mostrarToast('Lista atualizada com sucesso.');
      }

      setIsModalListaOpen(false);
      setListaSelecionada(null);
      solicitarAtualizacao();
    } catch (error) {
      console.error('Erro ao salvar lista', error);
      mostrarToast('Nao foi possivel salvar a lista.', 'error');
    } finally {
      setIsSavingLista(false);
    }
  };

  const handleExcluir = async (id: string) => {
    setIsDeleting(true);
    try {
      await excluirLista(id);
      setListaParaExcluir(null);
      mostrarToast('Lista excluida com sucesso.');
      solicitarAtualizacao();
    } catch (error) {
      console.error('Erro ao excluir lista', error);
      mostrarToast('Nao foi possivel excluir a lista.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBaixarPdf = async (listaId: string, nomeLista: string) => {
    try {
      mostrarToast('Gerando PDF...', 'success'); 

      const base64Data = await baixarPdfLista(listaId);
      
      const pdfUrl = `data:application/pdf;base64,${base64Data}`;
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${nomeLista.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      mostrarToast('PDF baixado com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      mostrarToast('Erro ao gerar o PDF da lista.', 'error');
    }
  };

  const totalListas = listas.length;

  return (
    <>
      {toast && (
        <div
          role="status"
          className={`mb-4 flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
            toast.type === 'success'
              ? 'border-teal-400 bg-teal-50 text-teal-800'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="mb-6 flex flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Suas listas</h2>
          <p className="mt-1 text-sm text-gray-500">
            {totalListas} lista(s) encontrada(s)
          </p>
        </div>
        <button
          type="button"
          onClick={handleAbrirCriacao}
          className="mt-4 flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-bold text-teal-950 transition-colors hover:bg-teal-500 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          Nova lista
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <span className="sr-only">Buscar lista</span>
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar lista"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </label>

        <select
          value={statusFiltro}
          onChange={(event) => setStatusFiltro(event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          aria-label="Filtrar listas por status"
        >
          <option value="">Todos os status</option>
          <option value="RASCUNHO">Rascunho</option>
          <option value="PUBLICADA">Publicada</option>
        </select>

        <span className="text-sm text-gray-500">{totalListas} resultado(s)</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Lista</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Questoes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Turmas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Criada em</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Carregando listas...
                  </td>
                </tr>
              ) : listas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Nenhuma lista encontrada.
                  </td>
                </tr>
              ) : (
                listas.map((lista) => (
                  <tr key={lista.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <ClipboardList className="h-4 w-4 text-teal-600" />
                        {lista.nome}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <button
                        type="button"
                        onClick={() => setListaParaQuestoes(lista)}
                        className="flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        {lista.quantidadeQuestoes} questao(oes)
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {lista.turmas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {lista.turmas.slice(0, 3).map((turma) => (
                            <span
                              key={turma.id}
                              className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                            >
                              {turma.nome}
                            </span>
                          ))}
                          {lista.turmas.length > 3 && (
                            <span className="text-xs font-medium text-gray-500">
                              +{lista.turmas.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm italic text-gray-400">Nenhuma turma</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                          lista.status === 'PUBLICADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel[lista.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{lista.criadoEm}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleBaixarPdf(lista.id, lista.nome)}
                          title="Geracao de PDF pendente no servico"
                          className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAbrirEdicao(lista)}
                          className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setListaParaExcluir(lista)}
                          className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalLista
        key={`${modoModalLista}-${listaSelecionada?.id ?? 'nova'}-${isModalListaOpen ? 'open' : 'closed'}`}
        isOpen={isModalListaOpen}
        mode={modoModalLista}
        lista={listaSelecionada}
        isLoading={isSavingLista}
        onClose={handleFecharModalLista}
        onSubmit={handleSalvarLista}
      />

      <ModalGerenciarQuestoesLista
        isOpen={!!listaParaQuestoes}
        lista={listaParaQuestoes}
        onClose={() => setListaParaQuestoes(null)}
        onAfterChange={solicitarAtualizacao}
        onFeedback={mostrarToast}
      />

      <ModalExcluirLista
        isOpen={!!listaParaExcluir}
        lista={listaParaExcluir}
        onClose={() => setListaParaExcluir(null)}
        onConfirm={handleExcluir}
        isLoading={isDeleting}
      />
    </>
  );
};
