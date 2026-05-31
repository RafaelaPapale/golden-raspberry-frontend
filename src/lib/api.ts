const BASE_URL = "https://challenge.outsera.tech/api/movies";

export interface Movie {
  id: number;
  year: number;
  title: string;
  studios: string[];
  producers: string[];
  winner: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface YearWithWinners {
  year: number;
  winnerCount: number;
}

export interface StudioWinCount {
  name: string;
  winCount: number;
}

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface MaxMinInterval {
  min: ProducerInterval[];
  max: ProducerInterval[];
}

export interface MovieQuery {
  page?: number;
  size?: number;
  winner?: boolean;
  year?: number;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

async function request<T>(path: string, params?: QueryParams): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url.pathname}`);
  }

  return response.json() as Promise<T>;
}

export const moviesApi = {
  list: (params: MovieQuery = {}) => request<Page<Movie>>("", params as QueryParams),
  yearsWithMultipleWinners: () =>
    request<{ years: YearWithWinners[] }>("/yearsWithMultipleWinners"),
  studiosWithWinCount: () =>
    request<{ studios: StudioWinCount[] }>("/studiosWithWinCount"),
  maxMinWinIntervalForProducers: () =>
    request<MaxMinInterval>("/maxMinWinIntervalForProducers"),
  winnersByYear: (year: number) =>
    request<Movie[]>("/winnersByYear", { year }),
};