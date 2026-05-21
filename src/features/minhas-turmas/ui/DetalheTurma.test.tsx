import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { DetalheTurma } from './DetalheTurma';
import { httpClient } from '../../../shared/api/httpClient';
import { buscarUsuarioPorId } from '../../../entities/usuarios/api/usuarioApi';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../../entities/usuarios/api/usuarioApi', () => ({
  buscarUsuarioPorId: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'turma-1' }),
  };
});

const turmaApiMock = {
  id: 'turma-1',
  codigo: 'ANAT-01',
  nome: 'Anatomia Sistemica',
  semestre: '1',
  ano: 2026,
  descricao: 'Estudo da estrutura do corpo humano.',
  status: 'ATIVA',
  quantidadeAlunos: 12,
  criadoEm: '2026-03-01T10:00:00.000Z',
  professorId: 'prof-1',
};

const usuarioPublicoMock = {
  id: 'prof-1',
  nome: 'Dra. Maria Souza',
  papel: 'PROFESSOR' as const,
};

const renderComponente = () =>
  render(
    <MemoryRouter>
      <DetalheTurma />
    </MemoryRouter>,
  );

describe('DetalheTurma Feature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restaura jest.spyOn (ex.: axios.isAxiosError) para nao vazar entre testes.
    jest.restoreAllMocks();
  });

  it('deve renderizar nome, descricao e professor da turma', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { dados: turmaApiMock },
    });
    (buscarUsuarioPorId as jest.Mock).mockResolvedValue(usuarioPublicoMock);

    renderComponente();

    expect(await screen.findByText('Anatomia Sistemica')).toBeInTheDocument();
    expect(screen.getByText('2026.1')).toBeInTheDocument();
    expect(
      screen.getByText('Estudo da estrutura do corpo humano.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Dra. Maria Souza')).toBeInTheDocument();

    expect(httpClient.get).toHaveBeenCalledWith('/turmas/turma-1');
    expect(buscarUsuarioPorId).toHaveBeenCalledWith('prof-1');
  });

  it('deve exibir fallback quando nao for possivel obter o professor', async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { dados: turmaApiMock },
    });
    (buscarUsuarioPorId as jest.Mock).mockRejectedValue(new Error('falha'));

    renderComponente();

    expect(await screen.findByText('Anatomia Sistemica')).toBeInTheDocument();
    expect(screen.getByText('Professor não disponível')).toBeInTheDocument();
  });

  it('deve exibir estado nao encontrada quando a turma retornar 404', async () => {
    const erro404 = Object.assign(new Error('not found'), {
      isAxiosError: true,
      response: { status: 404 },
    });
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    (httpClient.get as jest.Mock).mockRejectedValue(erro404);

    renderComponente();

    expect(await screen.findByText('Turma não encontrada.')).toBeInTheDocument();
    expect(
      screen.getByText('Esta turma não existe ou você não está vinculado a ela.'),
    ).toBeInTheDocument();
  });

  it('deve exibir estado de erro generico quando a chamada falhar com erro nao 404', async () => {
    jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
    (httpClient.get as jest.Mock).mockRejectedValue(new Error('falha 500'));

    renderComponente();

    expect(
      await screen.findByText('Não foi possível carregar os detalhes da turma.'),
    ).toBeInTheDocument();
  });

  it('deve navegar de volta para listagem ao clicar em voltar', async () => {
    const user = userEvent.setup();
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { dados: turmaApiMock },
    });
    (buscarUsuarioPorId as jest.Mock).mockResolvedValue(usuarioPublicoMock);

    renderComponente();

    await screen.findByText('Anatomia Sistemica');

    await user.click(
      screen.getAllByRole('button', { name: /Voltar para minhas turmas/i })[0],
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/aluno/turmas');
    });
  });
});
