export type TipoItemLoja = 'ICONE_PERFIL' | 'MOLDURA' | 'AVATAR' | 'TITULO' | 'PLANO_FUNDO';

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
  adquirido: boolean;
};

export type ItemInventario = Omit<ItemLoja, 'adquirido'>;

export type InventarioItem = {
  id: string;
  equipado: boolean;
  adquiridoEm: string;
  item: ItemInventario;
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
