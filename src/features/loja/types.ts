export type TipoItemLoja = 'ICONE_PERFIL' | 'MOLDURA' | 'AVATAR' | 'TITULO' | 'PLANO_FUNDO';
export type OrigemItemInventario = 'COMPRA' | 'CONQUISTA';

export type ItemLoja = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  tipo: TipoItemLoja;
  precoMoedas: number;
  valor: string | null;
  imagemUrl: string | null;
  previewImagemUrl: string | null;
  ativo: boolean;
  disponivelNaLoja: boolean;
  adquirido: boolean;
};

export type ItemInventario = Omit<ItemLoja, 'adquirido' | 'disponivelNaLoja'> & {
  disponivelNaLoja?: boolean;
};

export type InventarioItem = {
  id: string;
  equipado: boolean;
  origem?: OrigemItemInventario;
  adquiridoEm: string | null;
  item: ItemInventario;
};

export type InventarioItemPlano = ItemInventario & {
  inventarioId: string;
  equipado: boolean;
  origem: OrigemItemInventario;
  adquiridoEm?: string;
};

export type MetadadosPaginacao = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RespostaPaginada<T> = {
  dados: T[];
  metadados: MetadadosPaginacao;
};

export type CompraItemResponse = {
  mensagem: string;
  saldoMoedas: number;
  item: InventarioItem;
};

export type ListarCatalogoParams = {
  tipo?: TipoItemLoja;
  page?: number;
  limit?: number;
};

export type RespostaInventarioCompleto = {
  mensagem: string;
  dados: InventarioItemPlano[];
};

export const normalizarInventarioPlano = (registros: InventarioItemPlano[]): InventarioItem[] =>
  registros.map(({ inventarioId, equipado, origem, adquiridoEm, ...item }) => ({
    id: inventarioId,
    equipado,
    origem,
    adquiridoEm: adquiridoEm ?? null,
    item,
  }));
