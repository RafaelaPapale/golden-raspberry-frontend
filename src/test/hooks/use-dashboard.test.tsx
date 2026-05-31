import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  useMultipleWinners,
  useProducerIntervals,
  useTopStudios,
  useWinnersByYear,
} from "@/src/hooks/use-dashboard";
import { server } from "@/src/test/mocks/server";
import { createQueryWrapper } from "@/src/test/utils";

describe("useMultipleWinners", () => {
  it("inicia em estado de loading", () => {
    const { result } = renderHook(() => useMultipleWinners(), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("retorna anos com múltiplos vencedores", async () => {
    const { result } = renderHook(() => useMultipleWinners(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.years.length).toBeGreaterThan(0);
    expect(result.current.data?.years[0]).toHaveProperty("year");
    expect(result.current.data?.years[0]).toHaveProperty("winnerCount");
  });

  it("seta isError quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/yearsWithMultipleWinners",
        () => HttpResponse.error()
      )
    );
    const { result } = renderHook(() => useMultipleWinners(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useTopStudios", () => {
  it("retorna estúdios com contagem de vitórias", async () => {
    const { result } = renderHook(() => useTopStudios(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.studios.length).toBeGreaterThan(0);
  });

  it("seta isError quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/studiosWithWinCount",
        () => HttpResponse.error()
      )
    );
    const { result } = renderHook(() => useTopStudios(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useProducerIntervals", () => {
  it("retorna objetos min e max", async () => {
    const { result } = renderHook(() => useProducerIntervals(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Array.isArray(result.current.data?.min)).toBe(true);
    expect(Array.isArray(result.current.data?.max)).toBe(true);
  });

  it("cada entrada de intervalo tem os campos corretos", async () => {
    const { result } = renderHook(() => useProducerIntervals(), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const entry = result.current.data!.min[0];
    expect(entry).toHaveProperty("producer");
    expect(entry).toHaveProperty("interval");
    expect(entry).toHaveProperty("previousWin");
    expect(entry).toHaveProperty("followingWin");
  });
});

describe("useWinnersByYear", () => {
  it("permanece inativo (fetchStatus idle) quando year é null", () => {
    const { result } = renderHook(() => useWinnersByYear(null), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("dispara a busca quando year é um número válido", async () => {
    const { result } = renderHook(() => useWinnersByYear(1984), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.fetchStatus).toBe("fetching");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("retorna array vazio para ano sem vencedores", async () => {
    const { result } = renderHook(() => useWinnersByYear(2099), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });

  it("seta isError quando a API falha", async () => {
    server.use(
      http.get(
        "https://challenge.outsera.tech/api/movies/winnersByYear",
        () => HttpResponse.error()
      )
    );
    const { result } = renderHook(() => useWinnersByYear(1984), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
