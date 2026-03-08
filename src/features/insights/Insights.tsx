import type { Blunder } from "../../types";
import { NoBlunders } from "./components/NoBlunders";
import { Blunders } from "./components/Blunders";

export interface InsightsViewProps {
  blunders: Blunder[];
  gamesAnalyzed: number;
}

export function InsightsView({ blunders, gamesAnalyzed }: Readonly<InsightsViewProps>) {
  if (blunders.length === 0) {
    return <NoBlunders />;
  }

  return <Blunders blunders={blunders} gamesAnalyzed={gamesAnalyzed} />;
}
