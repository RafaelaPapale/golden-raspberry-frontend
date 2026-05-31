"use client";

import { useTopStudios } from "@/src/hooks/use-dashboard";
import { Building2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { DashboardCard } from "./dashboard-card";
import { PanelStatus } from "./panel-status";

const TOP_COUNT = 3;

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
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Win Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studios.map((studio, index) => (
              <TableRow key={studio.name}>
                <TableCell className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                    {index + 1}
                  </span>
                  {studio.name}
                </TableCell>
                <TableCell className="text-right">{studio.winCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelStatus>
    </DashboardCard>
  );
}