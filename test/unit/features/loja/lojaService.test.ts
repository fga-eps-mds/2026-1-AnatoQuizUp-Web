import { httpClient } from '../../../../src/shared/api/httpClient';
import {
  comprarItem,
  listarCatalogo,
  listarInventario,
} from '../../../../src/features/loja/lojaService';

jest.mock('../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../../../../src/features/manage-questions/model/questionService', () => ({
  extractErrorMessage: jest.fn(() => 'Erro simulado pelo mock'),
}));

const itemCatalogo = {
  id: 'item-1',
  codigo: 'icone-coruja-sabia',
  nome: 'Coruja Sábia',
  descricao: 'Ícone de perfil.',
  tipo: 'ICONE_PERFIL',
  precoMoedas: 1,
  valor: null,
  imagemUrl: 'https://exemplo/icone.svg',
  previewImagemUrl: 'https://exemplo/icone.svg',
  ativo: true,
  adquirido: false,
};

const respostaPaginada = {
  dados: [itemCatalogo],
  metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
};

describe('lojaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve listar o catalogo com parametros de filtro', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({ data: respostaPaginada });

    const resultado = await listarCatalogo({ tipo: 'ICONE_PERFIL', limit: 100 });

    expect(httpClient.get).toHaveBeenCalledWith('/loja/catalogo', {
      params: { tipo: 'ICONE_PERFIL', limit: 100 },
    });
    expect(resultado).toEqual(respostaPaginada);
  });

  it('deve listar o inventario', async () => {
    const inventario = {
      dados: [
        {
          id: 'inv-1',
          equipado: false,
          adquiridoEm: '2026-06-17T00:00:00.000Z',
          item: itemCatalogo,
        },
      ],
      metadados: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    (httpClient.get as jest.Mock).mockResolvedValue({ data: inventario });

    const resultado = await listarInventario({ limit: 100 });

    expect(httpClient.get).toHaveBeenCalledWith('/loja/meu-inventario', {
      params: { limit: 100 },
    });
    expect(resultado).toEqual(inventario);
  });

  it('deve comprar um item enviando o itemLojaId', async () => {
    const compra = {
      mensagem: 'Item comprado com sucesso.',
      saldoMoedas: 4999,
      item: {
        id: 'inv-1',
        equipado: false,
        adquiridoEm: '2026-06-17T00:00:00.000Z',
        item: itemCatalogo,
      },
    };
    (httpClient.post as jest.Mock).mockResolvedValue({ data: compra });

    const resultado = await comprarItem('item-1');

    expect(httpClient.post).toHaveBeenCalledWith('/loja/comprar', { itemLojaId: 'item-1' });
    expect(resultado).toEqual(compra);
  });

  it('deve lançar erro tratado quando a requisição falhar', async () => {
    (httpClient.post as jest.Mock).mockRejectedValue(new Error('falha de rede'));

    await expect(comprarItem('item-1')).rejects.toThrow('Erro simulado pelo mock');
  });
});
