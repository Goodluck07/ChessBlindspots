import { useNavigate, useSearchParams } from "react-router-dom";
import type { Blunder } from "../../types";
import { defaultPuzzles } from "./defaultPuzzles";
import { DrillFilters } from "./components/DrillFilters";

export interface PracticeViewProps {
  blunders: Blunder[];
}

export function PracticeView({ blunders }: Readonly<PracticeViewProps>) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isUsingSamples = blunders.length === 0;
  const effectiveBlunders = isUsingSamples ? defaultPuzzles : blunders;

  const handleStart = (filteredQueue: Blunder[]) => {
    navigate("/practice/drill", { state: { queue: filteredQueue } });
  };

  return (
    <div className="flex flex-col gap-4">
      {isUsingSamples && (
        <div className="bg-[#1e1c1a] border border-[#3d3a37] rounded-lg px-4 py-3 text-sm text-[#989795]">
          Showing sample puzzles.{" "}
          <a href="/analyze" className="text-[#81b64c] hover:underline">
            Analyze your games
          </a>{" "}
          to practice on your own positions.
        </div>
      )}
      <DrillFilters
        blunders={effectiveBlunders}
        initialPhase={searchParams.get("phase") ?? undefined}
        initialOpening={searchParams.get("opening") ?? undefined}
        initialSeverity={searchParams.get("severity") ?? undefined}
        onStart={handleStart}
      />
    </div>
  );
}
