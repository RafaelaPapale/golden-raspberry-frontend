import { Skeleton } from "../ui/skeleton";

interface PanelStatusProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  rows?: number;
  children: React.ReactNode;
}

export function PanelStatus({
  isLoading,
  isError,
  isEmpty,
  rows = 3,
  children,
}: Readonly<PanelStatusProps>) {
  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-destructive">
        No data could be loaded. Please try again later.
      </p>
    );
  }

  if (isEmpty) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No data available.
      </p>
    );
  }

  return <>{children}</>;
}