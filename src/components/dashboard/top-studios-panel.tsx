"use client";

import { useTopStudios } from "@/src/hooks/use-dashboard";
import { Building2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import { DashboardCard } from "./dashboard-card";
import { PanelStatus } from "./panel-status";

const TOP_COUNT = 3;

const rankColors = [
  "bg-amber-400 text-amber-900",
  "bg-stone-300 text-stone-700",
  "bg-amber-700/70 text-amber-100",
] as const;

export function TopStudiosPanel() {
  const { data, isLoading, isError } = useTopStudios();
  const studios = (data?.studios ?? []).slice(0, TOP_COUNT);

  return (
    <DashboardCard title="Top 3 studios with winners" icon={Building2}>
      <PanelStatus
        isLoading={isLoading}
        isError={isError}
        isEmpty={studios.length === 0}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Win Count
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studios.map((studio, index) => (
              <TableRow key={studio.name}>
                <TableCell className="flex items-center gap-2.5">
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${rankColors[index]}`}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium">{studio.name}</span>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {studio.winCount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelStatus>
    </DashboardCard>
  );
}
