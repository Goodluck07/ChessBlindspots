import { BlunderCard } from "./BlunderCard";
import { BlunderSummary } from "./BlunderSummary";
import { GameCard } from "./GameCard";
import type { Blunder, TimeClass } from "../../../types";

interface ResultsSectionProps {
  filteredBlunders: Blunder[];
  displayBlunders: Blunder[];
  viewMode: "overall" | "byGame";
  timeClassFilter: TimeClass | "all";
  onSetViewMode: (mode: "overall" | "byGame") => void;
  blundersByGame: Record<string, Blunder[]>;
  gamesAnalyzed: number;
}

export function ResultsSection({
  filteredBlunders,
  viewMode,
  timeClassFilter,
  onSetViewMode,
  blundersByGame,
  gamesAnalyzed,
  displayBlunders,
}: ResultsSectionProps) {
  return (
    <>
      {filteredBlunders.length > 0 && (
        <section>
          {/* Results Header with Controls */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="m-0">
              {viewMode === "overall"
                ? "Your Worst Blunders"
                : "Blunders By Game"}
              {timeClassFilter !== "all" && (
                <span className="text-sm text-green-600 ml-3 font-normal">
                  {timeClassFilter} only
                </span>
              )}
            </h2>

            {/* View Toggle */}
            <div className="flex bg-[#272522] rounded-lg p-1 border border-[#3d3a37]">
              <button
                onClick={() => onSetViewMode("overall")}
                className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                  viewMode === "overall"
                    ? "bg-green-600 text-black font-semibold"
                    : "text-[#bababa]"
                }`}
              >
                Top 5
              </button>
              <button
                onClick={() => onSetViewMode("byGame")}
                className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                  viewMode === "byGame"
                    ? "bg-green-600 text-black font-semibold"
                    : "text-[#bababa]"
                }`}
              >
                By Game
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] mb-7">
            <div className="p-4 bg-[#1e1c1a] rounded-lg border border-[#3d3a37] border-l-4 border-l-red-500">
              <div className="text-[#989795] text-xs uppercase tracking-wide mb-1 font-medium">
                Total Blunders
              </div>
              <div className="text-red-500 text-[28px] font-bold leading-none">
                {filteredBlunders.length}
              </div>
            </div>
            <div className="p-4 bg-[#1e1c1a] rounded-lg border border-[#3d3a37] border-l-4 border-l-green-600">
              <div className="text-[#989795] text-xs uppercase tracking-wide mb-1 font-medium">
                Games Analyzed
              </div>
              <div className="text-green-600 text-[28px] font-bold leading-none">
                {gamesAnalyzed}
              </div>
            </div>
            <div className="p-4 bg-[#1e1c1a] rounded-lg border border-[#3d3a37] border-l-4 border-l-yellow-500">
              <div className="text-[#989795] text-xs uppercase tracking-wide mb-1 font-medium">
                Worst Drop
              </div>
              <div className="text-yellow-500 text-[28px] font-bold leading-none">
                {Math.abs(filteredBlunders[0]?.evalDrop / 100 || 0).toFixed(1)}
                <span className="text-[0.5em] font-medium ml-1 text-[#989795]">
                  pawns
                </span>
              </div>
            </div>
          </div>

          {/* Blunder Cards */}
          <div className="flex flex-col gap-4">
            {viewMode === "overall" ? (
              <>
                {displayBlunders.map((blunder) => (
                  <BlunderCard
                    key={`${blunder.gameUrl}-${blunder.moveNumber}`}
                    blunder={blunder}
                  />
                ))}
              </>
            ) : (
              <>
                {Object.entries(blundersByGame).map(
                  ([gameUrl, gameBlunders]) => (
                    <GameCard
                      key={gameUrl}
                      gameUrl={gameUrl}
                      blunders={gameBlunders}
                    />
                  ),
                )}
              </>
            )}
          </div>

          {/* Summary */}
          <div className="mt-8">
            <BlunderSummary
              blunders={
                viewMode === "overall" ? displayBlunders : filteredBlunders
              }
            />
          </div>
        </section>
      )}
    </>
  );
}
