import type { TimeClass } from "../../../types";
import { UsernameForm } from "./UsernameForm";

interface SearchSectionProps {
  onAnalyzeGames: (username: string) => void;
  loading: boolean;
  timeClassFilter: TimeClass | "all";
  TIME_CLASS_LABELS: Record<TimeClass | "all", string>;
  onSetTimeClassFilter: (tc: TimeClass | "all") => void;
}

export function SearchSection({
  onAnalyzeGames,
  loading,
  timeClassFilter,
  TIME_CLASS_LABELS,
  onSetTimeClassFilter,
}: SearchSectionProps) {
  return (
    <section className="bg-[#1e1c1a] rounded-xl p-6 mb-8 border border-[#3d3a37]">
      <UsernameForm onSubmit={onAnalyzeGames} loading={loading} />

      {/* Time Control Filter */}
      <div className="mt-5">
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
    </section>
  );
}
