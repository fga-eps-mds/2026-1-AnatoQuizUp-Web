import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminUsersPage } from "./AdminUsersPage";

describe("AdminUsersPage", () => {
  it("renderiza o título da página", () => {
    render(<AdminUsersPage />);
    expect(screen.getByText("Gerenciar usuários")).toBeInTheDocument();
  });

  it("renderiza usuários na tela", () => {
    render(<AdminUsersPage />);

    expect(screen.getAllByText("Ana Beatriz Silva").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Carlos Eduardo").length).toBeGreaterThan(0);
  });

  it("filtra por Pendentes", () => {
    render(<AdminUsersPage />);

    fireEvent.click(screen.getByText("Pendentes"));

    expect(screen.getAllByText("Carlos Eduardo").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Mariana Costa").length).toBe(0);
  });

  it("filtra por Ativos", () => {
  render(<AdminUsersPage />);

  fireEvent.click(screen.getByText("Ativos"));

  const table = screen.getByRole("table");

  expect(
    within(table).getByText("Ana Beatriz Silva")
  ).toBeInTheDocument();

  expect(
    within(table).queryByText("Carlos Eduardo")
  ).not.toBeInTheDocument();
});

  it("filtra por Inativos", () => {
    render(<AdminUsersPage />);

    fireEvent.click(screen.getByText("Inativos"));

    expect(screen.getAllByText("Rafael Sousa").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Ana Beatriz Silva").length).toBe(0);
  });

  it("busca usuário por nome", () => {
    render(<AdminUsersPage />);

    const input = screen.getByPlaceholderText("Buscar por nome ou email...");

    fireEvent.change(input, {
      target: { value: "beatriz" },
    });

    expect(screen.getAllByText("Beatriz Alves").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Lucas Oliveira").length).toBe(0);
  });

  it("busca usuário por email", () => {
    render(<AdminUsersPage />);

    const input = screen.getByPlaceholderText("Buscar por nome ou email...");

    fireEvent.change(input, {
      target: { value: "rafael" },
    });

    expect(screen.getAllByText("Rafael Sousa").length).toBeGreaterThan(0);
  });

  it("abre o drawer ao clicar no botão de detalhes", () => {
    render(<AdminUsersPage />);

    const buttons = screen.getAllByRole("button", {
      name: /ver detalhes/i,
    });

    fireEvent.click(buttons[0]);

    expect(
      screen.getByRole("heading", { name: /detalhes do usuário/i })
    ).toBeInTheDocument();
  });

  it("aprova usuário e remove da seção de pendentes", () => {
    render(<AdminUsersPage />);

    const aprovarBtn = screen.getAllByText("Aprovar")[0];

    fireEvent.click(aprovarBtn);

    // seção de pendentes deve diminuir ou sumir
    expect(screen.queryAllByText("Carlos Eduardo").length).toBeLessThan(2);
  });

  it("rejeita usuário e remove da seção de pendentes", () => {
    render(<AdminUsersPage />);

    const rejeitarBtn = screen.getAllByText("Rejeitar")[0];

    fireEvent.click(rejeitarBtn);

    expect(screen.queryAllByText("Carlos Eduardo").length).toBeLessThan(2);
  });

  it("remove completamente seção de pendentes quando não há mais", () => {
    render(<AdminUsersPage />);

    const aprovarBtns = screen.getAllByText("Aprovar");

    // aprova todos pendentes
    aprovarBtns.forEach((btn) => fireEvent.click(btn));

    expect(
      screen.queryByText("Aguardando aprovação")
    ).not.toBeInTheDocument();
  });
});