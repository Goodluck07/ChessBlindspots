import type { CachedMeta } from "../Insights";
import { timeAgo } from "../utils/timeAgo";
import { Button } from "../../../components/ui/Button";

interface NoBlundersProps {
  cachedAnalyses: CachedMeta[];
  onLoadCache: (username: string) => void;
}

export function NoBlunders({ cachedAnalyses, onLoadCache }: NoBlundersProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl px-5 md:px-10 py-16 text-center">
        <div className="text-6xl mb-5 opacity-50">📊</div>
        <h1 className="text-white m-0 mb-4">No data yet</h1>
        <p className="text-[#989795] m-0 mb-6 text-lg">
          Analyze your games first to see insights.
        </p>
        <Button as="a" href="/analyze">
          Go Analyze My Games
        </Button>
      </section>

      {cachedAnalyses.length > 0 && (
        <section className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-6">
          <h2 className="m-0 mb-4 text-white text-base! font-semibold uppercase tracking-[0.5px]">
            Previously Analyzed
          </h2>
          <div className="flex flex-col gap-2.5">
            {cachedAnalyses.map((c) => (
              <div
                key={c.username}
                className="flex items-center justify-between flex-wrap gap-2.5 p-3.5 bg-[#272522] rounded-lg border border-[#3d3a37]"
              >
                <div>
                  <div className="text-white font-semibold text-[15px]">
                    {c.username}
                  </div>
                  <div className="text-[#5a5856] text-xs mt-0.5">
                    {c.blunders.length} blunders · {c.gamesAnalyzed} games ·{" "}
                    {timeAgo(c.timestamp)}
                  </div>
                </div>
                <button
                  onClick={() => onLoadCache(c.username)}
                  className="bg-[rgba(129,182,76,0.15)] text-[#81b64c] border border-[rgba(129,182,76,0.3)] rounded-md px-4 py-1.5 text-sm font-semibold cursor-pointer"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
