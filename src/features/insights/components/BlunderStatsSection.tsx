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
}: BlunderStatsSectionProps) {
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(155px,1fr))] gap-3">
      <StatCard label="Total Blunders" value={String(total)} color="#fa412d" />
      <StatCard
        label="Per Game"
        value={String(blundersPerGame)}
        sub="avg"
        color="#e6a23c"
      />
      <StatCard
        label="Avg Drop"
        value={avgDrop.toFixed(1)}
        sub="pawns"
        color="#e6a23c"
      />
      <StatCard
        label="Worst Drop"
        value={worstDrop.toFixed(1)}
        sub="pawns"
        color="#fa412d"
      />
      <StatCard
        label="Weak Phase"
        value={phaseLabel[worstPhase[0]]}
        color="#81b64c"
      />
      <StatCard
        label="Trouble Piece"
        value={pieceNames[worstPiece[0]] || "—"}
        color="#81b64c"
      />
    </section>
  );
}
