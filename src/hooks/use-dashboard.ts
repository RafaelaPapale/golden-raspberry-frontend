"use client";

import { useQuery } from "@tanstack/react-query";
import { moviesApi } from "../lib/api";

export function useMultipleWinners() {
  return useQuery({
    queryKey: ["dashboard", "multiple-winners"],
    queryFn: () => moviesApi.yearsWithMultipleWinners(),
  });
}

export function useTopStudios() {
  return useQuery({
    queryKey: ["dashboard", "top-studios"],
    queryFn: () => moviesApi.studiosWithWinCount(),
  });
}

export function useProducerIntervals() {
  return useQuery({
    queryKey: ["dashboard", "producer-intervals"],
    queryFn: () => moviesApi.maxMinWinIntervalForProducers(),
  });
}

export function useWinnersByYear(year: number | null) {
  return useQuery({
    queryKey: ["dashboard", "winners-by-year", year],
    queryFn: () => moviesApi.winnersByYear(year as number),
    enabled: year !== null,
  });
}