export {
  buscarInventarioCompleto,
  comprarItem,
  listarCatalogo,
  listarInventario,
} from './lojaService';
export type {
  CompraItemResponse,
  InventarioItem,
  ItemInventario,
  ItemLoja,
  ListarCatalogoParams,
  RespostaPaginada,
  TipoItemLoja,
  OrigemItemInventario,
} from './types';
export { normalizarInventarioPlano } from './types';
