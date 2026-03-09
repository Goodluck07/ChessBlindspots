interface ProgressIndicatorProps {
  progress: string | null;
  loading: boolean;
  gamesAnalyzed: number;
  gamesTotal: number;
}

export function ProgressIndicator({
  progress,
  loading,
  gamesAnalyzed,
  gamesTotal,
}: Readonly<ProgressIndicatorProps>) {
  const pct =
    gamesTotal > 0 ? Math.round((gamesAnalyzed / gamesTotal) * 100) : 0;

  return (
    <>
      {progress && (
        <div className="mb-8 p-5 bg-[#1e1c1a] rounded-lg border border-[#3d3a37]">
          {/* Text row */}
          <div className="flex items-center gap-3 text-[#989795] mb-3">
            {loading && (
              <div className="w-5 h-5 border-2 border-[#3d3a37] border-t-green-600 rounded-full animate-spin shrink-0" />
            )}
            <span className="text-base flex-1">{progress}</span>
            {loading && gamesAnalyzed > 0 && (
              <span className="text-green-600 text-sm font-semibold">
                {gamesAnalyzed}/{gamesTotal}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {loading && gamesTotal > 0 && (
            <div className="w-full h-1.5 bg-[#3d3a37] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
