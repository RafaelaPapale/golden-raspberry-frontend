import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { WinnersByYearPanel } from "@/src/components/dashboard/winners-by-year-panel";
import { server } from "@/src/test/mocks/server";
import { renderWithQuery } from "@/src/test/utils";

describe("WinnersByYearPanel — estado inicial", () => {
  it("exibe mensagem orientando digitar um ano", () => {
    renderWithQuery(<WinnersByYearPanel />);
    expect(
      screen.getByText("Search by year")
    ).toBeInTheDocument();
  });

  it("tem input de ano com type=number", () => {
    renderWithQuery(<WinnersByYearPanel />);
    const input = screen.getByLabelText("Year");
    expect(input).toHaveAttribute("type", "number");
  });

  it("tem botão de busca", () => {
    renderWithQuery(<WinnersByYearPanel />);
    expect(
      screen.getByRole("button", { name: "Search" })
    ).toBeInTheDocument();
  });
});

describe("WinnersByYearPanel — busca", () => {
  it("exibe vencedores ao buscar ano com resultados", async () => {
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.type(screen.getByLabelText("Year"), "1984");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
  });

  it("exibe colunas ID e Título na tabela de resultados", async () => {
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.type(screen.getByLabelText("Year"), "1984");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(screen.getByText("ID")).toBeInTheDocument()
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("exibe mensagem de nenhum vencedor para ano sem resultados", async () => {
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.type(screen.getByLabelText("Year"), "2099");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(screen.getByText(/No winners in 2099/)).toBeInTheDocument()
    );
  });

  it("exibe mensagem de erro quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/winnersByYear",
        () => HttpResponse.error()
      )
    );
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.type(screen.getByLabelText("Year"), "1984");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(
        screen.getByText(/Unable to fetch winners/)
      ).toBeInTheDocument()
    );
  });
});

describe("WinnersByYearPanel — validação de entrada", () => {
  it("não dispara busca para ano zero", async () => {
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.type(screen.getByLabelText("Year"), "0");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(
      screen.getByText("Search by year")
    ).toBeInTheDocument();
  });

  it("não dispara busca para valor vazio", async () => {
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(
      screen.getByText("Search by year")
    ).toBeInTheDocument();
  });

  it("botão fica desabilitado enquanto está buscando", async () => {
    // Atrasa a resposta para capturar o estado intermediário isFetching=true
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/winnersByYear",
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 150));
          return HttpResponse.json([]);
        }
      )
    );
    const user = userEvent.setup();
    renderWithQuery(<WinnersByYearPanel />);
    await user.type(screen.getByLabelText("Year"), "1984");
    // Inicia o click mas não aguarda — precisamos checar antes da resposta
    user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Search" })
      ).toBeDisabled()
    );
  });
});
