jest.mock("../../../app/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
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

  it("renders the question bank empty state and professor identity", () => {
    render(<QuestionsPage />);

    expect(screen.getByRole("heading", { name: /Banco de Quest/i })).toBeInTheDocument();
    expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByLabelText(/Joana Batista/i)).toHaveTextContent("JB");
    expect(screen.getByRole("heading", { name: /Nenhuma quest/i })).toBeInTheDocument();
    expect(screen.queryByText(/geradas por IA/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Filtrar por origem/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /Origem/i })).not.toBeInTheDocument();
  });
});
