import { BarRow } from "./BarRow";
import { Section } from "./Section";

interface BlundersByGameResultSectionProps {
  byResult: {
    win: number;
    loss: number;
    draw: number;
  };
  total: number;
}

export function BlundersByGameResultSection({
  byResult,
  total,
}: BlundersByGameResultSectionProps) {
  return (
    <Section title="Blunders by Game Result">
      <BarRow
        label="Games you lost"
        count={byResult.loss}
        total={total}
        color="#fa412d"
      />
      <BarRow
        label="Games you won"
        count={byResult.win}
        total={total}
        color="#81b64c"
      />
      <BarRow
        label="Games drawn"
        count={byResult.draw}
        total={total}
        color="#989795"
      />
      <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
        {byResult.loss > byResult.win
          ? `${byResult.loss} blunders in lost games — these mistakes are costing you the point.`
          : `You're blundering even in wins — fixing these would make wins more comfortable.`}
      </p>
    </Section>
  );
}
