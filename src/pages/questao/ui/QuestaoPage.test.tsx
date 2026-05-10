jest.mock("../../../app/providers/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../features/manage-questions", () => ({
  listarQuestoesProfessor: jest.fn(),
}));

import { render, screen } from "@testing-library/react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { listarQuestoesProfessor } from "../../../features/manage-questions";
import type { User } from "../../../entities/user/model/types";
import { QuestionsPage } from "./QuestaoPage";

const useAuthMock = useAuth as jest.Mock;
const listarQuestoesProfessorMock = listarQuestoesProfessor as jest.Mock;

const professor: User = {
  id: "professor-1",
  name: "Joana Batista",
  email: "joana@unb.br",
  role: "PROFESSOR",
  status: "ACTIVE",
  authProvider: "LOCAL",
};

const mockQuestion = {
  id: "questao-mock-001",
  enunciado:
    "Em uma radiografia de torax, qual sinal radiologico diferencia atelectasia de consolidacao pulmonar?",
  tipoQuestao: "MULTIPLA_ESCOLHA",
  respostaCorreta: "C",
  saibaMais: null,
  status: "ATIVO",
  feitoPorIa: false,
  urlImagem: null,
  criadoPorId: "professor-1",
  temaId: "tema-imagem",
  questaoOriginalId: null,
  tema: {
    id: "tema-imagem",
    nome: "Imagem",
    criadoEm: "2025-03-01T12:00:00.000Z",
    atualizadoEm: "2025-03-01T12:00:00.000Z",
    excluidoEm: null,
  },
  alternativas: null,
  criadoEm: "2025-03-31T10:00:00.000Z",
  atualizadoEm: "2025-03-31T10:00:00.000Z",
  excluidoEm: null,
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

    listarQuestoesProfessorMock.mockResolvedValue({
      questoes: [mockQuestion],
      total: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads professor questions from the service and keeps the current table layout", async () => {
    render(<QuestionsPage />);

    expect(screen.getByRole("heading", { name: /Banco de Quest/i })).toBeInTheDocument();
    expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByLabelText(/Joana Batista/i)).toHaveTextContent("JB");
    expect(await screen.findByText(/atelectasia/i)).toBeInTheDocument();
    expect(screen.getByText(/1 quest/i)).toBeInTheDocument();
    expect(screen.getAllByText("Imagem").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Médio").length).toBeGreaterThan(0);
    expect(screen.getByText("31/03/2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Editar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Excluir/i })).toBeInTheDocument();
    expect(listarQuestoesProfessorMock).toHaveBeenCalledTimes(1);
  });

  it("renders the empty state when the service returns no questions", async () => {
    listarQuestoesProfessorMock.mockResolvedValueOnce({
      questoes: [],
      total: 0,
    });

    render(<QuestionsPage />);

    expect(await screen.findByRole("heading", { name: /Nenhuma quest/i })).toBeInTheDocument();
    expect(screen.queryByText(/geradas por IA/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Filtrar por origem/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /Origem/i })).not.toBeInTheDocument();
  });
});
