"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type MovieQuery, moviesApi } from "../lib/api";

export function useMovies(params: MovieQuery) {
  return useQuery({
    queryKey: ["movies", params],
    queryFn: () => moviesApi.list(params),
    placeholderData: keepPreviousData,
  });
}
