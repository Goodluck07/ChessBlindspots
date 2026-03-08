import {
  AnalyzeView,
  type AnalyzeViewProps,
} from "../features/analyze/Analyze";
import { DashboardLayout } from "../layouts/DashboardLayout";

export function AnalyzePage({
  allBlunders,
  filteredBlunders,
  displayBlunders,
  blundersByGame,
  loading,
  error,
  progress,
  gamesAnalyzed,
  gamesToAnalyze,
  lastAnalyzedUsername,
  timeClassFilter,
  viewMode,
  TIME_CLASS_LABELS,
  onAnalyzeGames,
  onSetGamesToAnalyze,
  onSetTimeClassFilter,
  onSetViewMode,
}: Readonly<AnalyzeViewProps>) {
  return (
    <DashboardLayout>
      <AnalyzeView
        allBlunders={allBlunders}
        filteredBlunders={filteredBlunders}
        displayBlunders={displayBlunders}
        blundersByGame={blundersByGame}
        loading={loading}
        error={error}
        progress={progress}
        gamesAnalyzed={gamesAnalyzed}
        gamesToAnalyze={gamesToAnalyze}
        lastAnalyzedUsername={lastAnalyzedUsername}
        timeClassFilter={timeClassFilter}
        viewMode={viewMode}
        TIME_CLASS_LABELS={TIME_CLASS_LABELS}
        onAnalyzeGames={onAnalyzeGames}
        onSetGamesToAnalyze={onSetGamesToAnalyze}
        onSetTimeClassFilter={onSetTimeClassFilter}
        onSetViewMode={onSetViewMode}
      />
    </DashboardLayout>
  );
}
