import { Section } from "./Section";
import { BarRow } from "./BarRow";

interface BlundersByPieceMovedSectionProps {
  byPiece: Record<string, number>;
  total: number;
  worstPiece: [string, number];
  pieceNames: Record<string, string>;
}

export function BlundersByPieceMovedSection({
  byPiece,
  total,
  worstPiece,
  pieceNames,
}: BlundersByPieceMovedSectionProps) {
  return (
    <Section title="Blunders by Piece Moved">
      {["P", "N", "B", "R", "Q", "K"].map((p) => (
        <BarRow
          key={p}
          label={pieceNames[p]}
          count={byPiece[p] || 0}
          total={total}
          color={p === worstPiece[0] ? "#fa412d" : "#5a7a9a"}
          sublabel={p === worstPiece[0] ? "← most blundered" : undefined}
        />
      ))}
    </Section>
  );
}
