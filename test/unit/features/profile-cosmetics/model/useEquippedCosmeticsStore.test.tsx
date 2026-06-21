import { act } from '@testing-library/react';

import type {
  ItemInventario,
  TipoItemLoja,
} from '../../../../../src/features/loja';
import { useEquippedCosmeticsStore } from '../../../../../src/features/profile-cosmetics/model/useEquippedCosmeticsStore';

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

describe('useEquippedCosmeticsStore', () => {
  beforeEach(() => {
    act(() => {
      useEquippedCosmeticsStore.getState().reset();
    });
  });

  it('começa com o estado vazio', () => {
    expect(useEquippedCosmeticsStore.getState()).toMatchObject({
      cosmeticos: {},
      isLoading: false,
      error: null,
    });
  });

  it('substitui todos os cosméticos', () => {
    const avatar = criarItem('AVATAR');
    const moldura = criarItem('MOLDURA');

    act(() => {
      useEquippedCosmeticsStore
        .getState()
        .setCosmeticos({ AVATAR: avatar, MOLDURA: moldura });
    });

    expect(useEquippedCosmeticsStore.getState().cosmeticos).toEqual({
      AVATAR: avatar,
      MOLDURA: moldura,
    });
  });

  it('atualiza um slot sem apagar os demais', () => {
    const avatar = criarItem('AVATAR');
    const moldura = criarItem('MOLDURA');

    act(() => {
      useEquippedCosmeticsStore.getState().setCosmeticos({ AVATAR: avatar });
      useEquippedCosmeticsStore
        .getState()
        .setCosmetico('MOLDURA', moldura);
    });

    expect(useEquippedCosmeticsStore.getState().cosmeticos).toEqual({
      AVATAR: avatar,
      MOLDURA: moldura,
    });
  });

  it('substitui o item de um slot existente', () => {
    const avatarAntigo = criarItem('AVATAR', 'avatar-antigo');
    const avatarNovo = criarItem('AVATAR', 'avatar-novo');

    act(() => {
      useEquippedCosmeticsStore
        .getState()
        .setCosmeticos({ AVATAR: avatarAntigo });
      useEquippedCosmeticsStore
        .getState()
        .setCosmetico('AVATAR', avatarNovo);
    });

    expect(useEquippedCosmeticsStore.getState().cosmeticos.AVATAR).toBe(
      avatarNovo,
    );
  });

  it('remove somente o slot informado quando não recebe item', () => {
    const avatar = criarItem('AVATAR');
    const moldura = criarItem('MOLDURA');

    act(() => {
      useEquippedCosmeticsStore
        .getState()
        .setCosmeticos({ AVATAR: avatar, MOLDURA: moldura });
      useEquippedCosmeticsStore.getState().setCosmetico('AVATAR');
    });

    expect(useEquippedCosmeticsStore.getState().cosmeticos).toEqual({
      MOLDURA: moldura,
    });
  });

  it('controla carregamento e erro', () => {
    act(() => {
      useEquippedCosmeticsStore.getState().setLoading(true);
      useEquippedCosmeticsStore.getState().setError('Falha ao carregar');
    });

    expect(useEquippedCosmeticsStore.getState()).toMatchObject({
      isLoading: true,
      error: 'Falha ao carregar',
    });
  });

  it('restaura o estado inicial', () => {
    act(() => {
      useEquippedCosmeticsStore
        .getState()
        .setCosmeticos({ AVATAR: criarItem('AVATAR') });
      useEquippedCosmeticsStore.getState().setLoading(true);
      useEquippedCosmeticsStore.getState().setError('erro');
      useEquippedCosmeticsStore.getState().reset();
    });

    expect(useEquippedCosmeticsStore.getState()).toMatchObject({
      cosmeticos: {},
      isLoading: false,
      error: null,
    });
  });
});
