import { DashboardLayout } from "../layouts/DashboardLayout";
import {
  InsightsView,
  type InsightsViewProps,
} from "../features/insights/Insights";

export function InsightsPage({ blunders, gamesAnalyzed }: Readonly<InsightsViewProps>) {
  return (
    <DashboardLayout>
      <InsightsView blunders={blunders} gamesAnalyzed={gamesAnalyzed} />
    </DashboardLayout>
  );
}
