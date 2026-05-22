import { httpClient } from '../../../shared/api/httpClient';
import type { FiltrosLista, ListaQuestao } from '../model/types';

type RespostaApi<T> = {
  mensagem?: string;
  dados: T;
};

interface ListaQuestaoApi {
  id: string;
  nome: string;
  quantidadeQuestoes: number;
  status: 'PUBLICADA' | 'RASCUNHO';
  turmas: {
    id: string;
    nome: string;
  }[];
  criadoEm: string;
  atualizadoEm: string;
}

const normalizarLista = (lista: ListaQuestaoApi): ListaQuestao => {
  return {
    id: lista.id,
    nome: lista.nome,
    quantidadeQuestoes: lista.quantidadeQuestoes,
    turmas: lista.turmas || [],
    status: lista.status,
    criadoEm: new Date(lista.criadoEm).toLocaleDateString('pt-BR'),
  };
};

export const listarListas = async (filtros?: FiltrosLista): Promise<ListaQuestao[]> => {
  const response = await httpClient.get<RespostaApi<ListaQuestaoApi[]>>('/lista', {
    params: filtros,
  });
  return response.data.dados.map(normalizarLista);
};

export const excluirLista = async (id: string): Promise<void> => {
  await httpClient.delete(`/lista/${id}`);
};