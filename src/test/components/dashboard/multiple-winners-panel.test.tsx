import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { MultipleWinnersPanel } from "@/src/components/dashboard/multiple-winners-panel";
import { server } from "@/src/test/mocks/server";
import { renderWithQuery } from "@/src/test/utils";

describe("MultipleWinnersPanel", () => {
  it("exibe skeleton durante o carregamento", () => {
    renderWithQuery(<MultipleWinnersPanel />);
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("renderiza anos com múltiplos vencedores após carregar", async () => {
    renderWithQuery(<MultipleWinnersPanel />);
    await waitFor(() => expect(screen.getByText("1986")).toBeInTheDocument());
    expect(screen.getByText("1990")).toBeInTheDocument();
  });

  it("renderiza a contagem de vencedores de cada ano", async () => {
    renderWithQuery(<MultipleWinnersPanel />);
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("exibe cabeçalhos de tabela corretos", async () => {
    renderWithQuery(<MultipleWinnersPanel />);
    await waitFor(() =>
      expect(screen.getByText("Year")).toBeInTheDocument()
    );
    expect(screen.getByText("Win Count")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/yearsWithMultipleWinners",
        () => HttpResponse.error()
      )
    );
    renderWithQuery(<MultipleWinnersPanel />);
    await waitFor(() =>
      expect(
        screen.getByText(/No data could be loaded/)
      ).toBeInTheDocument()
    );
  });

  it("exibe mensagem de lista vazia quando a API retorna zero anos", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/yearsWithMultipleWinners",
        () => HttpResponse.json({ years: [] })
      )
    );
    renderWithQuery(<MultipleWinnersPanel />);
    await waitFor(() =>
      expect(screen.getByText(/No data available/)).toBeInTheDocument()
    );
  });
});
