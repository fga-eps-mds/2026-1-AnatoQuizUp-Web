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
});
