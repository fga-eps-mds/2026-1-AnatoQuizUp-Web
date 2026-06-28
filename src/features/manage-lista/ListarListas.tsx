// Tela de gerenciamento de listas de questoes do professor. Lista as listas em
// uma tabela com busca e filtro por status, e oferece criar, editar, excluir,
// baixar PDF e gerenciar as questoes de cada lista atraves de modais.
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

// Tipo da notificacao (toast): sucesso ou erro.
type TipoToast = 'success' | 'error';

// Estado do toast exibido; o id evita que um timeout antigo apague um toast novo.
interface ToastState {
  id: number;
  message: string;
  type: TipoToast;
}

// Rotulos amigaveis (pt-BR) para cada status de lista.
const statusLabel: Record<StatusLista, string> = {
  RASCUNHO: 'Rascunho',
  PUBLICADA: 'Publicada',
};

/**
 * Componente da tela de listas. Centraliza o estado dos dados, dos filtros e dos
 * quatro modais (criar/editar, gerenciar questoes e excluir).
 */
export const ListarListas = () => {
  // Dados, filtros de busca/status e flags de carregamento/refresh.
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

  /**
   * Exibe um toast e o remove automaticamente apos 4s (sem apagar um toast mais novo).
   * @param message texto a exibir
   * @param type estilo do toast (sucesso/erro)
   */
  const mostrarToast = useCallback((message: string, type: TipoToast = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });

    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  // Incrementa a chave de refresh para forcar uma nova busca das listas.
  const solicitarAtualizacao = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  // Busca as listas aplicando os filtros atuais de busca e status.
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
      mostrarToast('Não foi possível carregar as listas.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [busca, mostrarToast, statusFiltro]);

  // Recarrega ao mudar filtros (carregarListas muda) ou ao pedir refresh.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarListas();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarListas, refreshKey]);

  // Abre o modal em modo de criacao (sem lista selecionada).
  const handleAbrirCriacao = () => {
    setModoModalLista('create');
    setListaSelecionada(null);
    setIsModalListaOpen(true);
  };

  // Abre o modal em modo de edicao com a lista escolhida.
  const handleAbrirEdicao = (lista: ListaQuestao) => {
    setModoModalLista('edit');
    setListaSelecionada(lista);
    setIsModalListaOpen(true);
  };

  // Fecha o modal de criar/editar, exceto enquanto salva.
  const handleFecharModalLista = () => {
    if (isSavingLista) return;
    setIsModalListaOpen(false);
    setListaSelecionada(null);
  };

  /**
   * Cria ou atualiza uma lista conforme o modo do modal e recarrega a tabela.
   * @param nome nome informado para a lista
   */
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
      mostrarToast('Não foi possível salvar a lista.', 'error');
    } finally {
      setIsSavingLista(false);
    }
  };

  /**
   * Exclui uma lista, fecha o modal de confirmacao e recarrega a tabela.
   * @param id id da lista a excluir
   */
  const handleExcluir = async (id: string) => {
    setIsDeleting(true);
    try {
      await excluirLista(id);
      setListaParaExcluir(null);
      mostrarToast('Lista excluída com sucesso.');
      solicitarAtualizacao();
    } catch (error) {
      console.error('Erro ao excluir lista', error);
      mostrarToast('Não foi possível excluir a lista.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Baixa o PDF da lista: pede o conteudo em base64 ao backend, monta uma URL
   * de dados e dispara o download via um link temporario.
   * @param listaId id da lista
   * @param nomeLista nome usado no arquivo gerado
   */
  const handleBaixarPdf = async (listaId: string, nomeLista: string) => {
    try {
      mostrarToast('Gerando PDF...', 'success');

      const base64Data = await baixarPdfLista(listaId);

      // Converte o base64 em URL de dados e simula o clique num link de download.
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
          className={`mb-4 flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold rounded-lg shadow-sm ${
            toast.type === 'success'
              ? 'border-teal-400 bg-teal-50 text-teal-800'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl mb-5 shadow-sm">
        <div className="px-5 py-[18px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[16px] font-extrabold text-gray-900">Suas listas</div>
            <div className="text-[13px] text-gray-500 mt-[2px]">
              {totalListas} lista(s) encontrada(s)
            </div>
          </div>
          <button
            type="button"
            onClick={handleAbrirCriacao}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-[13px] font-extrabold text-white transition-colors hover:bg-teal-600 shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            Nova lista
          </button>
        </div>
      </div>

      {/* Barra de filtros: busca textual + filtro por status da lista. */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-6">
        <label className="flex-1 w-full relative flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2.5">
          <Search size={17} className="text-gray-400" />
          <span className="sr-only">Buscar lista</span>
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar lista"
            className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-gray-900 placeholder-gray-400"
          />
        </label>

        <select
          value={statusFiltro}
          onChange={(event) => setStatusFiltro(event.target.value)}
          className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-bold text-gray-600 outline-none transition-all focus:border-teal-500 hover:bg-gray-50"
          aria-label="Filtrar listas por status"
        >
          <option value="">Todos os status</option>
          <option value="RASCUNHO">Rascunho</option>
          <option value="PUBLICADA">Publicada</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-5 py-[10px] text-left text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-gray-400">Lista</th>
                <th className="px-3 py-[10px] text-left text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-gray-400">Questões</th>
                <th className="px-3 py-[10px] text-left text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-gray-400">Temas / Turmas</th>
                <th className="px-3 py-[10px] text-left text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-gray-400">Status</th>
                <th className="px-3 py-[10px] text-left text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-gray-400">Criada em</th>
                <th className="px-3 py-[10px] text-left text-[10.5px] font-extrabold uppercase tracking-[0.6px] text-gray-400">Ações</th>
              </tr>
            </thead>
            {/* Corpo da tabela: estados de carregando, vazio ou as linhas das listas. */}
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                    Carregando listas...
                  </td>
                </tr>
              ) : listas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500">
                    Nenhuma lista encontrada.
                  </td>
                </tr>
              ) : (
                listas.map((lista, idx) => (
                  <tr key={lista.id} className={`hover:bg-gray-50 transition-colors ${idx !== listas.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    
                    <td className="px-5 py-[13px]">
                      <div className="flex items-center gap-[8px] font-extrabold text-[13.5px] text-gray-900">
                        <ClipboardList size={16} strokeWidth={2.5} className="text-teal-600 shrink-0" />
                        <span className="truncate max-w-[200px]" title={lista.nome}>{lista.nome}</span>
                      </div>
                    </td>

                    <td className="px-3 py-[13px]">
                      <button
                        type="button"
                        onClick={() => setListaParaQuestoes(lista)}
                        className="cursor-pointer inline-flex items-center gap-1.5 rounded-[5px] bg-teal-50 px-[9px] py-[3px] text-[10.5px] font-bold text-teal-700 transition-colors hover:bg-teal-100"
                      >
                        <HelpCircle size={13} />
                        {lista.quantidadeQuestoes} questões
                      </button>
                    </td>

                    {/* Coluna de turmas: mostra ate 2 nomes e agrega o excedente em "+N". */}
                    <td className="px-3 py-[13px]">
                      {lista.turmas.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {lista.turmas.slice(0, 2).map((turma) => (
                            <span
                              key={turma.id}
                              className="inline-block rounded-[5px] bg-blue-50 px-[9px] py-[3px] text-[10.5px] font-bold text-blue-700"
                            >
                              {turma.nome}
                            </span>
                          ))}
                          {lista.turmas.length > 2 && (
                            <span className="inline-block rounded-[5px] bg-gray-100 px-[9px] py-[3px] text-[10.5px] font-bold text-gray-600">
                              +{lista.turmas.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block rounded-[5px] bg-gray-100 px-[9px] py-[3px] text-[10.5px] font-bold text-gray-500">Sem turma</span>
                      )}
                    </td>

                    <td className="px-3 py-[13px]">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[5px] px-[9px] py-[3px] text-[10.5px] font-bold ${
                          lista.status === 'PUBLICADA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="h-[6px] w-[6px] rounded-full bg-current" />
                        {statusLabel[lista.status]}
                      </span>
                    </td>

                    <td className="px-3 py-[13px] text-[11.5px] text-gray-400 font-medium">
                      {lista.criadoEm}
                    </td>

                    <td className="px-3 py-[13px]">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleBaixarPdf(lista.id, lista.nome)}
                          title="Baixar PDF da Lista"
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg border-[1.5px] border-blue-200 bg-blue-50 px-3 py-[7px] text-[12px] font-extrabold text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          <FileText size={14} strokeWidth={2.5} />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAbrirEdicao(lista)}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg border-[1.5px] border-indigo-200 bg-indigo-50 px-3 py-[7px] text-[12px] font-extrabold text-indigo-700 transition-colors hover:bg-indigo-100"
                        >
                          <Edit size={14} strokeWidth={2.5} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setListaParaExcluir(lista)}
                          className="cursor-pointer flex items-center gap-1.5 rounded-lg border-[1.5px] border-red-200 bg-red-50 px-3 py-[7px] text-[12px] font-extrabold text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
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

      {/* Modais */}
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