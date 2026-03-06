import { BarRow } from "./BarRow";
import { Section } from "./Section";

interface BlundersByMoveNumberSectionProps {
  moveBuckets: { label: string; count: number }[];
  total: number;
  peakBucket: { label: string; count: number };
}

export function BlundersByMoveNumberSection({
  moveBuckets,
  total,
  peakBucket,
}: BlundersByMoveNumberSectionProps) {
  return (
    <Section title="When Do You Blunder? (by Move Number)">
      {moveBuckets.map((b) => (
        <BarRow
          key={b.label}
          label={b.label}
          count={b.count}
          total={total}
          color={b.label === peakBucket.label ? "#e6a23c" : "#5a7a9a"}
          sublabel={b.label === peakBucket.label ? "← danger zone" : undefined}
        />
      ))}
      {peakBucket.count > 0 && (
        <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
          You blunder most during{" "}
          <strong className="text-[#e6a23c]">
            {peakBucket.label.toLowerCase()}
          </strong>
          . Slow down and double-check during this stage.
        </p>
      )}
    </Section>
  );
}
