import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MoviesList } from "@/src/components/movies/movies-list";
import { server } from "@/src/test/mocks/server";
import { renderWithQuery } from "@/src/test/utils";

const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn((_key: string): string | null => null);

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockSearchParamsGet,
    toString: () => "",
  }),
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockClear();
  mockSearchParamsGet.mockReset().mockReturnValue(null);
});

describe("MoviesList — carregamento", () => {
  it("exibe skeleton durante o carregamento", () => {
    renderWithQuery(<MoviesList />);
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("renderiza a tabela de filmes após carregar", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    expect(
      screen.getByText("Rambo: First Blood Part II")
    ).toBeInTheDocument();
    expect(screen.getByText("Howard the Duck")).toBeInTheDocument();
  });

  it("exibe cabeçalhos Ano, Título e Vencedor", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Year")).toBeInTheDocument()
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Winner")).toBeInTheDocument();
  });
});

describe("MoviesList — vencedores", () => {
  it("exibe badge 'Sim' apenas para filmes vencedores", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    // Bolero (winner) e Howard the Duck (winner) = 2 badges
    expect(screen.getAllByText("Yes")).toHaveLength(2);
  });

  it("não exibe badge para filmes não-vencedores", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(
        screen.getByText("Rambo: First Blood Part II")
      ).toBeInTheDocument()
    );
    // Apenas 2 vencedores, então só 2 badges
    expect(screen.getAllByText("Yes")).toHaveLength(2);
  });
});

describe("MoviesList — estados de erro e vazio", () => {
  it("exibe alerta de erro quando a API falha", async () => {
    server.use(
      http.get("https://challenge.outsera.tech/api/movies", () =>
        HttpResponse.error()
      )
    );
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toBeInTheDocument()
    );
    expect(
      screen.getByText(/Unable to load movies/)
    ).toBeInTheDocument();
  });

  it("exibe mensagem de lista vazia quando não há filmes", async () => {
    server.use(
      http.get("https://challenge.outsera.tech/api/movies", () =>
        HttpResponse.json({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 15,
          first: true,
          last: true,
          numberOfElements: 0,
        })
      )
    );
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(
        screen.getByText(/No movies found/)
      ).toBeInTheDocument()
    );
  });
});

describe("MoviesList — filtros", () => {
  it("exibe campo de filtro por ano e select de vencedor", async () => {
    renderWithQuery(<MoviesList />);
    expect(screen.getByLabelText("Year")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by winner")).toBeInTheDocument();
  });

  it("navega com year= ao submeter o filtro de ano", async () => {
    const user = userEvent.setup();
    renderWithQuery(<MoviesList />);
    await user.type(screen.getByLabelText("Year"), "1984");
    await user.click(
      screen.getByRole("button", { name: "Apply year filter" })
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("year=1984")
    );
  });

  it("não navega ao submeter ano inválido (zero)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<MoviesList />);
    await user.type(screen.getByLabelText("Year"), "0");
    await user.click(
      screen.getByRole("button", { name: "Apply year filter" })
    );
    // Com ano inválido, exclui year= da URL
    const call = mockPush.mock.calls[0]?.[0] ?? "";
    expect(call).not.toContain("year=");
  });

  it("não exibe botão Limpar filtros sem filtros ativos", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    expect(
      screen.queryByLabelText("Limpar filtros")
    ).not.toBeInTheDocument();
  });

  it("exibe botão Limpar filtros quando há filtro ativo", async () => {
    mockSearchParamsGet.mockImplementation((key: string) =>
      key === "winner" ? "true" : null
    );
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByLabelText("Clear filters")).toBeInTheDocument()
    );
  });

  it("Limpar filtros navega para ?", async () => {
    mockSearchParamsGet.mockImplementation((key: string) =>
      key === "year" ? "1984" : null
    );
    const user = userEvent.setup();
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByLabelText("Clear filters")).toBeInTheDocument()
    );
    await user.click(screen.getByLabelText("Clear filters"));
    expect(mockPush).toHaveBeenCalledWith("?");
  });
});

describe("MoviesList — paginação", () => {
  it("exibe controles de paginação quando há dados", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Página anterior")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("botão Anterior está desabilitado na primeira página", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Página anterior")).toBeDisabled();
  });

  it("botão Próxima está desabilitado na última página", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    // Handler retorna totalPages=1 → isLast=true
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("navega para page=2 ao clicar em Próxima em página com múltiplas", async () => {
    server.use(
      http.get("https://challenge.outsera.tech/api/movies", () =>
        HttpResponse.json({
          content: [
            {
              id: 1,
              year: 1984,
              title: "Bolero",
              studios: [],
              producers: [],
              winner: true,
            },
          ],
          totalElements: 20,
          totalPages: 2,
          number: 0,
          size: 15,
          first: true,
          last: false,
          numberOfElements: 15,
        })
      )
    );
    const user = userEvent.setup();
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText("Bolero")).toBeInTheDocument()
    );
    await user.click(screen.getByLabelText("Next page"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("page=2"));
  });

  it("exibe contagem total de filmes", async () => {
    renderWithQuery(<MoviesList />);
    await waitFor(() =>
      expect(screen.getByText(/filmes/)).toBeInTheDocument()
    );
  });
});
