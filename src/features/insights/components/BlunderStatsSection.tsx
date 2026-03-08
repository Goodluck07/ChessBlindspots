import { StatCard } from "./StatCard";

interface BlunderStatsSectionProps {
  total: number;
  blundersPerGame: string;
  avgDrop: number;
  worstDrop: number;
  worstPhase: [string, number];
  worstPiece: [string, number];
  phaseLabel: Record<string, string>;
  pieceNames: Record<string, string>;
}

export function BlunderStatsSection({
  total,
  blundersPerGame,
  avgDrop,
  worstDrop,
  worstPhase,
  worstPiece,
  phaseLabel,
  pieceNames,
}: Readonly<BlunderStatsSectionProps>) {
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] gap-3">
      <StatCard
        label="Total Blunders"
        value={String(total)}
        color="#fa412d"
        hint="Moves where Stockfish found a significantly better option (≥2 pawn swing)."
      />
      <StatCard
        label="Per Game"
        value={String(blundersPerGame)}
        sub="avg"
        color="#e6a23c"
        hint="Average number of blunders per game in this sample."
      />
      <StatCard
        label="Avg Drop"
        value={avgDrop.toFixed(1)}
        sub="pawns"
        color="#e6a23c"
        hint="Average evaluation loss per blunder, in pawns. Lower is better."
      />
      <StatCard
        label="Worst Drop"
        value={worstDrop > 50 ? "Missed #" : worstDrop.toFixed(1)}
        sub={worstDrop > 50 ? undefined : "pawns"}
        color="#fa412d"
        hint={
          worstDrop > 50
            ? "Your single worst blunder allowed a forced checkmate. '#' is chess notation for checkmate."
            : "The biggest single evaluation swing across all your analyzed games."
        }
      />
      <StatCard
        label="Weak Phase"
        value={phaseLabel[worstPhase[0]]}
        color="#81b64c"
        hint="The game phase where you blunder most often — opening (moves 1–10), middlegame, or endgame (move 40+)."
      />
      <StatCard
        label="Trouble Piece"
        value={pieceNames[worstPiece[0]] || "—"}
        color="#81b64c"
        hint="The piece you most frequently move just before a blunder occurs."
      />
    </section>
  );
}
