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

type TipoFeedback = 'success' | 'error';

interface ModalGerenciarQuestoesListaProps {
  isOpen: boolean;
  lista: ListaQuestao | null;
  onClose: () => void;
  onAfterChange: () => void;
  onFeedback: (message: string, type: TipoFeedback) => void;
}

const formatarTipo = (tipo?: string) => {
  if (!tipo) return '';
  if (/verdadeiro|falso|certo_errado/i.test(tipo)) return 'Verdadeiro/Falso';
  if (/multipla|escolha|ltipla/i.test(tipo)) return 'Multipla escolha';
  return tipo;
};

const correspondeAoTipo = (tipoQuestao: string, filtro: string) => {
  if (!filtro) return true;
  if (filtro === 'MULTIPLA') return /multipla|escolha|ltipla/i.test(tipoQuestao);
  return /verdadeiro|falso/i.test(tipoQuestao);
};

export const ModalGerenciarQuestoesLista = ({
  isOpen,
  lista,
  onClose,
  onAfterChange,
  onFeedback,
}: ModalGerenciarQuestoesListaProps) => {
  const [listaDetalhe, setListaDetalhe] = useState<ListaQuestao | null>(lista);
  const [questoes, setQuestoes] = useState<ProfessorQuestion[]>([]);
  const [busca, setBusca] = useState('');
  const [temaFiltro, setTemaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [idEmOperacao, setIdEmOperacao] = useState<string | null>(null);

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
      onFeedback('Nao foi possivel carregar as questoes da lista.', 'error');
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
    () => new Set((listaDetalhe?.questoes ?? []).map((questao) => questao.id)),
    [listaDetalhe],
  );

  const temas = useMemo(
    () => [...new Set(questoes.map((questao) => questao.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [questoes],
  );

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

  if (!isOpen || !lista) return null;

  const questoesVinculadas = listaDetalhe?.questoes ?? [];

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

  const handleMoverQuestao = async (questaoId: string, direcao: -1 | 1) => {
    const indiceAtual = questoesVinculadas.findIndex((questao) => questao.id === questaoId);
    const novoIndice = indiceAtual + direcao;
    if (indiceAtual < 0 || novoIndice < 0 || novoIndice >= questoesVinculadas.length) return;

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
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-questoes-lista-title" className="text-lg font-bold text-gray-900">
              Questoes da lista
            </h3>
            <p className="text-sm text-gray-500">
              {lista.nome} - {questoesVinculadas.length} questao(oes) selecionada(s)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de questoes"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 gap-6 lg:grid-cols-[1fr_1fr]">
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
                    <li key={questao.id} className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {index + 1}. {questao.enunciado}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {[questao.tema, formatarTipo(questao.tipo), questao.dificuldade].filter(Boolean).join(' - ')}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          aria-label="Mover questao para cima"
                          onClick={() => void handleMoverQuestao(questao.id, -1)}
                          disabled={index === 0 || idEmOperacao === questao.id}
                          className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label="Mover questao para baixo"
                          onClick={() => void handleMoverQuestao(questao.id, 1)}
                          disabled={index === questoesVinculadas.length - 1 || idEmOperacao === questao.id}
                          className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          aria-label="Remover questao"
                          onClick={() => void handleDesvincularQuestao(questao.id)}
                          disabled={idEmOperacao === questao.id}
                          className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 disabled:opacity-50"
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

          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Banco de questoes</h4>
              <span className="text-xs font-medium text-gray-500">
                {questoesDisponiveis.length} disponivel(is)
              </span>
            </div>

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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Todos os tipos</option>
                <option value="MULTIPLA">Multipla escolha</option>
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
                    <li key={questao.id} className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {questao.statement}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {[questao.topic, questao.type, questao.difficulty].filter(Boolean).join(' - ')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleVincularQuestao(questao.id)}
                        disabled={idEmOperacao === questao.id}
                        className="flex shrink-0 items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-50"
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
