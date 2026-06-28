/**
 * Modal de gerenciamento das questoes de uma lista (visao do professor).
 *
 * Exibe dois paineis lado a lado: as questoes ja vinculadas a lista (com controles
 * de reordenacao e remocao) e o banco de questoes disponiveis (com busca e filtros
 * por tema/tipo). Cada acao sincroniza o estado local com o backend via listaApi.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import {
  buscarLista,
  desvincularQuestaoLista,
  reordenarQuestoesLista,
  vincularQuestoesLista,
} from '../../entities/lista/api/listaApi';
import type { ListaQuestao } from '../../entities/lista/model/types';
import { listProfessorQuestions } from '../manage-questions/model/questionService';
import type { ProfessorQuestion } from '../manage-questions/model/types';

// Tipo das mensagens de feedback enviadas ao componente pai (sucesso ou erro).
type TipoFeedback = 'success' | 'error';

interface ModalGerenciarQuestoesListaProps {
  isOpen: boolean;
  lista: ListaQuestao | null;
  onClose: () => void;
  onAfterChange: () => void;
  onFeedback: (message: string, type: TipoFeedback) => void;
}

/**
 * Normaliza o codigo de tipo da questao para um rotulo legivel em PT-BR.
 *
 * @param tipo Valor cru vindo do backend (varia entre formatos como "VF", "MULTIPLA").
 * @returns Texto amigavel ("Verdadeiro/Falso", "Múltipla escolha") ou o proprio valor.
 */
const formatarTipo = (tipo?: string) => {
  if (!tipo) return '';
  if (/verdadeiro|falso|certo_errado/i.test(tipo)) return 'Verdadeiro/Falso';
  if (/multipla|escolha|ltipla/i.test(tipo)) return 'Múltipla escolha';
  return tipo;
};

/**
 * Verifica se uma questao do banco satisfaz o filtro de tipo selecionado.
 *
 * @param tipoQuestao Tipo bruto da questao avaliada.
 * @param filtro Filtro ativo ('' = todos, 'MULTIPLA' = multipla escolha, demais = V/F).
 * @returns `true` quando a questao deve permanecer visivel na listagem.
 */
const correspondeAoTipo = (tipoQuestao: string, filtro: string) => {
  if (!filtro) return true;
  if (filtro === 'MULTIPLA') return /multipla|escolha|ltipla/i.test(tipoQuestao);
  return /verdadeiro|falso|certo_errado/i.test(tipoQuestao);
};

