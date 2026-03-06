interface ProgressIndicatorProps {
  progress: string | null;
  loading: boolean;
  gamesAnalyzed: number;
}
export function ProgressIndicator({
  progress,
  loading,
  gamesAnalyzed,
}: ProgressIndicatorProps) {
  return (
    <>
      {progress && (
        <div className="flex items-center justify-center gap-3 text-[#989795] mb-8 p-5 bg-[#1e1c1a] rounded-lg border border-[#3d3a37]">
          {loading && (
            <div className="w-6 h-6 border-3 border-[#3d3a37] border-t-3 border-t-green-600 rounded-full animate-spin" />
          )}
          <span className="text-base">
            {progress}
            {gamesAnalyzed > 0 && loading && (
              <span className="text-green-600 ml-2">
                ({gamesAnalyzed}/{10})
              </span>
            )}
          </span>
        </div>
      )}
    </>
  );
}
