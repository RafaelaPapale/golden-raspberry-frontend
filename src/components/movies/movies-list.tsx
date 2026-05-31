"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useMovies } from "@/src/hooks/use-movies";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";

const PAGE_SIZE = 15;

export function MoviesList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const yearParam = searchParams.get("year") ?? "";
  const winnerParam = searchParams.get("winner") ?? "";

  const [inputYear, setInputYear] = useState(yearParam);

  const year = yearParam ? Number(yearParam) : undefined;
  const winner =
    winnerParam === "true"
      ? true
      : winnerParam === "false"
        ? false
        : undefined;

  const { data, isLoading, isError, isFetching } = useMovies({
    page: page - 1,
    size: PAGE_SIZE,
    year,
    winner,
  });

  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?");
  }

  function handleYearSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = inputYear.trim();
    const parsed = Number(trimmed);
    navigate({
      year:
        trimmed && Number.isInteger(parsed) && parsed > 0 ? trimmed : undefined,
      page: undefined,
    });
  }

  function handleWinnerChange(value: string) {
    navigate({ winner: value === "all" ? undefined : value, page: undefined });
  }

  function handleClearFilters() {
    setInputYear("");
    router.push("?");
  }

  function handlePageChange(newPage: number) {
    navigate({ page: String(newPage) });
  }

  const movies = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const hasFilters = Boolean(yearParam || winnerParam);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-card px-4 py-3 shadow-xs">
        <form onSubmit={handleYearSubmit} className="flex gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Search by year"
            value={inputYear}
            onChange={(e) => setInputYear(e.target.value)}
            aria-label="Year"
            className="w-40"
          />
          <Button
            type="submit"
            variant="outline"
            size="icon"
            aria-label="Apply year filter"
          >
            <Search className="size-4" aria-hidden />
          </Button>
        </form>

        <Select value={winnerParam || "all"} onValueChange={handleWinnerChange}>
          <SelectTrigger className="w-44" aria-label="Filter by winner">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Winners</SelectItem>
            <SelectItem value="false">Non-winners</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            aria-label="Clear filters"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive"
        >
          Unable to load movies. Please try again.
        </p>
      ) : movies.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No movies found with the applied filters.
        </p>
      ) : (
        <div className="rounded-lg border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Year
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="w-28 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Winner
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.map((movie) => (
                <TableRow key={movie.id}>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {movie.year}
                  </TableCell>
                  <TableCell className="font-medium">{movie.title}</TableCell>
                  <TableCell className="text-right">
                    {movie.winner && (
                      <Badge
                        variant="outline"
                        className="border-amber-300 bg-amber-50 text-amber-700"
                      >
                        Yes
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && movies.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {totalElements} {totalElements === 1 ? "filme" : "filmes"} · página{" "}
            {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={isFirst || isFetching}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={isLast || isFetching}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
