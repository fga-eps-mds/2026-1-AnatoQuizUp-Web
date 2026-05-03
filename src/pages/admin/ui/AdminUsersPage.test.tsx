import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminUsersPage } from './AdminUsersPage';
import {
  fetchAdminUserById,
  fetchAdminUsers,
  updateAdminUserStatus,
} from '../model/adminUsersService';

jest.mock('../model/adminUsersService', () => ({
  fetchAdminUsers: jest.fn(),
  fetchAdminUserById: jest.fn(),
  updateAdminUserStatus: jest.fn(),
}));

const mockUsers = [
  {
    id: '1',
    name: 'Ana Beatriz Silva',
    email: 'ana@email.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '25/04/2026',
    codigo: '123456',
    department: 'Biologia',
    course: 'Fisioterapia',
    authProvider: 'LOCAL',
  },
  {
    id: '2',
    name: 'Carlos Eduardo',
    email: 'carlos@email.com',
    role: 'PROFESSOR',
    status: 'PENDING',
    createdAt: '25/04/2026',
    codigo: '654321',
    department: 'Anatomia',
    course: 'Medicina',
    authProvider: 'LOCAL',
  },
  {
    id: '3',
    name: 'Beatriz Alves',
    email: 'beatriz@email.com',
    role: 'PROFESSOR',
    status: 'PENDING',
    createdAt: '26/04/2026',
    codigo: '987654',
    department: 'Histologia',
    course: 'Enfermagem',
    authProvider: 'LOCAL',
  },
  {
    id: '4',
    name: 'Lucas Oliveira',
    email: 'lucas@email.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    createdAt: '27/04/2026',
    codigo: '432198',
    department: 'Anatomia',
    course: 'Medicina',
    authProvider: 'LOCAL',
  },
  {
    id: '5',
    name: 'Mariana Costa',
    email: 'mariana@email.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '22/04/2026',
    codigo: '112233',
    department: 'Administracao',
    course: 'Gestao',
    authProvider: 'LOCAL',
  },
  {
    id: '6',
    name: 'Rafael Sousa',
    email: 'rafael@email.com',
    role: 'PROFESSOR',
    status: 'INACTIVE',
    createdAt: '20/04/2026',
    codigo: '776655',
    department: 'Fisiologia',
    course: 'Fisioterapia',
    authProvider: 'LOCAL',
  },
] as const;

const fetchAdminUsersMock = fetchAdminUsers as jest.MockedFunction<typeof fetchAdminUsers>;
const fetchAdminUserByIdMock = fetchAdminUserById as jest.MockedFunction<typeof fetchAdminUserById>;
const updateAdminUserStatusMock = updateAdminUserStatus as jest.MockedFunction<typeof updateAdminUserStatus>;

const setupDefaultMocks = () => {
  fetchAdminUsersMock.mockResolvedValue({
    users: [...mockUsers],
    total: mockUsers.length,
    page: 1,
    limit: 10,
  });

  fetchAdminUserByIdMock.mockImplementation(async (userId: string) => {
    const user = mockUsers.find((item) => item.id === userId);
    if (!user) {
      throw new Error('Usuario nao encontrado');
    }

    return { ...user };
  });

  updateAdminUserStatusMock.mockResolvedValue();
};

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it("renderiza o título da página", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText("Gerenciar usuários")).toBeInTheDocument();
  });

  it('carrega usuarios da API e renderiza na tela', async () => {
    render(<AdminUsersPage />);

    expect(fetchAdminUsersMock).toHaveBeenCalledWith(1, 10);

    expect(await screen.findAllByText('Ana Beatriz Silva')).toHaveLength(2);
    expect(await screen.findAllByText('Carlos Eduardo')).toHaveLength(2);
  });

  it("filtra por Pendentes", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Carlos Eduardo');

    fireEvent.click(screen.getByText("Pendentes"));

    expect(screen.getAllByText("Carlos Eduardo").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Mariana Costa").length).toBe(0);
  });

  it("filtra por Ativos", async () => {
  render(<AdminUsersPage />);

  await screen.findAllByText('Ana Beatriz Silva');

  fireEvent.click(screen.getByText("Ativos"));

  const table = screen.getByRole("table");

  expect(
    within(table).getByText("Ana Beatriz Silva")
  ).toBeInTheDocument();

  expect(
    within(table).queryByText("Carlos Eduardo")
  ).not.toBeInTheDocument();
});

  it("filtra por Inativos", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Rafael Sousa');

    fireEvent.click(screen.getByText("Inativos"));

    expect(screen.getAllByText("Rafael Sousa").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Ana Beatriz Silva").length).toBe(0);
  });

  it("busca usuário por nome", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Beatriz Alves');

    const input = screen.getByPlaceholderText("Buscar por nome ou email...");

    fireEvent.change(input, {
      target: { value: "beatriz" },
    });

    expect(screen.getAllByText("Beatriz Alves").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Lucas Oliveira").length).toBe(0);
  });

  it("busca usuário por email", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Rafael Sousa');

    const input = screen.getByPlaceholderText("Buscar por nome ou email...");

    fireEvent.change(input, {
      target: { value: "rafael" },
    });

    expect(screen.getAllByText("Rafael Sousa").length).toBeGreaterThan(0);
  });

  it("abre o drawer ao clicar no botão de detalhes", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Ana Beatriz Silva');

    const buttons = screen.getAllByRole("button", {
      name: /ver detalhes/i,
    });

    fireEvent.click(buttons[0]);

    expect(
      screen.getByRole("heading", { name: /detalhes do usuário/i })
    ).toBeInTheDocument();

    expect(fetchAdminUserByIdMock).toHaveBeenCalledWith('1');
  });

  it("aprova usuário e remove da seção de pendentes", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Carlos Eduardo');

    const aprovarBtn = screen.getAllByText("Aprovar")[0];

    fireEvent.click(aprovarBtn);

    await waitFor(() => {
      expect(updateAdminUserStatusMock).toHaveBeenCalledWith('2', 'ACTIVE');
      expect(screen.queryAllByText("Carlos Eduardo").length).toBeLessThan(2);
    });
  });

  it("rejeita usuário e remove da seção de pendentes", async () => {
    render(<AdminUsersPage />);

    await screen.findAllByText('Carlos Eduardo');

    const rejeitarBtn = screen.getAllByText("Rejeitar")[0];

    fireEvent.click(rejeitarBtn);

    await waitFor(() => {
      expect(updateAdminUserStatusMock).toHaveBeenCalledWith('2', 'INACTIVE');
      expect(screen.queryAllByText("Carlos Eduardo").length).toBeLessThan(2);
    });
  });
});