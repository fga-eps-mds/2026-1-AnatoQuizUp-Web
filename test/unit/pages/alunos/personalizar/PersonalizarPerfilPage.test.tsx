import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';

import { PersonalizarPerfilPage } from '../../../../../src/pages/aluno/perfil/personalizar/PersonalizarPerfilPage';
import { httpClient } from '../../../../../src/shared/api/httpClient';
import { useAuth } from '../../../../../src/app/providers/AuthProvider';
import { useEquippedCosmeticsStore } from '../../../../../src/features/profile-cosmetics';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));
const mockedUseAuth = jest.mocked(useAuth);

const mockSetCosmeticosGlobais = jest.fn();
jest.mock('../../../../../src/features/profile-cosmetics', () => ({
  useEquippedCosmeticsStore: jest.fn(),
}));
const mockedUseEquippedCosmeticsStore = jest.mocked(useEquippedCosmeticsStore);

jest.mock('../../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));
const mockedHttpClient = jest.mocked(httpClient);

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

type MockZustandState = {
  cosmeticos: Record<string, unknown>;
  setCosmeticos: jest.Mock;
};

const ITEM_CORUJA = {
  inventarioId: 'inventario-1',
  id: 'item-1',
  codigo: 'coruja',
  nome: 'Coruja',
  descricao: null,
  tipo: 'ICONE_PERFIL',
  precoMoedas: 0,
  valor: '#14b8a6',
  imagemUrl: null,
  previewImagemUrl: null,
  ativo: true,
  equipado: true,
  origem: 'COMPRA',
};
const ITEM_CEREBRO = {
  inventarioId: 'inventario-2',
  id: 'item-2',
  codigo: 'cerebro',
  nome: 'Cérebro',
  descricao: null,
  tipo: 'ICONE_PERFIL',
  precoMoedas: 0,
  valor: '#00214d',
  imagemUrl: null,
  previewImagemUrl: null,
  ativo: true,
  equipado: false,
  origem: 'COMPRA',
};
const ITEM_CORUJA_EQUIPADO = {
  id: ITEM_CORUJA.id,
  codigo: ITEM_CORUJA.codigo,
  nome: ITEM_CORUJA.nome,
  descricao: ITEM_CORUJA.descricao,
  tipo: ITEM_CORUJA.tipo,
  precoMoedas: ITEM_CORUJA.precoMoedas,
  valor: ITEM_CORUJA.valor,
  imagemUrl: ITEM_CORUJA.imagemUrl,
  previewImagemUrl: ITEM_CORUJA.previewImagemUrl,
  ativo: ITEM_CORUJA.ativo,
};

describe('PersonalizarPerfilPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseAuth.mockReturnValue({
      user: {
        id: 'user-123',
        name: 'Pedro Cabeceira',
        nickname: 'cabeceira',
        course: 'Engenharia de Software',
        institution: 'UnB',
        email: 'pedro@unb.br',
        role: 'STUDENT',
      },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    mockedUseEquippedCosmeticsStore.mockImplementation((selector: unknown) => {
      const state: MockZustandState = {
        cosmeticos: {
          ICONE_PERFIL: ITEM_CORUJA_EQUIPADO,
        },
        setCosmeticos: mockSetCosmeticosGlobais,
      };
      
      const typedSelector = selector as (s: MockZustandState) => unknown;
      return typedSelector(state);
    });
  });

  it('deve renderizar a página, abas e buscar o inventário com sucesso', async () => {
    const mockResponse: Partial<AxiosResponse> = {
      data: {
        dados: [ITEM_CORUJA, ITEM_CEREBRO],
      },
    };
    mockedHttpClient.get.mockResolvedValueOnce(mockResponse as AxiosResponse);

    renderWithProviders(<PersonalizarPerfilPage />);

    expect(screen.getByText('Personalizar Perfil')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Coruja')).toBeInTheDocument();
      expect(screen.getByText('Cérebro')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Equipado')).toHaveLength(1);
  });

  it('deve exibir a barra de salvar ao selecionar um novo item', async () => {
    const mockResponse: Partial<AxiosResponse> = {
      data: {
        dados: [ITEM_CORUJA, ITEM_CEREBRO],
      },
    };
    mockedHttpClient.get.mockResolvedValueOnce(mockResponse as AxiosResponse);

    renderWithProviders(<PersonalizarPerfilPage />);

    await waitFor(() => expect(screen.getByText('Cérebro')).toBeInTheDocument());

    expect(screen.queryByText('Você tem alterações não salvas')).not.toBeInTheDocument();

    const cerebroText = screen.getByText('Cérebro');
    fireEvent.click(cerebroText);

    expect(await screen.findByText('Você tem alterações não salvas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar alterações/i })).toBeInTheDocument();
  });

  it('deve realizar as chamadas patch, atualizar store global e abrir modal de sucesso ao salvar', async () => {
    const mockResponse: Partial<AxiosResponse> = {
      data: {
        dados: [ITEM_CORUJA, ITEM_CEREBRO],
      },
    };
    mockedHttpClient.get.mockResolvedValueOnce(mockResponse as AxiosResponse);
    
    const mockPatchResponse: Partial<AxiosResponse> = { status: 200 };
    mockedHttpClient.patch.mockResolvedValueOnce(mockPatchResponse as AxiosResponse);

    renderWithProviders(<PersonalizarPerfilPage />);
    await waitFor(() => expect(screen.getByText('Cérebro')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Cérebro'));
    
    const saveBtn = await screen.findByRole('button', { name: /Salvar alterações/i });
    fireEvent.click(saveBtn);

    expect(await screen.findByText('Sucesso!')).toBeInTheDocument();
    
    expect(mockedHttpClient.patch).toHaveBeenCalledWith('/inventario/equipar', { itemLojaId: 'item-2' });
    expect(mockSetCosmeticosGlobais).toHaveBeenCalled();
  });

  it('deve navegar para a loja ao clicar em Ver mais na Loja', async () => {
    const mockResponse: Partial<AxiosResponse> = { data: { dados: [] } };
    mockedHttpClient.get.mockResolvedValueOnce(mockResponse as AxiosResponse);

    renderWithProviders(<PersonalizarPerfilPage />);
    
    const shopBtn = await screen.findAllByText('Ver mais na Loja');
    fireEvent.click(shopBtn[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/aluno/loja');
  });
});
