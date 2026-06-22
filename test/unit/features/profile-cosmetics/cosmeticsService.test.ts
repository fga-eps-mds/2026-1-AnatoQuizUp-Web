import { httpClient } from '../../../../src/shared/api/httpClient';
import {
  buscarEquipados,
  buscarEquipadosDe,
} from '../../../../src/features/profile-cosmetics/cosmeticsService';
import type {
  ItemInventario,
  TipoItemLoja,
} from '../../../../src/features/loja';
import { buscarPerfilSocial } from '../../../../src/features/social-profile/socialProfileService';

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

jest.mock('../../../../src/features/social-profile/socialProfileService', () => ({
  buscarPerfilSocial: jest.fn(),
}));

const mockedGet = httpClient.get as jest.MockedFunction<typeof httpClient.get>;
const mockedBuscarPerfilSocial = jest.mocked(buscarPerfilSocial);

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

describe('cosmeticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buscarEquipados', () => {
    it('busca e organiza todos os cosméticos equipados por slot', async () => {
      const itens = [
        criarItem('ICONE_PERFIL'),
        criarItem('MOLDURA'),
        criarItem('AVATAR'),
        criarItem('TITULO'),
        criarItem('PLANO_FUNDO'),
      ];
      mockedGet.mockResolvedValueOnce({ data: { dados: itens } });

      const resultado = await buscarEquipados();

      expect(mockedGet).toHaveBeenCalledWith('/inventario/meuPerfil');
      expect(resultado).toEqual({
        ICONE_PERFIL: itens[0],
        MOLDURA: itens[1],
        AVATAR: itens[2],
        TITULO: itens[3],
        PLANO_FUNDO: itens[4],
      });
    });

    it('retorna slots vazios quando não há itens equipados', async () => {
      mockedGet.mockResolvedValueOnce({ data: { dados: [] } });

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
    it('usa os perfis sociais agregados e preserva todos os usuários pedidos', async () => {
      const avatar = criarItem('AVATAR', 'avatar-ana');
      mockedBuscarPerfilSocial
        .mockResolvedValueOnce({
          usuario: {
            id: 'ana',
            nome: 'Ana',
            nickname: 'ana',
            curso: 'Medicina',
            semestre: '3',
          },
          cosmeticos: [avatar],
          conquistasDestacadas: [],
        })
        .mockResolvedValueOnce({
          usuario: {
            id: 'bruno',
            nome: 'Bruno',
            nickname: 'bruno',
            curso: null,
            semestre: null,
          },
          cosmeticos: [],
          conquistasDestacadas: [],
        });

      const resultado = await buscarEquipadosDe([
        ' ana ',
        'bruno',
        'ana',
        '',
      ]);

      expect(mockedBuscarPerfilSocial).toHaveBeenCalledTimes(2);
      expect(mockedBuscarPerfilSocial).toHaveBeenNthCalledWith(1, 'ana');
      expect(mockedBuscarPerfilSocial).toHaveBeenNthCalledWith(2, 'bruno');
      expect(resultado).toEqual({
        ana: { AVATAR: avatar },
        bruno: {},
      });
    });

    it('não chama a API quando a lista de ids está vazia', async () => {
      await expect(buscarEquipadosDe(['', '   '])).resolves.toEqual({});
      expect(mockedBuscarPerfilSocial).not.toHaveBeenCalled();
    });

    it('propaga erros da consulta de perfil social', async () => {
      mockedBuscarPerfilSocial.mockRejectedValueOnce(new Error('falha original'));

      await expect(buscarEquipadosDe(['ana'])).rejects.toThrow(
        'falha original',
      );
    });
  });
});
