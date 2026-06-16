import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DashboardAlunoPage } from "../../../../src/pages/dashboardAluno/index";
import { httpClient } from "../../../../src/shared/api/httpClient";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../../../../src/shared/api/httpClient", () => ({
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

  it("deve renderizar o empty state quando não houver questões respondidas nem listas", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: { totalRespondidas: 0, porTema: [], porLista: [] },
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
      data: { totalRespondidas: 0, porTema: [], porLista: [] },
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

  it("deve renderizar o dashboard com as métricas de temas quando houver dados", async () => {
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
        porLista: [],
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
        porLista: [],
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
  });

  it("deve renderizar a seção de desempenho por listas", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: {
        totalRespondidas: 10,
        totalAcertos: 5,
        totalErros: 5,
        taxaAcerto: 50,
        porTema: [],
        porLista: [
          {
            listaTurmaId: "lista-123",
            nomeLista: "Simulado de Neuro",
            totalQuestoes: 10,
            acertos: 8,
            taxaAcerto: 80,
            status: "SUBMETIDA",
            submissaoEm: "2026-06-14T10:00:00Z",
            prazo: "2026-06-20T23:59:00Z",
          }
        ],
      },
    });

    render(
      <BrowserRouter>
        <DashboardAlunoPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Desempenho nas Listas")).toBeInTheDocument();
    });

    expect(screen.getByText("Simulado de Neuro")).toBeInTheDocument();
    expect(screen.getByText("Respondida")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("deve renderizar as listas com status alternativos e prazos expirados (cobre linhas do switch)", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      data: {
        totalRespondidas: 10,
        totalAcertos: 5,
        totalErros: 5,
        taxaAcerto: 50,
        porTema: [],
        porLista: [
          {
            listaTurmaId: "lista-andamento",
            nomeLista: "Lista em Andamento",
            totalQuestoes: 10,
            acertos: 1,
            taxaAcerto: 10,
            status: "EM_ANDAMENTO",
            submissaoEm: null,
            prazo: "2099-12-31T23:59:00Z",
          },
          {
            listaTurmaId: "lista-atrasada",
            nomeLista: "Lista Atrasada",
            totalQuestoes: 10,
            acertos: 0,
            taxaAcerto: 0,
            status: "NAO_RESPONDEU",
            submissaoEm: null,
            prazo: "2000-01-01T00:00:00Z", // Prazo antigo para testar condicional expirado
          },
          {
            listaTurmaId: "lista-desconhecida",
            nomeLista: "Lista Bugada",
            totalQuestoes: 10,
            acertos: 0,
            taxaAcerto: 0,
            status: "STATUS_INVENTADO", // Testa o default do switch
            submissaoEm: null,
            prazo: null, // Testa sem prazo
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
      expect(screen.getByText("Desempenho nas Listas")).toBeInTheDocument();
    });

    // Testa EM_ANDAMENTO
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
    
    // Testa NAO_RESPONDEU (e verifica se aparece os traços '-')
    expect(screen.getByText("Não respondeu")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);

    // Testa o default (Renderiza exatamente a string bizarra enviada pelo backend)
    expect(screen.getByText("STATUS_INVENTADO")).toBeInTheDocument();
    
    // Testa o condicional de data nula
    expect(screen.getByText("Sem prazo")).toBeInTheDocument();
  });
});