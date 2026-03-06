import type { Blunder } from "../../../types";

interface PriorityTipProps {
  critical: number;
  worstPhase: [string, number];
  phaseLabel: Record<string, string>;
  missedCaptures: number;
  byResult: Record<string, number>;
  blunders: Blunder[];
  total: number;
  pieceNames: Record<string, string>;
  worstPiece: [string, number];
}

export function PriorityTip({
  critical,
  worstPhase,
  phaseLabel,
  missedCaptures,
  byResult,
  blunders,
  total,
  pieceNames,
  worstPiece,
}: PriorityTipProps) {
  return (
    <div className="bg-linear-to-br from-[rgba(129,182,76,0.12)] to-[rgba(129,182,76,0.04)] p-5 rounded-xl border border-[rgba(129,182,76,0.25)]">
      <div className="text-[#81b64c] font-semibold text-sm uppercase tracking-[0.5px] mb-2.5">
        ✓ Your #1 Priority
      </div>
      <p className="m-0 text-white text-base leading-relaxed">
        {critical >= 2
          ? `You have ${critical} critical blunders (5+ pawns). These are game-ending — review them on the Analyze page first.`
          : worstPhase[1] / total >= 0.6
            ? `${Math.round((worstPhase[1] / total) * 100)}% of your blunders happen in the ${phaseLabel[worstPhase[0]].toLowerCase()}. Focus your study there first.`
            : missedCaptures >= 3
              ? `You missed ${missedCaptures} free captures. Train yourself to scan for takes before every single move.`
              : byResult.loss > blunders.length * 0.6
                ? `Most of your blunders happen in games you lose. Slowing down on critical moments could flip results.`
                : `Your biggest trouble piece is the ${(pieceNames[worstPiece[0]] || "pawn").toLowerCase()} with ${worstPiece[1]} blunders. Pause and double-check before moving it.`}
      </p>
    </div>
  );
}
