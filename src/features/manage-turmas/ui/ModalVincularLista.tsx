// Modal usado pelo professor para gerenciar quais listas de questoes estao
// publicadas em uma turma. Permite vincular novas listas, ajustar prazo e
// liberacao de gabarito de cada vinculo, e desvincular listas existentes.
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Link2,
  Loader2,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  atualizarVinculoListaTurma,
  desvincularTurmaLista,
  listarListas,
  listarVinculosDaTurma,
  vincularListaTurma,
} from '../../../entities/lista/api/listaApi';
import type {
  ListaQuestao,
  VinculoListaTurma,
} from '../../../entities/lista/model/types';
import type { Turma } from '../../../entities/turmas/model/types';

// Tipo da notificacao devolvida ao componente pai (sucesso ou erro).
type TipoFeedback = 'success' | 'error';

// Propriedades do modal: controle de abertura, turma alvo e callbacks de saida.
interface ModalVincularListaProps {
  isOpen: boolean;
  turma: Turma | null;
  onClose: () => void;
  onAfterChange: () => void;
  onFeedback: (message: string, type: TipoFeedback) => void;
}

// Estado editavel (rascunho) de um vinculo: prazo e se o gabarito esta liberado.
interface RascunhoVinculo {
  prazo: string;
  gabaritoLiberado: boolean;
}

// Rascunho padrao para uma lista ainda nao configurada (sem prazo, gabarito fechado).
const criarRascunhoVazio = (): RascunhoVinculo => ({
  prazo: '',
  gabaritoLiberado: false,
});

/**
 * Converte uma data ISO vinda da API para o formato aceito por um input
 * `datetime-local` (AAAA-MM-DDTHH:MM). Retorna string vazia se invalida.
 * @param data data em formato ISO ou nula
 */
const isoParaInputDataHora = (data?: string | null) => {
  if (!data) return '';

  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime())) return '';

  return dataConvertida.toISOString().slice(0, 16);
};

/**
 * Caminho inverso de {@link isoParaInputDataHora}: converte o valor do input
 * `datetime-local` de volta para ISO, ou `null` quando vazio/invalido.
 * @param data valor do input datetime-local
 */
const inputDataHoraParaApi = (data: string) => {
  if (!data) return null;

  const dataConvertida = new Date(data);
  if (Number.isNaN(dataConvertida.getTime())) return null;

  return dataConvertida.toISOString();
};

/**
 * Formata o prazo para exibicao em pt-BR (data e hora). Mostra "Sem prazo"
 * quando nao ha data e devolve o valor original se nao for uma data valida.
 * @param prazo prazo em ISO ou nulo
 */
