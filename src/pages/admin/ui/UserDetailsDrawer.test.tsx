import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { UserDetailsDrawer } from "./UserDetailsDrawer";
import type { AdminUser } from "../../../entities/user/model/types";

const baseUser: AdminUser = {
  id: "1",
  name: "Carlos Eduardo",
  email: "carlos@email.com",
  role: "PROFESSOR",
  status: "PENDING",
  createdAt: "25/04/2026",
  codigo: "123",
  department: "Anatomia",
  course: "Medicina",
  authProvider: "LOCAL",
};

describe("UserDetailsDrawer", () => {
  it("não renderiza quando fechado", () => {
    render(
      <UserDetailsDrawer
        user={baseUser}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByText("Detalhes do usuário")).not.toBeInTheDocument();
  });

  it("renderiza dados do usuário corretamente", () => {
    render(
      <UserDetailsDrawer
        user={baseUser}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText("carlos@email.com")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();

    // 👇 resolve o problema de duplicidade com contexto
    const infoSection = screen.getByText("Email").closest("div")!;
    expect(within(infoSection).getByText("carlos@email.com")).toBeInTheDocument();
  });

  it("mostra labels corretos para PROFESSOR e PENDING", () => {
    render(
      <UserDetailsDrawer
        user={baseUser}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Professor")).toBeInTheDocument();
    expect(screen.getByText("Aguardando")).toBeInTheDocument();
  });

  it("renderiza botões de aprovação quando PENDING", () => {
    render(
      <UserDetailsDrawer
        user={baseUser}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Aprovar usuário")).toBeInTheDocument();
    expect(screen.getByText("Rejeitar usuário")).toBeInTheDocument();
  });

  it("renderiza botões de ação quando ACTIVE", () => {
    render(
      <UserDetailsDrawer
        user={{ ...baseUser, status: "ACTIVE" }}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Desativar usuário")).toBeInTheDocument();
    expect(screen.getByText("Reativar usuário")).toBeInTheDocument();
  });

  it("desabilita botão quando INACTIVE", () => {
    render(
      <UserDetailsDrawer
        user={{ ...baseUser, status: "INACTIVE" }}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const btn = screen.getByText("Desativar usuário");
    expect(btn).toBeDisabled();
  });

  it("chama onClose ao clicar no overlay", () => {
    const onClose = jest.fn();

    render(
      <UserDetailsDrawer
        user={baseUser}
        isOpen={true}
        onClose={onClose}
      />
    );

    const overlay = document.querySelector(".bg-black\\/30");
    fireEvent.click(overlay!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao clicar no botão X", () => {
    const onClose = jest.fn();

    render(
      <UserDetailsDrawer
        user={baseUser}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText("✕"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});