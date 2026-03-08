import type { Blunder, TimeClass } from "../../../types";
import { BlunderOpeningsSection } from "./BlunderOpeningsSection";
import { BlundersByColor } from "./BlundersByColor";
import { BlundersByGamePhaseSection } from "./BlundersByGamePhaseSection";
import { BlundersByGameResultSection } from "./BlundersByGameResultSection";
import { BlundersByMoveNumberSection } from "./BlundersByMoveNumberSection";
import { BlundersByPieceMovedSection } from "./BlundersByPieceMovedSection";
import { BlundersByTimeControlSection } from "./BlundersByTimeControlSection";
import { BlunderSeveritySection } from "./BlunderSeveritySection";
import { BlunderStatsSection } from "./BlunderStatsSection";
import { CaptureAwarenessSection } from "./CaptureAwarenessSection";
import { PriorityTip } from "./PriorityTip";
import { WorstBlunderSection } from "./WorstBlunderSection";

interface BlundersProps {
  blunders: Blunder[];
  gamesAnalyzed: number;
}

export function Blunders({ blunders, gamesAnalyzed }: Readonly<BlundersProps>) {
  // ── Stats ────────────────────────────────────────────────────
  const total = blunders.length;
  const byPhase = { opening: 0, middlegame: 0, endgame: 0 };
  blunders.forEach((b) => byPhase[b.gamePhase]++);
  const worstPhase = Object.entries(byPhase).sort((a, b) => b[1] - a[1])[0];
  const pieceNames: Record<string, string> = {
    K: "King",
    Q: "Queen",
    R: "Rook",
    B: "Bishop",
    N: "Knight",
    P: "Pawn",
  };
  const byPiece: Record<string, number> = {};
  blunders.forEach((b) => {
    byPiece[b.pieceMoved] = (byPiece[b.pieceMoved] || 0) + 1;
  });
  const worstPiece = Object.entries(byPiece).sort((a, b) => b[1] - a[1])[0];
  const byResult = { win: 0, loss: 0, draw: 0 };
  blunders.forEach((b) => byResult[b.gameResult]++);
  const avgDrop = blunders.reduce((s, b) => s + b.evalDrop, 0) / total / 100;
  const worstBlunder = [...blunders].sort((a, b) => b.evalDrop - a.evalDrop)[0];
  const worstDrop = worstBlunder.evalDrop / 100;
  const missedCaptures = blunders.filter(
    (b) => b.bestMoveWasCapture && !b.wasCapture,
  ).length;
  const blunderWasCapture = blunders.filter((b) => b.wasCapture).length;
  const byColor = { white: 0, black: 0 };
  blunders.forEach((b) => byColor[b.playerColor]++);
  const blundersPerGame =
    gamesAnalyzed > 0 ? (total / gamesAnalyzed).toFixed(1) : "—";
  const phaseLabel: Record<string, string> = {
    opening: "Opening",
    middlegame: "Middlegame",
    endgame: "Endgame",
  };

  // Severity bands
  const critical = blunders.filter((b) => b.evalDrop >= 500).length;
  const major = blunders.filter(
    (b) => b.evalDrop >= 300 && b.evalDrop < 500,
  ).length;
  const moderate = blunders.filter(
    (b) => b.evalDrop >= 200 && b.evalDrop < 300,
  ).length;

  // Move number heatmap
  const moveBuckets = [
    { label: "Moves 1–10", min: 1, max: 10 },
    { label: "Moves 11–20", min: 11, max: 20 },
    { label: "Moves 21–30", min: 21, max: 30 },
    { label: "Moves 31–40", min: 31, max: 40 },
    { label: "Moves 41+", min: 41, max: Infinity },
  ].map((b) => ({
    ...b,
    count: blunders.filter(
      (bl) => bl.moveNumber >= b.min && bl.moveNumber <= b.max,
    ).length,
  }));
  const peakBucket = [...moveBuckets].sort((a, b) => b.count - a.count)[0];

  // Time control
  const byTimeClass: Partial<Record<TimeClass, number>> = {};
  blunders.forEach((b) => {
    byTimeClass[b.timeClass] = (byTimeClass[b.timeClass] || 0) + 1;
  });
  const activeTimeClasses = Object.keys(byTimeClass) as TimeClass[];

  // Openings
  const byOpening: Record<string, number> = {};
  blunders.forEach((b) => {
    if (b.opening) byOpening[b.opening] = (byOpening[b.opening] || 0) + 1;
  });
  const topOpenings = Object.entries(byOpening)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="fade-in flex flex-col gap-5">
      <section>
        <h1 className="m-0 mb-1 text-white text-[1.6em]">Insights</h1>
        <p className="m-0 text-[#989795] text-sm">
          Based on {total} blunder{total !== 1 ? "s" : ""} across{" "}
          {gamesAnalyzed} game{gamesAnalyzed !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Stat cards */}
      <BlunderStatsSection
        total={total}
        blundersPerGame={blundersPerGame}
        avgDrop={avgDrop}
        worstDrop={worstDrop}
        worstPhase={worstPhase}
        worstPiece={worstPiece}
        phaseLabel={phaseLabel}
        pieceNames={pieceNames}
      />

      {/* Severity bands */}
      <BlunderSeveritySection
        critical={critical}
        major={major}
        moderate={moderate}
        total={total}
      />

      {/* Phase + Piece */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <BlundersByGamePhaseSection byPhase={byPhase} total={total} />
        <BlundersByPieceMovedSection
          byPiece={byPiece}
          total={total}
          worstPiece={worstPiece}
          pieceNames={pieceNames}
        />
      </div>

      {/* Move number heatmap */}
      <BlundersByMoveNumberSection
        moveBuckets={moveBuckets}
        total={total}
        peakBucket={peakBucket}
      />

      {/* Time control breakdown */}
      <BlundersByTimeControlSection
        byTimeClass={byTimeClass}
        total={total}
        activeTimeClasses={activeTimeClasses}
      />

      {/* Result + Capture */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <BlundersByGameResultSection byResult={byResult} total={total} />
        <CaptureAwarenessSection
          missedCaptures={missedCaptures}
          blunderWasCapture={blunderWasCapture}
        />
      </div>

      {/* Color */}
      <BlundersByColor byColor={byColor} total={total} />

      {/* Opening names */}
      <BlunderOpeningsSection topOpenings={topOpenings} total={total} blunders={blunders} />

      {/* Worst blunder + View button */}
      <WorstBlunderSection worstBlunder={worstBlunder} worstDrop={worstDrop} />

      {/* Priority tip */}
      <PriorityTip
        worstPhase={worstPhase}
        worstPiece={worstPiece}
        critical={critical}
        missedCaptures={missedCaptures}
        byResult={byResult}
        phaseLabel={phaseLabel}
        pieceNames={pieceNames}
        blunders={blunders}
        total={total}
      />
    </div>
  );
}
