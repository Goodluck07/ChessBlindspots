import type { TimeClass } from "../../../types";
import { UsernameForm } from "./UsernameForm";

interface SearchSectionProps {
  onAnalyzeGames: (username: string) => void;
  loading: boolean;
  timeClassFilter: TimeClass | "all";
  TIME_CLASS_LABELS: Record<TimeClass | "all", string>;
  onSetTimeClassFilter: (tc: TimeClass | "all") => void;
  gamesToAnalyze: number;
  onSetGamesToAnalyze: (n: number) => void;
  lastAnalyzedUsername: string;
}

const GAME_COUNT_OPTIONS = [5, 10, 25] as const;

export function SearchSection({
  onAnalyzeGames,
  loading,
  timeClassFilter,
  TIME_CLASS_LABELS,
  onSetTimeClassFilter,
  gamesToAnalyze,
  onSetGamesToAnalyze,
  lastAnalyzedUsername,
}: SearchSectionProps) {
  return (
    <section className="bg-[#1e1c1a] rounded-xl p-6 mb-8 border border-[#3d3a37]">
      <UsernameForm onSubmit={onAnalyzeGames} loading={loading} />

      <div className="flex flex-wrap gap-6">
        {/* Time Control Filter */}
        <div className="flex-1 min-w-40">
          <label className="block text-[#989795] text-sm mb-2 uppercase tracking-wide">
            Time Control
          </label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(TIME_CLASS_LABELS) as (TimeClass | "all")[]).map(
              (tc) => (
                <button
                  key={tc}
                  onClick={() => onSetTimeClassFilter(tc)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                    timeClassFilter === tc
                      ? "bg-green-600 text-black font-semibold"
                      : "bg-[#3d3a37] text-[#bababa]"
                  } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {TIME_CLASS_LABELS[tc]}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Games Count Selector */}
        <div>
          <label className="block text-[#989795] text-sm mb-2 uppercase tracking-wide">
            Games to Analyze
          </label>
          <div className="flex gap-2">
            {GAME_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => onSetGamesToAnalyze(n)}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                  gamesToAnalyze === n
                    ? "bg-green-600 text-black font-semibold"
                    : "bg-[#3d3a37] text-[#bababa]"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Re-analyze button */}
      {lastAnalyzedUsername && !loading && (
        <div className="mt-4 pt-4 border-t border-[#3d3a37]">
          <button
            onClick={() => onAnalyzeGames(lastAnalyzedUsername)}
            className="text-sm text-[#989795] hover:text-green-500 transition-colors cursor-pointer"
          >
            ↺ Re-analyze {lastAnalyzedUsername}
          </button>
        </div>
      )}
    </section>
  );
}
