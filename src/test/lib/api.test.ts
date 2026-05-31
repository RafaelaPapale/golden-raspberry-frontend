import { describe, expect, it } from "vitest";
import { moviesApi } from "@/src/lib/api";

describe("moviesApi.list", () => {
  it("retorna filmes com campos obrigatórios", async () => {
    const result = await moviesApi.list({ page: 0, size: 15 });
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("totalElements");
    expect(result).toHaveProperty("totalPages");
    expect(result).toHaveProperty("number");
    expect(result).toHaveProperty("size");
    expect(result).toHaveProperty("first");
    expect(result).toHaveProperty("last");
  });

  it("retorna filmes com todos os campos de Movie", async () => {
    const result = await moviesApi.list({ page: 0, size: 15 });
    const movie = result.content[0];
    expect(movie).toHaveProperty("id");
    expect(movie).toHaveProperty("year");
    expect(movie).toHaveProperty("title");
    expect(movie).toHaveProperty("studios");
    expect(movie).toHaveProperty("producers");
    expect(movie).toHaveProperty("winner");
  });

  it("filtra apenas vencedores com winner=true", async () => {
    const result = await moviesApi.list({ winner: true });
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.content.every((m) => m.winner)).toBe(true);
  });

  it("filtra apenas não-vencedores com winner=false", async () => {
    const result = await moviesApi.list({ winner: false });
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.content.every((m) => !m.winner)).toBe(true);
  });

  it("filtra por ano", async () => {
    const result = await moviesApi.list({ year: 1984 });
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.content.every((m) => m.year === 1984)).toBe(true);
  });

  it("retorna lista vazia para ano inexistente", async () => {
    const result = await moviesApi.list({ year: 1800 });
    expect(result.content).toHaveLength(0);
  });
});

describe("moviesApi.yearsWithMultipleWinners", () => {
  it("retorna lista de anos", async () => {
    const result = await moviesApi.yearsWithMultipleWinners();
    expect(result.years.length).toBeGreaterThan(0);
  });

  it("cada entrada tem year e winnerCount", async () => {
    const result = await moviesApi.yearsWithMultipleWinners();
    const entry = result.years[0];
    expect(typeof entry.year).toBe("number");
    expect(typeof entry.winnerCount).toBe("number");
    expect(entry.winnerCount).toBeGreaterThan(1);
  });
});

describe("moviesApi.studiosWithWinCount", () => {
  it("retorna lista de estúdios", async () => {
    const result = await moviesApi.studiosWithWinCount();
    expect(result.studios.length).toBeGreaterThan(0);
  });

  it("cada estúdio tem name e winCount", async () => {
    const result = await moviesApi.studiosWithWinCount();
    const studio = result.studios[0];
    expect(typeof studio.name).toBe("string");
    expect(typeof studio.winCount).toBe("number");
  });

  it("retorna estúdios em ordem decrescente de vitórias", async () => {
    const result = await moviesApi.studiosWithWinCount();
    const counts = result.studios.map((s) => s.winCount);
    const sorted = [...counts].sort((a, b) => b - a);
    expect(counts).toEqual(sorted);
  });
});

describe("moviesApi.maxMinWinIntervalForProducers", () => {
  it("retorna objetos min e max", async () => {
    const result = await moviesApi.maxMinWinIntervalForProducers();
    expect(Array.isArray(result.min)).toBe(true);
    expect(Array.isArray(result.max)).toBe(true);
  });

  it("cada entrada tem producer, interval, previousWin e followingWin", async () => {
    const result = await moviesApi.maxMinWinIntervalForProducers();
    const entry = result.min[0];
    expect(typeof entry.producer).toBe("string");
    expect(typeof entry.interval).toBe("number");
    expect(typeof entry.previousWin).toBe("number");
    expect(typeof entry.followingWin).toBe("number");
  });

  it("followingWin = previousWin + interval", async () => {
    const result = await moviesApi.maxMinWinIntervalForProducers();
    for (const entry of [...result.min, ...result.max]) {
      expect(entry.followingWin - entry.previousWin).toBe(entry.interval);
    }
  });

  it("intervalo mínimo é menor ou igual ao máximo", async () => {
    const result = await moviesApi.maxMinWinIntervalForProducers();
    const minInterval = result.min[0].interval;
    const maxInterval = result.max[0].interval;
    expect(minInterval).toBeLessThanOrEqual(maxInterval);
  });
});

describe("moviesApi.winnersByYear", () => {
  it("retorna vencedores do ano solicitado", async () => {
    const result = await moviesApi.winnersByYear(1984);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((m) => m.winner)).toBe(true);
  });

  it("retorna array vazio para ano sem vencedores", async () => {
    const result = await moviesApi.winnersByYear(2099);
    expect(result).toHaveLength(0);
  });

  it("cada filme retornado é vencedor com o ano correto", async () => {
    const result = await moviesApi.winnersByYear(1984);
    expect(result.every((m) => m.year === 1984)).toBe(true);
    expect(result[0].title).toBe("Bolero");
  });
});
