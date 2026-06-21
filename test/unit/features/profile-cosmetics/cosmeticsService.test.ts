import { httpClient } from '../../../../src/shared/api/httpClient';
import {
  buscarEquipados,
  buscarEquipadosDe,
} from '../../../../src/features/profile-cosmetics/cosmeticsService';
import type {
  InventarioItem,
  ItemInventario,
  TipoItemLoja,
} from '../../../../src/features/loja';

jest.mock('../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

jest.mock(
  '../../../../src/features/manage-questions/model/questionService',
  () => ({
    extractErrorMessage: jest.fn(() => 'Erro simulado pelo mock'),
  }),
);

const mockedGet = httpClient.get as jest.MockedFunction<typeof httpClient.get>;

const criarItem = (
  tipo: TipoItemLoja,
  id = tipo.toLowerCase(),
): ItemInventario => ({
  id,
  codigo: `codigo-${id}`,
  nome: `Item ${id}`,
  descricao: null,
  tipo,
  precoMoedas: 100,
  valor: null,
  imagemUrl: null,
  previewImagemUrl: null,
  ativo: true,
});

const criarRegistro = (
  tipo: TipoItemLoja,
  equipado = true,
  id?: string,
): InventarioItem => ({
  id: `inventario-${id ?? tipo.toLowerCase()}`,
  equipado,
  adquiridoEm: '2026-06-20T12:00:00.000Z',
  item: criarItem(tipo, id),
});

describe('cosmeticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarEquipados', () => {
    it('busca e organiza todos os cosméticos equipados por slot', async () => {
      const registros = [
        criarRegistro('ICONE_PERFIL'),
        criarRegistro('MOLDURA'),
        criarRegistro('AVATAR'),
        criarRegistro('TITULO'),
        criarRegistro('PLANO_FUNDO'),
      ];
      mockedGet.mockResolvedValueOnce({ data: { dados: registros } });

      const resultado = await buscarEquipados();

      expect(mockedGet).toHaveBeenCalledWith('/inventario/meuPerfil');
      expect(resultado).toEqual({
        ICONE_PERFIL: registros[0].item,
        MOLDURA: registros[1].item,
        AVATAR: registros[2].item,
        TITULO: registros[3].item,
        PLANO_FUNDO: registros[4].item,
      });
    });

    it('retorna slots vazios quando não há itens equipados', async () => {
      mockedGet.mockResolvedValueOnce({ data: { dados: [] } });

      await expect(buscarEquipados()).resolves.toEqual({});
    });

    it('ignora registros que não estão equipados', async () => {
      mockedGet.mockResolvedValueOnce({
        data: { dados: [criarRegistro('AVATAR', false)] },
      });

      await expect(buscarEquipados()).resolves.toEqual({});
    });

    it('normaliza erros da API', async () => {
      mockedGet.mockRejectedValueOnce(new Error('falha original'));

      await expect(buscarEquipados()).rejects.toThrow(
        'Erro simulado pelo mock',
      );
    });
  });

  describe('buscarEquipadosDe', () => {
    it('faz uma única requisição em lote e preserva todos os usuários pedidos', async () => {
      const avatar = criarRegistro('AVATAR', true, 'avatar-ana');
      mockedGet.mockResolvedValueOnce({
        data: { dados: { ana: [avatar], bruno: [] } },
      });

      const resultado = await buscarEquipadosDe([
        ' ana ',
        'bruno',
        'ana',
        '',
      ]);

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith('/inventario/meuPerfil/lote', {
        params: { usuarioIds: 'ana,bruno' },
      });
      expect(resultado).toEqual({
        ana: { AVATAR: avatar.item },
        bruno: {},
      });
    });

    it('cria slots vazios para usuários omitidos pela resposta', async () => {
      mockedGet.mockResolvedValueOnce({ data: { dados: {} } });

      await expect(buscarEquipadosDe(['usuario-sem-item'])).resolves.toEqual({
        'usuario-sem-item': {},
      });
    });

    it('não chama a API quando a lista de ids está vazia', async () => {
      await expect(buscarEquipadosDe(['', '   '])).resolves.toEqual({});
      expect(mockedGet).not.toHaveBeenCalled();
    });

    it('normaliza erros da requisição em lote', async () => {
      mockedGet.mockRejectedValueOnce(new Error('falha original'));

      await expect(buscarEquipadosDe(['ana'])).rejects.toThrow(
        'Erro simulado pelo mock',
      );
    });
  });
});
