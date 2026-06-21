jest.mock('../../../../../../src/features/friendship', () => ({
  buscarPerfilPublico: jest.fn(),
  desfazerAmizade: jest.fn(),
}));

jest.mock('../../../../../../src/features/profile-cosmetics', () => ({
  buscarEquipadosDe: jest.fn(),
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import {
  buscarPerfilPublico,
  desfazerAmizade,
} from '../../../../../../src/features/friendship';
import type {
  ItemInventario,
  TipoItemLoja,
} from '../../../../../../src/features/loja';
import { buscarEquipadosDe } from '../../../../../../src/features/profile-cosmetics';
import { AmigoPerfilPage } from '../../../../../../src/pages/aluno/amigo';

const buscarPerfilPublicoMock = buscarPerfilPublico as jest.Mock;
const desfazerAmizadeMock = desfazerAmizade as jest.Mock;
const buscarEquipadosDeMock = buscarEquipadosDe as jest.Mock;

const perfilPadrao = {
  id: 'aluno-2',
  nome: 'Rafael Oliveira',
  nickname: 'rafael',
  curso: 'Medicina',
  semestre: '4',
  perfilPrivado: false,
};

const criarCosmetico = (
  tipo: TipoItemLoja,
  dados: Partial<ItemInventario> = {},
): ItemInventario => ({
  id: `item-${tipo.toLowerCase()}`,
  codigo: `codigo-${tipo.toLowerCase()}`,
  nome: `Item ${tipo}`,
  descricao: null,
  tipo,
  precoMoedas: 100,
  valor: null,
  imagemUrl: null,
  previewImagemUrl: null,
  ativo: true,
  ...dados,
});

function criarDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolver, rejeitar) => {
    resolve = resolver;
    reject = rejeitar;
  });

  return { promise, resolve, reject };
}

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const renderPagina = (state?: { amizadeId?: string }) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/aluno/amigos/aluno-2',
          state: state ?? null,
        },
      ]}
    >
      <Routes>
        <Route path="/aluno/amigos/:id" element={<AmigoPerfilPage />} />
        <Route path="/aluno/amigos" element={<div>Lista de amigos</div>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

describe('AmigoPerfilPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    buscarPerfilPublicoMock.mockResolvedValue(perfilPadrao);
    buscarEquipadosDeMock.mockResolvedValue({});
    desfazerAmizadeMock.mockResolvedValue({
      mensagem: 'Amizade desfeita com sucesso',
    });
  });

  it('exibe skeleton enquanto carrega o perfil', () => {
    buscarPerfilPublicoMock.mockImplementation(() => new Promise(() => {}));
    buscarEquipadosDeMock.mockImplementation(() => new Promise(() => {}));

    renderPagina();

    expect(
      screen.getByRole('status', { name: 'Carregando perfil' }),
    ).toBeInTheDocument();
  });

  it('renderiza o perfil publico do amigo como somente leitura', async () => {
    renderPagina();

    expect(await screen.findByText('Rafael Oliveira')).toBeInTheDocument();
    expect(screen.getByText('@rafael')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Personalizar perfil/i }),
    ).not.toBeInTheDocument();
  });

  it('busca perfil e cosmeticos em paralelo usando o id da URL', async () => {
    renderPagina();

    await waitFor(() => {
      expect(buscarPerfilPublicoMock).toHaveBeenCalledWith('aluno-2');
      expect(buscarEquipadosDeMock).toHaveBeenCalledWith(['aluno-2']);
    });
  });

  it('renderiza os cosmeticos equipados do amigo', async () => {
    buscarEquipadosDeMock.mockResolvedValue({
      'aluno-2': {
        AVATAR: criarCosmetico('AVATAR', {
          nome: 'Avatar do Rafael',
          imagemUrl: '/avatar-rafael.png',
        }),
        MOLDURA: criarCosmetico('MOLDURA', {
          nome: 'Moldura Dourada',
          valor: '#f59e0b',
        }),
        TITULO: criarCosmetico('TITULO', {
          nome: 'Veterano dos Ossos',
        }),
        PLANO_FUNDO: criarCosmetico('PLANO_FUNDO', {
          nome: 'Fundo Azul',
          valor: '#123456',
        }),
      },
    });

    renderPagina();

    expect(
      await screen.findByRole('img', { name: 'Avatar do Rafael' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Moldura Moldura Dourada')).toBeInTheDocument();
    expect(screen.getByText('Veterano dos Ossos')).toBeInTheDocument();
    expect(screen.getByLabelText('Plano de fundo do perfil')).toHaveStyle(
      'background: #123456',
    );
  });

  it('usa fallback visual quando a busca de cosmeticos falha', async () => {
    buscarEquipadosDeMock.mockRejectedValue(new Error('Sem cosméticos'));

    renderPagina();

    expect(await screen.findByText('Rafael Oliveira')).toBeInTheDocument();
    expect(screen.getByText('RO')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('exibe aviso quando o backend sinaliza perfil privado', async () => {
    buscarPerfilPublicoMock.mockResolvedValue({
      ...perfilPadrao,
      nickname: null,
      curso: null,
      semestre: null,
      perfilPrivado: true,
    });

    renderPagina();

    expect(
      await screen.findByRole('note', { name: 'Perfil privado' }),
    ).toHaveTextContent('Este aluno optou por manter o perfil privado.');
    expect(screen.queryByText('@rafael')).not.toBeInTheDocument();
  });

  it('nao exibe aviso quando o perfil nao e privado', async () => {
    renderPagina();

    await screen.findByText('Rafael Oliveira');
    expect(
      screen.queryByRole('note', { name: 'Perfil privado' }),
    ).not.toBeInTheDocument();
  });

  it('exibe desfazer amizade somente quando amizadeId vem no state', async () => {
    renderPagina({ amizadeId: 'amizade-ativa-1' });

    expect(
      await screen.findByRole('button', { name: /Desfazer amizade/i }),
    ).toBeInTheDocument();
  });

  it('nao exibe desfazer amizade sem amizadeId', async () => {
    renderPagina();

    await screen.findByText('Rafael Oliveira');
    expect(
      screen.queryByRole('button', { name: /Desfazer amizade/i }),
    ).not.toBeInTheDocument();
  });

  it('desfaz amizade e volta para a lista', async () => {
    const user = userEvent.setup();
    renderPagina({ amizadeId: 'amizade-ativa-1' });

    await user.click(
      await screen.findByRole('button', { name: /Desfazer amizade/i }),
    );

    expect(desfazerAmizadeMock).toHaveBeenCalledWith('amizade-ativa-1');
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
  });

  it('desabilita o botao enquanto desfaz a amizade', async () => {
    const user = userEvent.setup();
    desfazerAmizadeMock.mockImplementation(() => new Promise(() => {}));
    renderPagina({ amizadeId: 'amizade-ativa-1' });

    await user.click(
      await screen.findByRole('button', { name: /Desfazer amizade/i }),
    );

    expect(
      screen.getByRole('button', { name: /Desfazendo.../i }),
    ).toBeDisabled();
  });

  it('mostra erro e permanece na pagina quando desfazer falha', async () => {
    const user = userEvent.setup();
    desfazerAmizadeMock.mockRejectedValue(new Error('Falha de rede'));
    renderPagina({ amizadeId: 'amizade-ativa-1' });

    await user.click(
      await screen.findByRole('button', { name: /Desfazer amizade/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível desfazer a amizade. Tente novamente.',
    );
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/aluno/amigos/aluno-2',
    );
    expect(
      screen.getByRole('button', { name: /Desfazer amizade/i }),
    ).toBeEnabled();
  });

  it('exibe estado de erro quando o perfil nao carrega', async () => {
    buscarPerfilPublicoMock.mockRejectedValue(new Error('Não encontrado'));

    renderPagina();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar este perfil.',
    );
  });

  it('volta para a lista pelo estado de erro', async () => {
    const user = userEvent.setup();
    buscarPerfilPublicoMock.mockRejectedValue(new Error('Não encontrado'));
    renderPagina();

    await user.click(await screen.findByRole('button', { name: /^Voltar$/i }));

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
  });

  it('volta para a lista pelo botao do cabecalho', async () => {
    const user = userEvent.setup();
    renderPagina();

    await screen.findByText('Rafael Oliveira');
    await user.click(
      screen.getByRole('button', { name: /Voltar para lista de amigos/i }),
    );

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/aluno\/amigos$/);
  });

  it('ignora respostas depois que a pagina desmonta', async () => {
    const perfil = criarDeferred<typeof perfilPadrao>();
    const cosmeticos = criarDeferred<Record<string, never>>();
    buscarPerfilPublicoMock.mockReturnValue(perfil.promise);
    buscarEquipadosDeMock.mockReturnValue(cosmeticos.promise);

    const { unmount } = renderPagina();
    unmount();

    perfil.resolve(perfilPadrao);
    cosmeticos.resolve({});
    await Promise.all([perfil.promise, cosmeticos.promise]);
    await Promise.resolve();

    expect(buscarPerfilPublicoMock).toHaveBeenCalledWith('aluno-2');
    expect(buscarEquipadosDeMock).toHaveBeenCalledWith(['aluno-2']);
  });

  it('exibe erro quando a pagina e renderizada sem id', async () => {
    render(
      <MemoryRouter initialEntries={['/aluno/amigos']}>
        <Routes>
          <Route path="/aluno/amigos" element={<AmigoPerfilPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar este perfil.',
    );
    expect(buscarPerfilPublicoMock).not.toHaveBeenCalled();
  });
});
