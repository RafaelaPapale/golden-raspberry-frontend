import { AlertTriangle, Inbox } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center gap-2.5 py-8">
        <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-4.5 text-destructive" aria-hidden />
        </div>
        <p className="text-center text-sm text-destructive">
          No data could be loaded. Please try again later.
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 py-8">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Inbox className="size-4.5 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          No data available.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
