"use client";

import { useProducerIntervals } from "@/src/hooks/use-dashboard";
import { ProducerInterval } from "@/src/lib/api";
import { Users } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { DashboardCard } from "./dashboard-card";
import { PanelStatus } from "./panel-status";

function IntervalTable({ rows }: Readonly<{ rows: ProducerInterval[] }>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producer</TableHead>
          <TableHead className="text-right">Interval</TableHead>
          <TableHead className="text-right">Previous Year</TableHead>
          <TableHead className="text-right">Following Year</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.producer}-${row.previousWin}-${row.followingWin}`}>
            <TableCell>{row.producer}</TableCell>
            <TableCell className="text-right">{row.interval}</TableCell>
            <TableCell className="text-right">{row.previousWin}</TableCell>
            <TableCell className="text-right">{row.followingWin}</TableCell>
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
    <DashboardCard title="Producers with longest and shortest intervals between wins" icon={Users}>
      <PanelStatus
        isLoading={isLoading}
        isError={isError}
        isEmpty={!hasData}
        rows={4}
      >
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Minimum
            </p>
            <IntervalTable rows={data?.min ?? []} />
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Maximum
            </p>
            <IntervalTable rows={data?.max ?? []} />
          </div>
        </div>
      </PanelStatus>
    </DashboardCard>
  );
}