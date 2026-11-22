jest.mock("../../../../../src/features/manage-casos-osce/model/casoOsceService", () => ({
  listarCasosOsce: jest.fn(),
  criarCasoOsce: jest.fn(),
  atualizarCasoOsce: jest.fn(),
  buscarCasoOscePorId: jest.fn(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  atualizarCasoOsce,
  criarCasoOsce,
  listarCasosOsce,
} from "../../../../../src/features/manage-casos-osce/model/casoOsceService";
import type { CasoOsce } from "../../../../../src/features/manage-casos-osce/model/types";
import { OsceCasosPage } from "../../../../../src/pages/professor/osce/ui/OsceCasosPage";

const listarCasosOsceMock = listarCasosOsce as jest.Mock;
const criarCasoOsceMock = criarCasoOsce as jest.Mock;
const atualizarCasoOsceMock = atualizarCasoOsce as jest.Mock;

const casoBase: CasoOsce = {
  id: "caso-1",
  titulo: "Dor torácica",
  especialidade: "Cardiologia",
  dificuldade: "MEDIA",
  diagnosticoEsperado: "Infarto",
  local: "Pronto-socorro",
  papelEstudante: "Médico(a)",
  idadePaciente: 58,
  sexoPaciente: "Masculino",
  queixaPaciente: "Dor no peito",
  perfilPaciente: "Perfil",
  historiaSintomas: "História",
  exameFisico: "Exame",
  status: "PUBLICADO",
  exames: [],
  criadoEm: "2026-01-01T00:00:00.000Z",
};

const casoRascunhoVazio: CasoOsce = {
  ...casoBase,
  id: "caso-novo",
  titulo: null,
  especialidade: null,
  dificuldade: null,
  diagnosticoEsperado: null,
  local: null,
  papelEstudante: null,
  idadePaciente: null,
  sexoPaciente: null,
  queixaPaciente: null,
  perfilPaciente: null,
  historiaSintomas: null,
  exameFisico: null,
  status: "RASCUNHO",
};

describe("OsceCasosPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lista os casos cadastrados", async () => {
    listarCasosOsceMock.mockResolvedValue([casoBase]);

    render(<OsceCasosPage />);

    expect(await screen.findByText("Dor torácica")).toBeInTheDocument();
    expect(screen.getByText("Cardiologia")).toBeInTheDocument();
  });

  it("mostra o estado vazio quando nao ha casos", async () => {
    listarCasosOsceMock.mockResolvedValue([]);

    render(<OsceCasosPage />);

    expect(await screen.findByText("Nenhum caso cadastrado")).toBeInTheDocument();
  });

  it("cria um rascunho ao clicar em 'Novo caso' e salva o passo 1 ao avançar", async () => {
    const user = userEvent.setup();
    listarCasosOsceMock.mockResolvedValue([]);
    criarCasoOsceMock.mockResolvedValue(casoRascunhoVazio);
    atualizarCasoOsceMock.mockResolvedValue({ ...casoRascunhoVazio, titulo: "Novo título" });

    render(<OsceCasosPage />);

    await user.click(await screen.findByRole("button", { name: /novo caso/i }));

    await waitFor(() => expect(criarCasoOsceMock).toHaveBeenCalledWith({}));

    const tituloInput = await screen.findByPlaceholderText(/dor torácica no pronto-socorro/i);
    await user.type(tituloInput, "Novo título");

    await user.click(screen.getByRole("button", { name: /próximo/i }));

    await waitFor(() =>
      expect(atualizarCasoOsceMock).toHaveBeenCalledWith(
        "caso-novo",
        expect.objectContaining({ titulo: "Novo título" }),
      ),
    );

    expect(await screen.findByText("Contextualização", { selector: "span" })).toBeInTheDocument();
  });

  it("mostra erro quando falha ao listar os casos", async () => {
    listarCasosOsceMock.mockRejectedValue(new Error("Serviço indisponível"));

    render(<OsceCasosPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Serviço indisponível");
  });

  it("mostra erro e fecha o modal quando falha ao criar o rascunho", async () => {
    const user = userEvent.setup();
    listarCasosOsceMock.mockResolvedValue([]);
    criarCasoOsceMock.mockRejectedValue(new Error("Falha ao criar"));

    render(<OsceCasosPage />);

    await user.click(await screen.findByRole("button", { name: /novo caso/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao criar");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre um caso em rascunho (Continuar), percorre os 3 passos, gerencia exames e conclui", async () => {
    const user = userEvent.setup();
    const casoRascunhoCompleto: CasoOsce = { ...casoBase, status: "RASCUNHO" };
    listarCasosOsceMock.mockResolvedValue([casoRascunhoCompleto]);
    atualizarCasoOsceMock.mockResolvedValue(casoRascunhoCompleto);

    render(<OsceCasosPage />);

    await user.click(await screen.findByRole("button", { name: /continuar/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dor torácica")).toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText(/ex: cardiologia/i));
    await user.type(screen.getByPlaceholderText(/ex: cardiologia/i), "Cardiologia infantil");
    await user.selectOptions(screen.getByDisplayValue("Médio"), "DIFICIL");
    await user.type(screen.getByPlaceholderText(/infarto agudo do miocárdio/i), " grave");
    await user.click(screen.getByRole("button", { name: /próximo/i }));

    await waitFor(() =>
      expect(atualizarCasoOsceMock).toHaveBeenCalledWith(
        "caso-1",
        expect.objectContaining({ especialidade: "Cardiologia infantil", dificuldade: "DIFICIL" }),
      ),
    );
    // Passo 2: campo "Local" so existe na Contextualização.
    expect(await screen.findByDisplayValue("Pronto-socorro")).toBeInTheDocument();
    await user.type(screen.getByDisplayValue("Pronto-socorro"), " de nível terciário");
    await user.type(screen.getByDisplayValue("Médico(a)"), ", residente");
    await user.clear(screen.getByDisplayValue("58"));
    await user.type(screen.getByDisplayValue(""), "60");
    await user.type(screen.getByDisplayValue("Masculino"), " cis");
    await user.type(screen.getByDisplayValue("Dor no peito"), " irradiando");

    await user.click(screen.getByRole("button", { name: /voltar/i }));
    // De volta ao passo 1: campo "Diagnóstico esperado" so existe nos Dados gerais.
    expect(await screen.findByDisplayValue("Infarto grave")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /próximo/i }));
    await user.click(screen.getByRole("button", { name: /próximo/i }));

    // Passo 3: campo "Perfil do paciente" so existe no Roteiro do paciente.
    expect(await screen.findByDisplayValue("Perfil")).toBeInTheDocument();
    await user.type(screen.getByDisplayValue("Perfil"), " detalhado");
    await user.type(screen.getByDisplayValue("História"), " clínica");
    await user.type(screen.getByDisplayValue("Exame"), " físico");
    await user.click(screen.getByRole("button", { name: /adicionar exame/i }));
    await user.type(screen.getByLabelText("Nome do exame 1"), "Hemograma");
    await user.type(screen.getByLabelText("Resultado do exame 1"), "Normal");
    await user.click(screen.getByRole("button", { name: /adicionar exame/i }));
    await user.click(screen.getByLabelText("Remover exame 2"));

    await user.click(screen.getByRole("button", { name: /concluir rascunho/i }));

    await waitFor(() =>
      expect(atualizarCasoOsceMock).toHaveBeenLastCalledWith(
        "caso-1",
        expect.objectContaining({
          exames: [{ nome: "Hemograma", resultado: "Normal" }],
        }),
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra erro quando o autosave falha e fecha o modal pelo X salvando o passo atual", async () => {
    const user = userEvent.setup();
    listarCasosOsceMock.mockResolvedValue([casoBase]);
    atualizarCasoOsceMock.mockRejectedValue(new Error("Falha ao salvar"));

    render(<OsceCasosPage />);

    await user.click(await screen.findByRole("button", { name: /ver/i }));
    await user.click(screen.getByRole("button", { name: /fechar e salvar rascunho/i }));

    await waitFor(() => expect(atualizarCasoOsceMock).toHaveBeenCalledWith("caso-1", expect.anything()));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao salvar");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
