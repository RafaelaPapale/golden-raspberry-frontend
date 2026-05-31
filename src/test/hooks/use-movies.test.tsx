import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { useMovies } from "@/src/hooks/use-movies";
import { server } from "@/src/test/mocks/server";
import { createQueryWrapper } from "@/src/test/utils";

describe("useMovies", () => {
  it("inicia em estado de loading", () => {
    const { result } = renderHook(() => useMovies({ page: 0, size: 15 }), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("retorna dados paginados", async () => {
    const { result } = renderHook(() => useMovies({ page: 0, size: 15 }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content.length).toBeGreaterThan(0);
    expect(result.current.data?.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("query key inclui os parâmetros (caches separados por params)", async () => {
    const wrapperA = createQueryWrapper();
    const wrapperB = createQueryWrapper();

    const { result: resultA } = renderHook(
      () => useMovies({ page: 0, winner: true }),
      { wrapper: wrapperA }
    );
    const { result: resultB } = renderHook(
      () => useMovies({ page: 0, winner: false }),
      { wrapper: wrapperB }
    );

    await waitFor(() => expect(resultA.current.isSuccess).toBe(true));
    await waitFor(() => expect(resultB.current.isSuccess).toBe(true));

    expect(resultA.current.data?.content.every((m) => m.winner)).toBe(true);
    expect(resultB.current.data?.content.every((m) => !m.winner)).toBe(true);
  });

  it("filtra por winner=true", async () => {
    const { result } = renderHook(() => useMovies({ winner: true }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.content.every((m) => m.winner)).toBe(true);
  });

  it("filtra por winner=false", async () => {
    const { result } = renderHook(() => useMovies({ winner: false }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.content.every((m) => !m.winner)).toBe(true);
  });

  it("filtra por ano", async () => {
    const { result } = renderHook(() => useMovies({ year: 1984 }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.content.every((m) => m.year === 1984)).toBe(
      true
    );
  });

  it("mantém dados anteriores ao trocar parâmetros (keepPreviousData)", async () => {
    const wrapper = createQueryWrapper();
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useMovies({ page, size: 15 }),
      { wrapper, initialProps: { page: 0 } }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const previousData = result.current.data;

    rerender({ page: 99 });

    // Imediatamente após trocar, dados anteriores continuam disponíveis
    expect(result.current.data).toBeDefined();
    expect(result.current.data).toEqual(previousData);
  });

  it("seta isError quando a API falha", async () => {
    server.use(
      http.get("https://challenge.outsera.tech/api/movies", () =>
        HttpResponse.error()
      )
    );
    const { result } = renderHook(() => useMovies({ page: 0 }), {
      wrapper: createQueryWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