export const ModalGerenciarQuestoesLista = ({
  isOpen,
  lista,
  onClose,
  onAfterChange,
  onFeedback,
}: ModalGerenciarQuestoesListaProps) => {
  // Copia local da lista (com suas questoes) que vai sendo atualizada a cada operacao.
  const [listaDetalhe, setListaDetalhe] = useState<ListaQuestao | null>(lista);
  // Banco completo de questoes do professor, usado para montar o painel de disponiveis.
  const [questoes, setQuestoes] = useState<ProfessorQuestion[]>([]);
  // Termo de busca textual e filtros de tema/tipo do painel direito.
  const [busca, setBusca] = useState('');
  const [temaFiltro, setTemaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  // Estado de carregamento inicial e id da questao em operacao (trava botoes individuais).
  const [isLoading, setIsLoading] = useState(false);
  const [idEmOperacao, setIdEmOperacao] = useState<string | null>(null);

  /**
   * Carrega, em paralelo, a lista atualizada e o banco de questoes do professor.
   * Memoizado para servir de dependencia estavel do efeito de abertura do modal.
   */
  const carregarDados = useCallback(async () => {
    if (!lista) return;

    setIsLoading(true);
    try {
      const [listaAtualizada, questoesBanco] = await Promise.all([
        buscarLista(lista.id),
        listProfessorQuestions(),
      ]);

      setListaDetalhe(listaAtualizada);
      setQuestoes(questoesBanco);
    } catch (error) {
      console.error('Erro ao carregar questoes da lista', error);
      onFeedback('Não foi possivel carregar as questoes da lista.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [lista, onFeedback]);

  // Dispara a carga sempre que o modal abre; o setTimeout(0) adia para depois do paint.
  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarDados, isOpen]);

  // Conjunto de ids ja vinculados, usado para excluir essas questoes do banco disponivel.
  const idsVinculados = useMemo(
    () => new Set((listaDetalhe?.questoes ?? []).map((questao) => questao.id)),
    [listaDetalhe],
  );

  // Lista ordenada de temas distintos, alimentando o seletor de filtro por tema.
  const temas = useMemo(
    () => [...new Set(questoes.map((questao) => questao.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [questoes],
  );

  // Questoes do banco que sobram apos aplicar exclusao de vinculadas, filtros e busca textual.
  const questoesDisponiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return questoes.filter((questao) => {
      if (idsVinculados.has(questao.id)) return false;
      if (temaFiltro && questao.topic !== temaFiltro) return false;
      if (!correspondeAoTipo(questao.type, tipoFiltro)) return false;
      if (!termo) return true;

      return (
        questao.statement.toLowerCase().includes(termo) ||
        questao.topic.toLowerCase().includes(termo) ||
        questao.type.toLowerCase().includes(termo)
      );
    });
  }, [busca, idsVinculados, questoes, temaFiltro, tipoFiltro]);

  // Sem modal aberto ou sem lista alvo nao ha nada para renderizar.
  if (!isOpen || !lista) return null;

  const questoesVinculadas = listaDetalhe?.questoes ?? [];

  /**
   * Vincula uma questao do banco a lista atual e reflete o retorno no estado local.
   * @param questaoId Identificador da questao a adicionar.
   */
  const handleVincularQuestao = async (questaoId: string) => {
    setIdEmOperacao(questaoId);
    try {
      const listaAtualizada = await vincularQuestoesLista(lista.id, [questaoId]);
      setListaDetalhe(listaAtualizada);
      onAfterChange();
      onFeedback('Questao vinculada com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao vincular questao', error);
      onFeedback('Nao foi possivel vincular a questao.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  /**
   * Remove o vinculo de uma questao com a lista e atualiza o painel da esquerda.
   * @param questaoId Identificador da questao a remover.
   */
  const handleDesvincularQuestao = async (questaoId: string) => {
    setIdEmOperacao(questaoId);
    try {
      const listaAtualizada = await desvincularQuestaoLista(lista.id, questaoId);
      setListaDetalhe(listaAtualizada);
      onAfterChange();
      onFeedback('Questao removida da lista.', 'success');
    } catch (error) {
      console.error('Erro ao desvincular questao', error);
      onFeedback('Nao foi possivel remover a questao.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  /**
   * Move uma questao uma posicao para cima ou para baixo e persiste a nova ordem.
   * @param questaoId Identificador da questao a deslocar.
   * @param direcao -1 para subir, 1 para descer.
   */
  const handleMoverQuestao = async (questaoId: string, direcao: -1 | 1) => {
    // Calcula o indice destino e aborta se cairia fora dos limites da lista.
    const indiceAtual = questoesVinculadas.findIndex((questao) => questao.id === questaoId);
    const novoIndice = indiceAtual + direcao;
    if (indiceAtual < 0 || novoIndice < 0 || novoIndice >= questoesVinculadas.length) return;

    // Troca os dois itens de posicao numa copia antes de enviar ao backend.
    const novaOrdem = [...questoesVinculadas];
    [novaOrdem[indiceAtual], novaOrdem[novoIndice]] = [novaOrdem[novoIndice], novaOrdem[indiceAtual]];

    setIdEmOperacao(questaoId);
    try {
      const listaAtualizada = await reordenarQuestoesLista(lista.id, novaOrdem.map((questao) => questao.id));
      setListaDetalhe(listaAtualizada);
      onAfterChange();
      onFeedback('Ordem das questoes atualizada.', 'success');
    } catch (error) {
      console.error('Erro ao reordenar questoes', error);
      onFeedback('Nao foi possivel reordenar as questoes.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-questoes-lista-title"
        className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white p-6 shadow-xl"
      >
        {/* Cabecalho: titulo, contagem de selecionadas e botao de fechar. */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-questoes-lista-title" className="text-lg font-bold text-gray-900">
              Questões da lista
            </h3>
            <p className="text-sm text-gray-500">
              {lista.nome} - {questoesVinculadas.length} questao(oes) selecionada(s)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de questoes"
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo em duas colunas: questoes na lista (esquerda) e banco disponivel (direita). */}
        <div className="grid min-h-0 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Painel esquerdo: questoes ja vinculadas, com reordenacao e remocao. */}
          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Na lista</h4>
              <span className="text-xs font-medium text-gray-500">
                {questoesVinculadas.length} questao(oes)
              </span>
            </div>

            <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando questoes...
                </div>
              ) : questoesVinculadas.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma questao vinculada.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {questoesVinculadas.map((questao, index) => (
                    <li key={questao.id} className="flex items-start justify-between gap-3 p-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {index + 1}. {questao.enunciado}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 font-medium">
                          {[questao.tema, formatarTipo(questao.tipo), questao.dificuldade].filter(Boolean).join(' - ')}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          aria-label="Mover questao para cima"
                          onClick={() => void handleMoverQuestao(questao.id, -1)}
                          disabled={index === 0 || idEmOperacao === questao.id}
                          className="cursor-pointer rounded-md border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label="Mover questao para baixo"
                          onClick={() => void handleMoverQuestao(questao.id, 1)}
                          disabled={index === questoesVinculadas.length - 1 || idEmOperacao === questao.id}
                          className="cursor-pointer rounded-md border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label="Remover questao"
                          onClick={() => void handleDesvincularQuestao(questao.id)}
                          disabled={idEmOperacao === questao.id}
                          className="cursor-pointer rounded-md border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {idEmOperacao === questao.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Painel direito: banco de questoes disponiveis, com busca e filtros. */}
          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Banco de questões</h4>
              <span className="text-xs font-medium text-gray-500">
                {questoesDisponiveis.length} disponivel(is)
              </span>
            </div>

            {/* Barra de busca textual + seletores de tema e tipo. */}
            <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <label className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                <Search size={18} className="text-gray-400" />
                <span className="sr-only">Buscar questao</span>
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por enunciado ou tema"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </label>

              <select
                aria-label="Filtrar questoes por tema"
                value={temaFiltro}
                onChange={(event) => setTemaFiltro(event.target.value)}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 hover:bg-gray-50"
              >
                <option value="">Todos os temas</option>
                {temas.map((tema) => (
                  <option key={tema} value={tema}>{tema}</option>
                ))}
              </select>

              <select
                aria-label="Filtrar questoes por tipo"
                value={tipoFiltro}
                onChange={(event) => setTipoFiltro(event.target.value)}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 hover:bg-gray-50"
              >
                <option value="">Todos os tipos</option>
                <option value="MULTIPLA">Múltipla escolha</option>
                <option value="VF">Verdadeiro/Falso</option>
              </select>
            </div>

            <div className="max-h-[24rem] overflow-y-auto rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando banco...
                </div>
              ) : questoesDisponiveis.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma questao disponivel para os filtros.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {questoesDisponiveis.map((questao) => (
                    <li key={questao.id} className="flex items-start justify-between gap-3 p-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {questao.statement}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 font-medium">
                          {[questao.topic, questao.type, questao.difficulty].filter(Boolean).join(' - ')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleVincularQuestao(questao.id)}
                        disabled={idEmOperacao === questao.id}
                        className="cursor-pointer flex shrink-0 items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {idEmOperacao === questao.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Adicionar
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