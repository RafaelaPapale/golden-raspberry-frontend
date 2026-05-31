import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ProducerIntervalsPanel } from "@/src/components/dashboard/producer-intervals-panel";
import { server } from "@/src/test/mocks/server";
import { renderWithQuery } from "@/src/test/utils";

describe("ProducerIntervalsPanel", () => {
  it("exibe skeleton durante o carregamento", () => {
    renderWithQuery(<ProducerIntervalsPanel />);
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("renderiza as duas seções de intervalo", async () => {
    renderWithQuery(<ProducerIntervalsPanel />);
    await waitFor(() =>
      expect(screen.getByText("Minimum")).toBeInTheDocument()
    );
    expect(screen.getByText("Maximum")).toBeInTheDocument();
  });

  it("renderiza os cabeçalhos da tabela", async () => {
    renderWithQuery(<ProducerIntervalsPanel />);
    await waitFor(() =>
      expect(screen.getAllByText("Producer")[0]).toBeInTheDocument()
    );
    expect(screen.getAllByText("Interval")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Previous Year")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Following Year")[0]).toBeInTheDocument();
  });

  it("renderiza os dados do menor intervalo", async () => {
    renderWithQuery(<ProducerIntervalsPanel />);
    await waitFor(() =>
      expect(screen.getByText("Joel Silver")).toBeInTheDocument()
    );
    expect(screen.getByText("1990")).toBeInTheDocument();
    expect(screen.getByText("1991")).toBeInTheDocument();
    // Intervalo = 1
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renderiza os dados do maior intervalo", async () => {
    renderWithQuery(<ProducerIntervalsPanel />);
    await waitFor(() =>
      expect(screen.getByText("Matthew Vaughn")).toBeInTheDocument()
    );
    expect(screen.getByText("2002")).toBeInTheDocument();
    expect(screen.getByText("2015")).toBeInTheDocument();
    // Intervalo = 13
    expect(screen.getByText("13")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/maxMinWinIntervalForProducers",
        () => HttpResponse.error()
      )
    );
    renderWithQuery(<ProducerIntervalsPanel />);
    await waitFor(() =>
      expect(
        screen.getByText(/No data could be loaded/)
      ).toBeInTheDocument()
    );
  });

  it("exibe lista vazia quando min e max são arrays vazios", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/maxMinWinIntervalForProducers",
        () => HttpResponse.json({ min: [], max: [] })
      )
    );
    renderWithQuery(<ProducerIntervalsPanel />);
    await waitFor(() =>
      expect(screen.getByText(/No data available/)).toBeInTheDocument()
    );
  });
});
