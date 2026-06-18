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

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useAuth } from '../../../../../../src/app/providers/AuthProvider';
import { listarAmigos } from '../../../../../../src/features/friendship';
import { useStudentCoinsStore } from '../../../../../../src/features/student-coins/model/useStudentCoinsStore';
import { PerfilAlunoPage } from '../../../../../../src/pages/aluno/perfil';
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
  });

  it('esconde apelido quando usuario nao tem nickname', () => {
    useAuthMock.mockReturnValue({
      user: {
        ...aluno,
        nickname: null,
      },
    });

    renderPerfil();

    expect(screen.queryByText('@joaojose')).not.toBeInTheDocument();
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
});
