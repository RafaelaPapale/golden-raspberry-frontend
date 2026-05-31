import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { MoviesList } from "@/src/components/movies/movies-list";

export const metadata: Metadata = {
  title: "Movies List — Golden Raspberry Awards",
  description: "All nominees and winners in the Worst Picture category.",
};

function MoviesListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Movies List</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          All nominees and winners in the Worst Picture category.
        </p>
      </div>
      <Suspense fallback={<MoviesListSkeleton />}>
        <MoviesList />
      </Suspense>
    </div>
  );
}
