import type { Blunder, TimeClass } from "../../../types";

interface NoFilterResultsProps {
  allBlunders: Blunder[];
  filteredBlunders: Blunder[];
  timeClassFilter: TimeClass | "all";
}

export function NoFilterResults({
  allBlunders,
  filteredBlunders,
  timeClassFilter,
}: NoFilterResultsProps) {
  return (
    <>
      {allBlunders.length > 0 && filteredBlunders.length === 0 && (
        <div className="p-10 bg-[#1e1c1a] rounded-xl text-center text-[#989795] border border-[#3d3a37]">
          <p className="text-lg m-0">
            No blunders found in{" "}
            <span className="text-green-600 capitalize">{timeClassFilter}</span>{" "}
            games.
          </p>
          <p className="text-sm mt-2 mb-0">
            Try selecting a different time control.
          </p>
        </div>
      )}
    </>
  );
}
