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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-[18px] text-amber-600" aria-hidden />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}