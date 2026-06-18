import { httpClient } from '../../shared/api/httpClient';
import { extractErrorMessage } from '../manage-questions/model/questionService';
import type {
  CompraItemResponse,
  InventarioItem,
  ItemLoja,
  ListarCatalogoParams,
  RespostaPaginada,
} from './types';

const LOJA_ENDPOINT = '/loja';

export const listarCatalogo = async (
  params?: ListarCatalogoParams,
): Promise<RespostaPaginada<ItemLoja>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<ItemLoja>>(
      `${LOJA_ENDPOINT}/catalogo`,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const listarInventario = async (
  params?: { page?: number; limit?: number },
): Promise<RespostaPaginada<InventarioItem>> => {
  try {
    const { data } = await httpClient.get<RespostaPaginada<InventarioItem>>(
      `${LOJA_ENDPOINT}/meu-inventario`,
      { params },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const comprarItem = async (
  itemLojaId: string,
): Promise<CompraItemResponse> => {
  try {
    const { data } = await httpClient.post<CompraItemResponse>(
      `${LOJA_ENDPOINT}/comprar`,
      { itemLojaId },
    );

    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
