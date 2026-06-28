// Tipos do dominio da loja/inventario de cosmeticos.

// Categorias de item cosmetico e a origem pela qual entrou no inventario.
export type TipoItemLoja = 'ICONE_PERFIL' | 'MOLDURA' | 'AVATAR' | 'TITULO' | 'PLANO_FUNDO';
export type OrigemItemInventario = 'COMPRA' | 'CONQUISTA';

// Item como aparece no catalogo da loja (com preco e flags de disponibilidade/posse).
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

// Item ja possuido pelo usuario (sem os campos exclusivos da vitrine).
export type ItemInventario = Omit<ItemLoja, 'adquirido' | 'disponivelNaLoja'> & {
  disponivelNaLoja?: boolean;
};

// Registro do inventario: o item possuido + metadados (equipado, origem, data).
export type InventarioItem = {
  id: string;
  equipado: boolean;
  origem?: OrigemItemInventario;
  adquiridoEm: string | null;
  item: ItemInventario;
};

// Versao "achatada" do registro de inventario (campos do item e metadados no mesmo nivel).
export type InventarioItemPlano = ItemInventario & {
  inventarioId: string;
  equipado: boolean;
  origem: OrigemItemInventario;
  adquiridoEm?: string;
};

// Metadados de paginacao das listagens da loja.
export type MetadadosPaginacao = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Envelope generico de resposta paginada.
export type RespostaPaginada<T> = {
  dados: T[];
  metadados: MetadadosPaginacao;
};

// Resposta da compra de um item: mensagem, novo saldo de moedas e item adquirido.
export type CompraItemResponse = {
  mensagem: string;
  saldoMoedas: number;
  item: InventarioItem;
};

// Parametros para listar o catalogo (filtro por tipo e paginacao).
export type ListarCatalogoParams = {
  tipo?: TipoItemLoja;
  page?: number;
  limit?: number;
};

// Resposta do inventario completo (itens no formato achatado).
export type RespostaInventarioCompleto = {
  mensagem: string;
  dados: InventarioItemPlano[];
};

/** Converte os registros achatados do inventario para o formato aninhado (item + metadados). */
export const normalizarInventarioPlano = (registros: InventarioItemPlano[]): InventarioItem[] =>
  registros.map(({ inventarioId, equipado, origem, adquiridoEm, ...item }) => ({
    id: inventarioId,
    equipado,
    origem,
    adquiridoEm: adquiridoEm ?? null,
    item,
  }));
