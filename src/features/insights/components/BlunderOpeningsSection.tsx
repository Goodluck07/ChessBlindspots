import { BarRow } from "./BarRow";
import { Section } from "./Section";

interface BlunderOpeningsSectionProps {
  topOpenings: [string, number][];
  total: number;
}

export function BlunderOpeningsSection({
  topOpenings,
  total,
}: BlunderOpeningsSectionProps) {
  return (
    <>
      {topOpenings.length > 0 && (
        <Section title="Openings Where You Blunder Most">
          {topOpenings.map(([name, count]) => (
            <BarRow
              key={name}
              label={name}
              count={count}
              total={total}
              color={count === topOpenings[0][1] ? "#fa412d" : "#5a7a9a"}
              sublabel={
                count === topOpenings[0][1] ? "← most blunders" : undefined
              }
            />
          ))}
          <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
            Study the typical middlegame plans and tactical motifs in your most
            problematic openings.
          </p>
        </Section>
      )}
    </>
  );
}
