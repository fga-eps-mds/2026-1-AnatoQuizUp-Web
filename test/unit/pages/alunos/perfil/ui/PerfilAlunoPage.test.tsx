jest.mock('../../../../../../src/app/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../../../src/shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../../../../../src/features/friendship', () => ({
  listarAmigos: jest.fn(),
}));

jest.mock(
  '../../../../../../src/features/profile-cosmetics/cosmeticsService',
  () => ({
    buscarEquipados: jest.fn(),
    buscarEquipadosDe: jest.fn(),
  }),
);

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useAuth } from '../../../../../../src/app/providers/AuthProvider';
import { listarAmigos } from '../../../../../../src/features/friendship';
import type {
  ItemInventario,
  TipoItemLoja,
} from '../../../../../../src/features/loja';
import { useEquippedCosmeticsStore } from '../../../../../../src/features/profile-cosmetics';
import { useStudentCoinsStore } from '../../../../../../src/features/student-coins/model/useStudentCoinsStore';
import { PerfilAlunoPage } from '../../../../../../src/pages/aluno/perfil';
import { CardStat } from '../../../../../../src/pages/aluno/perfil/ui/PerfilAlunoPage';
import { httpClient } from '../../../../../../src/shared/api/httpClient';

const useAuthMock = useAuth as jest.Mock;
const httpGetMock = httpClient.get as jest.Mock;
const listarAmigosMock = listarAmigos as jest.Mock;

const aluno = {
  id: 'aluno-1',
  name: 'Joao Silva',
  nickname: 'joaojose',
  email: 'joao@example.com',
  role: 'STUDENT',
  status: 'ACTIVE',
  authProvider: 'LOCAL',
  institution: 'UnB',
  course: 'Medicina',
};

const LocationProbe = () => {
  const location = useLocation();
  return <span data-testid="location">{location.pathname}</span>;
};

const respostaAmigos = (total: number) => ({
  dados: [],
  metadados: {
    page: 1,
    limit: 1,
    total,
    totalPages: total > 0 ? 1 : 0,
  },
});

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
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}

const renderPerfil = () => render(
  <MemoryRouter initialEntries={['/aluno/perfil']}>
    <PerfilAlunoPage />
    <LocationProbe />
  </MemoryRouter>,
);

