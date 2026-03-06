import { DashboardLayout } from "../layouts/DashboardLayout";
import {
  InsightsView,
  type InsightsViewProps,
} from "../features/insights/Insights";

export function InsightsPage({
  blunders,
  gamesAnalyzed,
  cachedAnalyses,
  onLoadCache,
}: InsightsViewProps) {
  return (
    <DashboardLayout>
      <InsightsView
        blunders={blunders}
        gamesAnalyzed={gamesAnalyzed}
        cachedAnalyses={cachedAnalyses}
        onLoadCache={onLoadCache}
      />
    </DashboardLayout>
  );
}
