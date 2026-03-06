import type { Blunder } from "../../types";
import { NoBlunders } from "./components/NoBlunders";
import { Blunders } from "./components/Blunders";

export interface CachedMeta {
  username: string;
  blunders: Blunder[];
  gamesAnalyzed: number;
  timestamp: number;
}

export interface InsightsViewProps {
  blunders: Blunder[];
  gamesAnalyzed: number;
  cachedAnalyses: CachedMeta[];
  onLoadCache: (username: string) => void;
}

export function InsightsView({
  blunders,
  gamesAnalyzed,
  cachedAnalyses,
  onLoadCache,
}: InsightsViewProps) {
  if (blunders.length === 0) {
    return (
      <NoBlunders cachedAnalyses={cachedAnalyses} onLoadCache={onLoadCache} />
    );
  }

  return <Blunders blunders={blunders} gamesAnalyzed={gamesAnalyzed} />;
}