describe('PerfilAlunoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStudentCoinsStore.getState().reset();
    useStudentCoinsStore.getState().setSaldoMoedas(1240);
    useEquippedCosmeticsStore.getState().reset();
    useAuthMock.mockReturnValue({
      user: aluno,
    });
    httpGetMock.mockResolvedValue({
      data: {
        totalRespondidas: 348,
        taxaAcerto: 76,
      },
    });
    listarAmigosMock.mockResolvedValue(respostaAmigos(8));
  });

  it('renderiza identidade do aluno e saldo de ATP', async () => {
    renderPerfil();

    expect(screen.getByRole('heading', { name: /Meu Perfil/i })).toBeInTheDocument();
    expect(screen.getByText('Joao Silva')).toBeInTheDocument();
    expect(screen.getByText('@joaojose')).toBeInTheDocument();
    expect(screen.getByText('Medicina · UnB')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('1.240 ATP')).toBeInTheDocument();

    await waitFor(() => {
      expect(httpClient.get).toHaveBeenCalledWith('/dashboardAluno');
    });
    expect(httpGetMock).toHaveBeenCalledTimes(1);
  });

  it('usa os fallbacks do card quando nao ha cosmeticos equipados', async () => {
    renderPerfil();

    expect(screen.getByText('JS')).toBeInTheDocument();
    expect(screen.getByLabelText('Plano de fundo do perfil')).toBeInTheDocument();
    expect(await screen.findByText('348')).toBeInTheDocument();
  });

  it('renderiza os cosmeticos equipados no card de identidade', async () => {
    const avatar = criarCosmetico('AVATAR', {
      nome: 'Avatar Anatomico',
      imagemUrl: '/avatar-anatomico.png',
    });
    const icone = criarCosmetico('ICONE_PERFIL', {
      nome: 'Icone Cerebro',
      imagemUrl: '/icone-cerebro.png',
    });
    const moldura = criarCosmetico('MOLDURA', {
      nome: 'Moldura Dourada',
      valor: '#f59e0b',
    });
    const titulo = criarCosmetico('TITULO', {
      nome: 'Veterano dos Ossos',
    });
    const fundo = criarCosmetico('PLANO_FUNDO', {
      nome: 'Fundo Anatomico',
      valor: '#123456',
    });

    act(() => {
      useEquippedCosmeticsStore.getState().setCosmeticos({
        AVATAR: avatar,
        ICONE_PERFIL: icone,
        MOLDURA: moldura,
        TITULO: titulo,
        PLANO_FUNDO: fundo,
      });
    });

    renderPerfil();

    expect(screen.getByRole('img', { name: 'Avatar Anatomico' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Icone Cerebro' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Moldura Moldura Dourada')).toBeInTheDocument();
    expect(screen.getByText('Veterano dos Ossos')).toBeInTheDocument();
    expect(screen.getByLabelText('Plano de fundo do perfil')).toHaveStyle(
      'background: #123456',
    );
    expect(await screen.findByText('348')).toBeInTheDocument();
  });

  it('navega para a loja pelo botao de personalizar e remove o teaser', async () => {
    const user = userEvent.setup();

    renderPerfil();

    expect(screen.queryByText(/Em breve/i)).not.toBeInTheDocument();
    expect(await screen.findByText('348')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Personalizar perfil' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/loja');
  });

  it('esconde apelido quando usuario nao tem nickname', async () => {
    useAuthMock.mockReturnValue({
      user: {
        ...aluno,
        nickname: null,
      },
    });

    renderPerfil();

    expect(screen.queryByText('@joaojose')).not.toBeInTheDocument();
    expect(await screen.findByText('348')).toBeInTheDocument();
  });

  it('mostra stats carregadas do dashboard e de amigos', async () => {
    renderPerfil();

    expect(await screen.findByText('348')).toBeInTheDocument();
    expect(screen.getByText('76%')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(listarAmigos).toHaveBeenCalledWith({ limit: 1 });
  });

  it('mantem stats de amigos quando dashboard falha', async () => {
    httpGetMock.mockRejectedValue(new Error('Falha dashboard'));
    listarAmigosMock.mockResolvedValue(respostaAmigos(5));

    renderPerfil();

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    expect(screen.getAllByText('0')).toHaveLength(1);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('navega para editar informacoes pelo botao principal', async () => {
    const user = userEvent.setup();

    renderPerfil();

    expect(await screen.findByText('348')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Editar informações/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/aluno/perfil/editar');
  });

  it('exibe skeleton enquanto as stats carregam', () => {
    httpGetMock.mockImplementation(() => new Promise(() => {}));
    listarAmigosMock.mockImplementation(() => new Promise(() => {}));

    renderPerfil();

    expect(screen.getByLabelText('Carregando Questões respondidas')).toBeInTheDocument();
    expect(screen.getByLabelText('Carregando Taxa de acerto')).toBeInTheDocument();
    expect(screen.getByLabelText('Carregando Amigos')).toBeInTheDocument();
  });

  it('nao renderiza conteudo quando usuario nao esta disponivel', () => {
    useAuthMock.mockReturnValue({
      user: null,
    });
    httpGetMock.mockImplementation(() => new Promise(() => {}));
    listarAmigosMock.mockImplementation(() => new Promise(() => {}));

    const { container } = render(
      <MemoryRouter>
        <PerfilAlunoPage />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('ignora respostas de stats depois de desmontar a pagina', async () => {
    const dashboard = criarDeferred<{
      data: {
        totalRespondidas: number;
        taxaAcerto: number;
      };
    }>();
    const amigos = criarDeferred<ReturnType<typeof respostaAmigos>>();

    httpGetMock.mockReturnValue(dashboard.promise);
    listarAmigosMock.mockReturnValue(amigos.promise);

    const { unmount } = renderPerfil();
    unmount();

    await act(async () => {
      dashboard.resolve({
        data: {
          totalRespondidas: 10,
          taxaAcerto: 90,
        },
      });
      amigos.resolve(respostaAmigos(4));
      await Promise.all([dashboard.promise, amigos.promise]);
      await Promise.resolve();
    });

    expect(httpGetMock).toHaveBeenCalledWith('/dashboardAluno');
    expect(listarAmigosMock).toHaveBeenCalledWith({ limit: 1 });
  });

  describe('navegacao pelos cards de estatisticas', () => {
    it('mantem card sem onClick como elemento nao interativo', () => {
      const { container } = render(
        <CardStat
          icon={<span aria-hidden="true">I</span>}
          valor={10}
          rotulo="Stat sem destino"
          carregando={false}
          tone="teal"
        />,
      );

      expect(container.firstElementChild?.tagName).toBe('DIV');
      expect(
        screen.queryByRole('button', { name: /Stat sem destino/i }),
      ).not.toBeInTheDocument();
    });

    it('navega para o dashboard pelo card de questoes respondidas', async () => {
      const user = userEvent.setup();

      renderPerfil();

      expect(await screen.findByText('348')).toBeInTheDocument();
      await user.click(
        screen.getByRole('button', { name: /Questões respondidas/i }),
      );

      expect(screen.getByTestId('location')).toHaveTextContent('/aluno/dashboard');
    });

    it('navega para o dashboard pelo card de taxa de acerto', async () => {
      const user = userEvent.setup();

      renderPerfil();

      expect(await screen.findByText('76%')).toBeInTheDocument();
      await user.click(
        screen.getByRole('button', { name: /Taxa de acerto/i }),
      );

      expect(screen.getByTestId('location')).toHaveTextContent('/aluno/dashboard');
    });

    it('navega para a pagina de amigos pelo card de amigos', async () => {
      const user = userEvent.setup();

      renderPerfil();

      expect(await screen.findByText('8')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /Amigos/i }));

      expect(screen.getByTestId('location')).toHaveTextContent('/aluno/amigos');
    });

    it('renderiza os cards como botoes focaveis pelo teclado', async () => {
      renderPerfil();

      expect(await screen.findByText('348')).toBeInTheDocument();

      const questoes = screen.getByRole('button', {
        name: /Questões respondidas/i,
      });
      const taxa = screen.getByRole('button', { name: /Taxa de acerto/i });
      const amigos = screen.getByRole('button', { name: /Amigos/i });

      for (const card of [questoes, taxa, amigos]) {
        expect(card).toHaveAttribute('type', 'button');
        expect(card).not.toBeDisabled();
        expect(card).not.toHaveAttribute('tabindex', '-1');
      }
    });
  });
});
