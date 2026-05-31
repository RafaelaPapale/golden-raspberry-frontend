"use client";

import { useMultipleWinners } from "@/src/hooks/use-dashboard";
import { CalendarRange } from "lucide-react";
import { Badge } from "../ui/badge";
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

export function MultipleWinnersPanel() {
  const { data, isLoading, isError } = useMultipleWinners();
  const years = data?.years ?? [];

  return (
    <DashboardCard title="List year with multiple winners" icon={CalendarRange}>
      <PanelStatus
        isLoading={isLoading}
        isError={isError}
        isEmpty={years.length === 0}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Year
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Win Count
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.map((entry) => (
              <TableRow key={entry.year}>
                <TableCell className="font-medium">{entry.year}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 hover:bg-amber-100"
                  >
                    {entry.winnerCount}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelStatus>
    </DashboardCard>
  );
}
