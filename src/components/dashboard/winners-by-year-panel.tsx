"use client";

import { useWinnersByYear } from "@/src/hooks/use-dashboard";
import { CalendarSearch } from "lucide-react";
import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { DashboardCard } from "./dashboard-card";


export function WinnersByYearPanel() {
  const [inputYear, setInputYear] = useState("");
  const [searchedYear, setSearchedYear] = useState<number | null>(null);
  const { data, isLoading, isError, isFetching } =
    useWinnersByYear(searchedYear);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(inputYear);
    if (Number.isInteger(parsed) && parsed > 0) {
      setSearchedYear(parsed);
    }
  }

  const winners = data ?? [];

  function renderResult() {
    if (searchedYear === null) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Search by year
        </p>
      );
    }

    if (isLoading) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading...
        </p>
      );
    }

    if (isError) {
      return (
        <p className="py-6 text-center text-sm text-destructive">
          Unable to fetch winners.
        </p>
      );
    }

    if (winners.length === 0) {
      return (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No winners in {searchedYear}.
        </p>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {winners.map((movie) => (
            <TableRow key={movie.id}>
              <TableCell className="text-muted-foreground">
                {movie.id}
              </TableCell>
              <TableCell>{movie.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <DashboardCard title="List movie winners by year" icon={CalendarSearch}>
      <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Search by year"
          value={inputYear}
          onChange={(event) => setInputYear(event.target.value)}
          aria-label="Year"
        />
        <Button type="submit" disabled={isFetching}>
          Search
        </Button>
      </form>
      {renderResult()}
    </DashboardCard>
  );
}