const formatarPrazo = (prazo: string | null) => {
  if (!prazo) return 'Sem prazo';

  const data = new Date(prazo);
  if (Number.isNaN(data.getTime())) return prazo;

  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ModalVincularLista = ({
  isOpen,
  turma,
  onClose,
  onAfterChange,
  onFeedback,
}: ModalVincularListaProps) => {
  const [listas, setListas] = useState<ListaQuestao[]>([]);
  const [vinculos, setVinculos] = useState<VinculoListaTurma[]>([]);
  const [rascunhosNovos, setRascunhosNovos] = useState<Record<string, RascunhoVinculo>>({});
  const [rascunhosVinculos, setRascunhosVinculos] = useState<Record<string, RascunhoVinculo>>({});
  const [busca, setBusca] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [idEmOperacao, setIdEmOperacao] = useState<string | null>(null);

  // Carrega as listas do professor e os vinculos da turma; preenche os rascunhos
  // com os valores atuais de cada vinculo (prazo e gabarito).
  const carregarDados = useCallback(async () => {
    if (!turma) return;

    setIsLoading(true);
    try {
      const [listasProfessor, vinculosTurma] = await Promise.all([
        listarListas(),
        listarVinculosDaTurma(turma.id),
      ]);

      setListas(listasProfessor);
      setVinculos(vinculosTurma);
      setRascunhosVinculos(
        Object.fromEntries(
          vinculosTurma.map((vinculo) => [
            vinculo.listaQuestaoId,
            {
              prazo: isoParaInputDataHora(vinculo.prazo),
              gabaritoLiberado: vinculo.gabaritoLiberado,
            },
          ]),
        ),
      );
    } catch (error) {
      console.error('Erro ao carregar listas da turma', error);
      onFeedback('Nao foi possivel carregar as listas da turma.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onFeedback, turma]);

  // Recarrega os dados sempre que o modal e aberto (timeout 0 adia para apos o paint).
  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      void carregarDados();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarDados, isOpen]);

  // Conjunto de ids ja vinculados, usado para excluir essas listas das disponiveis.
  const idsListasVinculadas = useMemo(
    () => new Set(vinculos.map((vinculo) => vinculo.listaQuestaoId)),
    [vinculos],
  );

  // Listas que ainda podem ser vinculadas: remove as ja vinculadas e aplica a busca por nome.
  const listasDisponiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return listas.filter((lista) => {
      if (idsListasVinculadas.has(lista.id)) return false;
      if (!termo) return true;

      return lista.nome.toLowerCase().includes(termo);
    });
  }, [busca, idsListasVinculadas, listas]);

  // Sem turma ou com modal fechado, nao renderiza nada.
  if (!isOpen || !turma) return null;

  // Rascunho de uma lista ainda nao vinculada (cria um vazio se nao existir).
  const obterRascunhoNovo = (listaId: string) => rascunhosNovos[listaId] ?? criarRascunhoVazio();

  // Aplica um patch parcial ao rascunho de uma lista disponivel (a vincular).
  const atualizarRascunhoNovo = (listaId: string, patch: Partial<RascunhoVinculo>) => {
    setRascunhosNovos((atual) => ({
      ...atual,
      [listaId]: {
        ...criarRascunhoVazio(),
        ...atual[listaId],
        ...patch,
      },
    }));
  };

  // Aplica um patch parcial ao rascunho de um vinculo ja existente.
  const atualizarRascunhoVinculo = (listaId: string, patch: Partial<RascunhoVinculo>) => {
    setRascunhosVinculos((atual) => ({
      ...atual,
      [listaId]: {
        ...criarRascunhoVazio(),
        ...atual[listaId],
        ...patch,
      },
    }));
  };

  /**
   * Vincula uma lista a turma usando o rascunho atual (prazo + gabarito).
   * Em sucesso, move a lista para os vinculados e limpa seu rascunho de "novo".
   * @param lista lista que sera vinculada
   */
  const handleVincularLista = async (lista: ListaQuestao) => {
    const rascunho = obterRascunhoNovo(lista.id);

    setIdEmOperacao(`vincular-${lista.id}`);
    try {
      const vinculo = await vincularListaTurma(lista.id, turma.id, {
        prazo: inputDataHoraParaApi(rascunho.prazo),
        gabaritoLiberado: rascunho.gabaritoLiberado,
      });

      setVinculos((atuais) => [vinculo, ...atuais]);
      setRascunhosVinculos((atuais) => ({
        ...atuais,
        [vinculo.listaQuestaoId]: {
          prazo: isoParaInputDataHora(vinculo.prazo),
          gabaritoLiberado: vinculo.gabaritoLiberado,
        },
      }));
      setRascunhosNovos((atuais) => {
        const restante = { ...atuais };
        delete restante[lista.id];
        return restante;
      });
      onAfterChange();
      onFeedback('Lista vinculada com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao vincular lista a turma', error);
      onFeedback('Nao foi possivel vincular a lista.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  /**
   * Salva as alteracoes de prazo/gabarito de um vinculo ja publicado.
   * @param vinculo vinculo lista-turma a atualizar
   */
  const handleAtualizarVinculo = async (vinculo: VinculoListaTurma) => {
    const rascunho = rascunhosVinculos[vinculo.listaQuestaoId] ?? {
      prazo: isoParaInputDataHora(vinculo.prazo),
      gabaritoLiberado: vinculo.gabaritoLiberado,
    };

    setIdEmOperacao(`atualizar-${vinculo.id}`);
    try {
      const vinculoAtualizado = await atualizarVinculoListaTurma(
        vinculo.listaQuestaoId,
        turma.id,
        {
          prazo: inputDataHoraParaApi(rascunho.prazo),
          gabaritoLiberado: rascunho.gabaritoLiberado,
        },
      );

      setVinculos((atuais) =>
        atuais.map((item) => (item.id === vinculoAtualizado.id ? vinculoAtualizado : item)),
      );
      setRascunhosVinculos((atuais) => ({
        ...atuais,
        [vinculoAtualizado.listaQuestaoId]: {
          prazo: isoParaInputDataHora(vinculoAtualizado.prazo),
          gabaritoLiberado: vinculoAtualizado.gabaritoLiberado,
        },
      }));
      onAfterChange();
      onFeedback('Vinculo atualizado com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao atualizar vinculo lista-turma', error);
      onFeedback('Nao foi possivel atualizar o vinculo.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  /**
   * Remove o vinculo entre a lista e a turma, tirando-a das publicadas.
   * @param vinculo vinculo a ser desfeito
   */
  const handleDesvincularLista = async (vinculo: VinculoListaTurma) => {
    setIdEmOperacao(`remover-${vinculo.id}`);
    try {
      await desvincularTurmaLista(vinculo.listaQuestaoId, turma.id);

      setVinculos((atuais) => atuais.filter((item) => item.id !== vinculo.id));
      setRascunhosVinculos((atuais) => {
        const restante = { ...atuais };
        delete restante[vinculo.listaQuestaoId];
        return restante;
      });
      onAfterChange();
      onFeedback('Lista desvinculada da turma.', 'success');
    } catch (error) {
      console.error('Erro ao desvincular lista da turma', error);
      onFeedback('Nao foi possivel desvincular a lista.', 'error');
    } finally {
      setIdEmOperacao(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-vincular-lista-title"
        className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-vincular-lista-title" className="text-lg font-bold text-gray-900">
              Vincular lista
            </h3>
            <p className="text-sm text-gray-500">
              {turma.nome} - {vinculos.length} lista(s) publicada(s)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de vincular lista"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Layout em duas colunas: a esquerda, listas ja vinculadas; a direita, disponiveis. */}
        <div className="grid min-h-0 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Coluna esquerda: listas publicadas na turma, com edicao de prazo/gabarito. */}
          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Listas vinculadas</h4>
              <span className="text-xs font-medium text-gray-500">
                {vinculos.length} publicacao(oes)
              </span>
            </div>

            <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando listas...
                </div>
              ) : vinculos.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma lista publicada nesta turma.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {vinculos.map((vinculo) => {
                    const rascunho = rascunhosVinculos[vinculo.listaQuestaoId] ?? {
                      prazo: isoParaInputDataHora(vinculo.prazo),
                      gabaritoLiberado: vinculo.gabaritoLiberado,
                    };

                    return (
                      <li key={vinculo.id} className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 truncate text-sm font-semibold text-gray-900">
                              <ClipboardList size={16} className="shrink-0 text-teal-600" />
                              {vinculo.nome}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {vinculo.quantidadeQuestoes} questao(oes) - {formatarPrazo(vinculo.prazo)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => void handleDesvincularLista(vinculo)}
                            disabled={idEmOperacao === `remover-${vinculo.id}`}
                            className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            {idEmOperacao === `remover-${vinculo.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Remover
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                          <label className="text-xs font-semibold text-gray-600">
                            Prazo
                            <input
                              type="datetime-local"
                              value={rascunho.prazo}
                              onChange={(event) =>
                                atualizarRascunhoVinculo(vinculo.listaQuestaoId, {
                                  prazo: event.target.value,
                                })
                              }
                              aria-label={`Prazo para ${vinculo.nome}`}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                          </label>

                          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
                            <input
                              type="checkbox"
                              checked={rascunho.gabaritoLiberado}
                              onChange={(event) =>
                                atualizarRascunhoVinculo(vinculo.listaQuestaoId, {
                                  gabaritoLiberado: event.target.checked,
                                })
                              }
                              className="h-4 w-4 accent-teal-500"
                            />
                            Gabarito liberado
                          </label>

                          <button
                            type="button"
                            onClick={() => void handleAtualizarVinculo(vinculo)}
                            disabled={idEmOperacao === `atualizar-${vinculo.id}`}
                            className="flex items-center justify-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                          >
                            {idEmOperacao === `atualizar-${vinculo.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                            Salvar configuracao
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Coluna direita: listas ainda nao vinculadas, com busca e acao de vincular. */}
          <section className="min-h-0">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900">Listas disponiveis</h4>
              <span className="text-xs font-medium text-gray-500">
                {listasDisponiveis.length} disponivel(is)
              </span>
            </div>

            <label className="mb-3 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
              <Search size={18} className="text-gray-400" />
              <span className="sr-only">Buscar lista</span>
              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome da lista"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </label>

            <div className="max-h-[25rem] overflow-y-auto rounded-lg border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  Carregando listas...
                </div>
              ) : listasDisponiveis.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhuma lista disponivel para vincular.
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {listasDisponiveis.map((lista) => {
                    const rascunho = obterRascunhoNovo(lista.id);

                    return (
                      <li key={lista.id} className="space-y-3 p-4">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <ClipboardList size={16} className="text-teal-600" />
                            {lista.nome}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {lista.quantidadeQuestoes} questao(oes)
                          </p>
                        </div>

                        <label className="block text-xs font-semibold text-gray-600">
                          Prazo
                          <input
                            type="datetime-local"
                            value={rascunho.prazo}
                            onChange={(event) =>
                              atualizarRascunhoNovo(lista.id, { prazo: event.target.value })
                            }
                            aria-label={`Prazo para ${lista.nome}`}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          />
                        </label>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700">
                            <input
                              type="checkbox"
                              checked={rascunho.gabaritoLiberado}
                              onChange={(event) =>
                                atualizarRascunhoNovo(lista.id, {
                                  gabaritoLiberado: event.target.checked,
                                })
                              }
                              className="h-4 w-4 accent-teal-500"
                            />
                            Liberar gabarito
                          </label>

                          <button
                            type="button"
                            onClick={() => void handleVincularLista(lista)}
                            disabled={idEmOperacao === `vincular-${lista.id}`}
                            className="flex items-center gap-1.5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                          >
                            {idEmOperacao === `vincular-${lista.id}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Link2 size={14} />
                            )}
                            Vincular
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <CalendarClock size={14} />
              Prazo vazio significa lista sem data limite.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
