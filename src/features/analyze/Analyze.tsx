import { DemoBlunder } from "../../components/DemoBlunder";
import type { Blunder, TimeClass } from "../../types";
import { ErrorMessage } from "./components/ErrorMessage";
import { NoFilterResults } from "./components/NoFilterResults";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { ResultsSection } from "./components/ResultsSection";
import { SearchSection } from "./components/SearchSection";

export interface AnalyzeViewProps {
  allBlunders: Blunder[];
  filteredBlunders: Blunder[];
  displayBlunders: Blunder[];
  blundersByGame: Record<string, Blunder[]>;
  loading: boolean;
  error: string | null;
  progress: string | null;
  gamesAnalyzed: number;
  timeClassFilter: TimeClass | "all";
  viewMode: "overall" | "byGame";
  TIME_CLASS_LABELS: Record<TimeClass | "all", string>;
  onAnalyzeGames: (username: string) => void;
  onSetTimeClassFilter: (tc: TimeClass | "all") => void;
  onSetViewMode: (mode: "overall" | "byGame") => void;
}

export function AnalyzeView({
  allBlunders,
  filteredBlunders,
  displayBlunders,
  blundersByGame,
  loading,
  error,
  progress,
  gamesAnalyzed,
  timeClassFilter,
  viewMode,
  TIME_CLASS_LABELS,
  onAnalyzeGames,
  onSetTimeClassFilter,
  onSetViewMode,
}: AnalyzeViewProps) {
  return (
    <>
      {/* Search Section */}
      <SearchSection
        onAnalyzeGames={onAnalyzeGames}
        loading={loading}
        timeClassFilter={timeClassFilter}
        TIME_CLASS_LABELS={TIME_CLASS_LABELS}
        onSetTimeClassFilter={onSetTimeClassFilter}
      />

      {/* Error Message */}
      <ErrorMessage error={error} />

      {/* Progress Indicator */}
      <ProgressIndicator
        progress={progress}
        loading={loading}
        gamesAnalyzed={gamesAnalyzed}
      />

      {/* Demo Section */}
      {allBlunders.length === 0 && !error && !loading && <DemoBlunder />}

      {/* Results Section */}
      <ResultsSection
        filteredBlunders={filteredBlunders}
        displayBlunders={displayBlunders}
        viewMode={viewMode}
        timeClassFilter={timeClassFilter}
        onSetViewMode={onSetViewMode}
        blundersByGame={blundersByGame}
        gamesAnalyzed={gamesAnalyzed}
      />

      {/* No Results for Filter */}
      <NoFilterResults
        allBlunders={allBlunders}
        filteredBlunders={filteredBlunders}
        timeClassFilter={timeClassFilter}
      />
    </>
  );
}
