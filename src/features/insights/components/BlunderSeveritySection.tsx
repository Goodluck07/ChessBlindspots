import { BarRow } from "./BarRow";
import { Section } from "./Section";

interface BlunderSeveritySectionProps {
  critical: number;
  major: number;
  moderate: number;
  total: number;
}

export function BlunderSeveritySection({
  critical,
  major,
  moderate,
  total,
}: BlunderSeveritySectionProps) {
  return (
    <Section title="Blunder Severity">
      <BarRow
        label="Critical  (5+ pawns)"
        count={critical}
        total={total}
        color="#fa412d"
      />
      <BarRow
        label="Major  (3–5 pawns)"
        count={major}
        total={total}
        color="#e6a23c"
      />
      <BarRow
        label="Moderate  (2–3 pawns)"
        count={moderate}
        total={total}
        color="#81b64c"
      />
      <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
        {critical > 0
          ? `${critical} critical blunder${critical > 1 ? "s" : ""} — these are game-ending mistakes. Review them first on the Analyze page.`
          : major > moderate
            ? "Most mistakes are major (3–5 pawns) — serious enough to flip the result."
            : "Your blunders are mostly moderate (2–3 pawns) — smaller mistakes that add up over time."}
      </p>
    </Section>
  );
}
