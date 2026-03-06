import { Link } from "react-router-dom";
import { Section } from "./Section";

interface WorstBlunderSectionProps {
  worstBlunder: {
    movePlayed: string;
    bestMove: string;
    bestMoveFrom: string;
    bestMoveTo: string;
    moveNumber: number;
    gamePhase: string;
    opening?: string;
    opponent: string;
    gameResult: "win" | "loss" | "draw";
    pieceMoved: string;
    wasCapture: boolean;
    bestMoveWasCapture: boolean;
    evalDrop: number;
  };
  worstDrop: number;
}

const PIECE_NAMES: Record<string, string> = {
  K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn",
};

export function WorstBlunderSection({
  worstBlunder,
  worstDrop,
}: WorstBlunderSectionProps) {
  const {
    movePlayed,
    bestMoveFrom,
    bestMoveTo,
    moveNumber,
    gamePhase,
    opening,
    opponent,
    gameResult,
    pieceMoved,
    wasCapture,
    bestMoveWasCapture,
    evalDrop,
  } = worstBlunder;

  const formattedBestMove = `${bestMoveFrom}→${bestMoveTo}`;
  const pieceName = PIECE_NAMES[pieceMoved] ?? "piece";

  let mistakeContext: string;
  if (bestMoveWasCapture && !wasCapture) {
    mistakeContext = `Instead of capturing, your ${pieceName} moved away — letting your opponent off the hook.`;
  } else if (wasCapture && !bestMoveWasCapture) {
    mistakeContext = `Capturing here backfired — the engine preferred a non-capturing ${pieceName} move instead.`;
  } else if (evalDrop >= 500) {
    mistakeContext = `A game-deciding mistake — this single move swung the position by nearly ${Math.round(evalDrop / 100)} pawns.`;
  } else {
    mistakeContext = `This tactical oversight with your ${pieceName} handed your opponent a significant advantage.`;
  }

  const resultStr =
    gameResult === "win"
      ? "you still won!"
      : gameResult === "loss"
        ? "you ended up losing"
        : "it ended in a draw";

  return (
    <Section title="Your Worst Blunder">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-50">
          <div className="flex gap-2.5 mb-3 flex-wrap">
            <span className="bg-[#3d2522] text-[#fa412d] px-3 py-1 rounded-full text-[0.82em] font-semibold">
              -{worstDrop.toFixed(1)} pawns
            </span>
            <span className="bg-[#3d3a37] text-[#bababa] px-3 py-1 rounded-full text-[0.82em] capitalize">
              Move {moveNumber} · {gamePhase}
            </span>
            {opening && (
              <span className="bg-[#3d3a37] text-[#bababa] px-3 py-1 rounded-full text-[0.82em] capitalize">
                {opening}
              </span>
            )}
          </div>

          <p className="text-[#bababa] text-sm leading-relaxed m-0 mb-2">
            On move <strong className="text-white">{moveNumber}</strong>, you
            played{" "}
            <strong className="text-[#fa412d]">{movePlayed}</strong> instead of{" "}
            <strong className="text-[#81b64c]">{formattedBestMove}</strong> —
            against <strong className="text-white">{opponent}</strong> (
            {resultStr}).
          </p>

          <p className="text-[#989795] text-[0.82em] leading-relaxed m-0">
            {mistakeContext}
          </p>
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
