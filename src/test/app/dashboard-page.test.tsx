import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "@/src/app/page";
import { renderWithQuery } from "@/src/test/utils";

describe("DashboardPage", () => {
  it("renderiza o título Dashboard", () => {
    renderWithQuery(<DashboardPage />);
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renderiza a descrição da página", () => {
    renderWithQuery(<DashboardPage />);
    expect(
      screen.getByText(/Nominees and Winners of the Worst Picture Category/)
    ).toBeInTheDocument();
  });

  it("renderiza o painel de anos com múltiplos vencedores", async () => {
    renderWithQuery(<DashboardPage />);
    await waitFor(() =>
      expect(
        screen.getByText("List year with multiple winners")
      ).toBeInTheDocument()
    );
  });

  it("renderiza o painel de top estúdios", async () => {
    renderWithQuery(<DashboardPage />);
    await waitFor(() =>
      expect(
        screen.getByText("Top 3 studios with winners")
      ).toBeInTheDocument()
    );
  });

  it("renderiza o painel de intervalos de produtores", async () => {
    renderWithQuery(<DashboardPage />);
    await waitFor(() =>
      expect(
        screen.getByText(/Producers with longest and shortest intervals/)
      ).toBeInTheDocument()
    );
  });

  it("renderiza o painel de vencedores por ano", async () => {
    renderWithQuery(<DashboardPage />);
    await waitFor(() =>
      expect(screen.getByText("List movie winners by year")).toBeInTheDocument()
    );
  });

  it("exibe os dados de todos os painéis após carregamento", async () => {
    renderWithQuery(<DashboardPage />);
    // Anos com múltiplos vencedores
    await waitFor(() =>
      expect(screen.getByText("1986")).toBeInTheDocument()
    );
    // Top estúdios
    expect(screen.getByText("Columbia Pictures")).toBeInTheDocument();
    // Intervalos de produtores
    expect(screen.getByText("Joel Silver")).toBeInTheDocument();
  });
});
