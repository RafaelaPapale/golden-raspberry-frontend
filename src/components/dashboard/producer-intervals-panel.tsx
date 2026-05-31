"use client";

import { useProducerIntervals } from "@/src/hooks/use-dashboard";
import { ProducerInterval } from "@/src/lib/api";
import { Users } from "lucide-react";
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

function IntervalTable({ rows }: Readonly<{ rows: ProducerInterval[] }>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Producer
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Interval
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Previous Year
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Following Year
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={`${row.producer}-${row.previousWin}-${row.followingWin}`}
          >
            <TableCell className="font-medium">{row.producer}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-amber-700">
              {row.interval}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {row.previousWin}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
              {row.followingWin}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ProducerIntervalsPanel() {
  const { data, isLoading, isError } = useProducerIntervals();
  const hasData = Boolean(data && (data.min.length > 0 || data.max.length > 0));

  return (
    <DashboardCard
      title="Producers with longest and shortest intervals between wins"
      icon={Users}
    >
      <PanelStatus
        isLoading={isLoading}
        isError={isError}
        isEmpty={!hasData}
        rows={4}
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Minimum
            </p>
            <IntervalTable rows={data?.min ?? []} />
          </div>
          <div className="border-t pt-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Maximum
            </p>
            <IntervalTable rows={data?.max ?? []} />
          </div>
        </div>
      </PanelStatus>
    </DashboardCard>
  );
}
