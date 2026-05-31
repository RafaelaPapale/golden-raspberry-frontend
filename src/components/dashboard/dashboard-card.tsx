import type { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function DashboardCard({
  title,
  icon: Icon,
  children,
}: Readonly<DashboardCardProps>) {
  return (
    <Card className="overflow-hidden border-t-2 border-t-amber-400">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-amber-100">
            <Icon className="size-4 text-amber-700" aria-hidden />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
