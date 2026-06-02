import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DashboardAlunoPage } from "./index";
import { httpClient } from "../../shared/api/httpClient";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../../shared/api/httpClient", () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("DashboardAlunoPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o estado de carregamento inicialmente", () => {
    (httpClient.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Carregando seu progresso...")).toBeInTheDocument();
  });

  it("deve renderizar o empty state quando não houver questões respondidas", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { totalRespondidas: 0, porTema: [] },
    });

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma questão respondida ainda!")).toBeInTheDocument();
    });
  });

  it("deve navegar para escolha de quiz ao clicar no botão do estado vazio", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { totalRespondidas: 0, porTema: [] },
    });

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Fazer Primeira Questão")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Fazer Primeira Questão"));

    expect(mockNavigate).toHaveBeenCalledWith("/aluno/quiz/escolha");
  });

  it("deve exibir estado vazio quando ocorrer erro ao carregar dashboard", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    (httpClient.get as jest.Mock).mockRejectedValue(new Error("Erro ao carregar dashboard"));

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Nenhuma questão respondida ainda!")).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  it("deve renderizar o dashboard com as métricas e barras quando houver dados", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: {
        totalRespondidas: 42,
        totalAcertos: 30,
        totalErros: 12,
        taxaAcerto: 71,
        porTema: [
          {
            temaId: "1",
            nome: "Tórax",
            totalRespondidas: 20,
            acertos: 15,
            erros: 5,
            taxaAcerto: 75,
            status: "Tranquilo",
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dashboard de Evolução")).toBeInTheDocument();
    });

    expect(screen.getByText("Questões Respondidas")).toBeInTheDocument();
    expect(screen.getAllByText("42")).toHaveLength(2);
    expect(screen.getByText((_, element) => element?.textContent === "71%")).toBeInTheDocument();
    expect(screen.getAllByText("Tórax")).toHaveLength(2);
    expect(screen.getByText("Tranquilo")).toBeInTheDocument();
  });

  it("deve renderizar temas com status Atenção e Crítico", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: {
        totalRespondidas: 30,
        totalAcertos: 15,
        totalErros: 15,
        taxaAcerto: 50,
        porTema: [
          {
            temaId: "1",
            nome: "Neuroanatomia",
            totalRespondidas: 10,
            acertos: 6,
            erros: 4,
            taxaAcerto: 60,
            status: "Atenção",
          },
          {
            temaId: "2",
            nome: "Abdome",
            totalRespondidas: 20,
            acertos: 4,
            erros: 16,
            taxaAcerto: 20,
            status: "Crítico",
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dashboard de Evolução")).toBeInTheDocument();
    });

    expect(screen.getAllByText("Neuroanatomia")).toHaveLength(2);
    expect(screen.getAllByText("Abdome")).toHaveLength(2);
    expect(screen.getByText("Atenção")).toBeInTheDocument();
    expect(screen.getByText("Crítico")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "60%")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "20%")).toBeInTheDocument();
  });
});