import { MultipleWinnersPanel } from "../components/dashboard/multiple-winners-panel";
import { ProducerIntervalsPanel } from "../components/dashboard/producer-intervals-panel";
import { TopStudiosPanel } from "../components/dashboard/top-studios-panel";
import { WinnersByYearPanel } from "../components/dashboard/winners-by-year-panel";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-medium">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Nominees and Winners of the Worst Picture Category
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MultipleWinnersPanel />
        <TopStudiosPanel />
        <ProducerIntervalsPanel />
        <WinnersByYearPanel />
      </div>
    </div>
  );
}
