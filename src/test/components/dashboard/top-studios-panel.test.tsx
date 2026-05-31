import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { TopStudiosPanel } from "@/src/components/dashboard/top-studios-panel";
import { server } from "@/src/test/mocks/server";
import { renderWithQuery } from "@/src/test/utils";

describe("TopStudiosPanel", () => {
  it("exibe skeleton durante o carregamento", () => {
    renderWithQuery(<TopStudiosPanel />);
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("renderiza no máximo 3 estúdios mesmo com mais na API", async () => {
    renderWithQuery(<TopStudiosPanel />);
    await waitFor(() =>
      expect(screen.getByText("Columbia Pictures")).toBeInTheDocument()
    );
    expect(screen.getByText("Paramount Pictures")).toBeInTheDocument();
    expect(screen.getByText("Warner Bros.")).toBeInTheDocument();
    // O 4º estúdio do handler não deve aparecer
    expect(screen.queryByText("Universal Pictures")).not.toBeInTheDocument();
  });

  it("renderiza badges de ranking 1, 2, 3", async () => {
    renderWithQuery(<TopStudiosPanel />);
    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("exibe a contagem de vitórias do primeiro estúdio", async () => {
    renderWithQuery(<TopStudiosPanel />);
    await waitFor(() => expect(screen.getByText("7")).toBeInTheDocument());
  });

  it("exibe cabeçalhos de tabela corretos", async () => {
    renderWithQuery(<TopStudiosPanel />);
    await waitFor(() =>
      expect(screen.getByText("Name")).toBeInTheDocument()
    );
    expect(screen.getByText("Win Count")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/studiosWithWinCount",
        () => HttpResponse.error()
      )
    );
    renderWithQuery(<TopStudiosPanel />);
    await waitFor(() =>
      expect(
        screen.getByText(/No data could be loaded/)
      ).toBeInTheDocument()
    );
  });

  it("exibe lista vazia quando a API retorna zero estúdios", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/studiosWithWinCount",
        () => HttpResponse.json({ studios: [] })
      )
    );
    renderWithQuery(<TopStudiosPanel />);
    await waitFor(() =>
      expect(screen.getByText(/No data available/)).toBeInTheDocument()
    );
  });
});
