import { Link } from "react-router-dom";
import { Section } from "./Section";

interface WorstBlunderSectionProps {
  worstBlunder: {
    movePlayed: string;
    bestMove: string;
    moveNumber: number;
    gamePhase: string;
    opening?: string;
    opponent: string;
    gameResult: "win" | "loss" | "draw";
  };
  worstDrop: number;
}

export function WorstBlunderSection({
  worstBlunder,
  worstDrop,
}: WorstBlunderSectionProps) {
  return (
    <Section title="Your Worst Blunder">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-50">
          <div className="flex gap-2.5 mb-3 flex-wrap">
            <span className="bg-[#3d2522] text-[#fa412d] px-3 py-1 rounded-full text-[0.82em] font-semibold">
              -{worstDrop.toFixed(1)} pawns
            </span>
            <span className="bg-[#3d3a37] text-[#bababa] px-3 py-1 rounded-full text-[0.82em] capitalize">
              Move {worstBlunder.moveNumber} · {worstBlunder.gamePhase}
            </span>
            {worstBlunder.opening && (
              <span className="bg-[#3d3a37] text-[#bababa] px-3 py-1 rounded-full text-[0.82em]">
                {worstBlunder.opening}
              </span>
            )}
          </div>
          <div className="text-[#bababa] text-sm leading-relaxed">
            You played{" "}
            <strong className="text-[#fa412d]">
              {worstBlunder.movePlayed}
            </strong>{" "}
            when{" "}
            <strong className="text-[#81b64c]">
              {worstBlunder.bestMove.slice(0, 4)}
            </strong>{" "}
            was better — vs{" "}
            <strong className="text-white">{worstBlunder.opponent}</strong> (
            {worstBlunder.gameResult === "loss"
              ? "you lost"
              : worstBlunder.gameResult === "win"
                ? "you won anyway"
                : "draw"}
            )
          </div>
        </div>
        <Link
          to="/analyze"
          className="bg-[rgba(129,182,76,0.15)] text-[#81b64c] border border-[rgba(129,182,76,0.3)] rounded-lg px-5 py-2.5 text-sm font-semibold no-underline whitespace-nowrap"
        >
          View on Board →
        </Link>
      </div>
    </Section>
  );
}
