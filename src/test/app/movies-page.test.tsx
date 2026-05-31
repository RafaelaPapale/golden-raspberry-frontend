import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MoviesPage from "@/src/app/movies/page";
import { renderWithQuery } from "@/src/test/utils";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: vi.fn((_key: string): string | null => null),
    toString: () => "",
  }),
  useRouter: () => ({ push: vi.fn() }),
}));

describe("MoviesPage", () => {
  it("renderiza o título Lista de filmes", () => {
    renderWithQuery(<MoviesPage />);
    expect(
      screen.getByRole("heading", { name: "Movies List" })
    ).toBeInTheDocument();
  });

  it("renderiza a descrição da página", () => {
    renderWithQuery(<MoviesPage />);
    expect(
      screen.getByText(/All nominees and winners/)
    ).toBeInTheDocument();
  });

  it("renderiza os controles de filtro", async () => {
    renderWithQuery(<MoviesPage />);
    await waitFor(() =>
      expect(screen.getByLabelText("Year")).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Filter by winner")).toBeInTheDocument();
  });

  it("renderiza a tabela de filmes após carregar", async () => {
    renderWithQuery(<MoviesPage />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
  });

  it("exibe controles de paginação", async () => {
    renderWithQuery(<MoviesPage />);
    await waitFor(() =>
      expect(screen.getByLabelText("Página anterior")).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });
});
