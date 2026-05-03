jest.mock("../../../app/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "../../../app/providers/AuthProvider";
import type { User } from "../../../entities/user/model/types";
import { QuestionsPage } from "./QuestaoPage";

const useAuthMock = useAuth as jest.Mock;

const professor: User = {
  id: "professor-1",
  name: "Joana Batista",
  email: "joana@unb.br",
  role: "PROFESSOR",
  status: "ACTIVE",
  authProvider: "LOCAL",
};

describe("QuestionsPage", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      user: professor,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the question bank summary and professor identity", () => {
    render(<QuestionsPage />);

    expect(
      screen.getByRole("heading", { name: /Banco de Questões/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByLabelText(/Usuário Joana Batista/i)).toHaveTextContent(
      "JB",
    );
    expect(screen.getByText(/2 questões cadastradas/i)).toBeInTheDocument();
    expect(screen.queryByText(/geradas por IA/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Filtrar por origem/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /Origem/i })).not.toBeInTheDocument();
  });

  it("filters questions by search term", async () => {
    const testUser = userEvent.setup();

    render(<QuestionsPage />);

    const search = screen.getByRole("textbox", { name: /Buscar questão/i });
    expect(screen.getByText(/atelectasia/i)).toBeInTheDocument();

    await testUser.clear(search);
    await testUser.type(search, "ecocardiografia");

    expect(screen.getByText(/janela acústica/i)).toBeInTheDocument();
    expect(screen.queryByText(/atelectasia/i)).not.toBeInTheDocument();
    expect(screen.getByText("1 resultado(s)")).toBeInTheDocument();
  });
});
