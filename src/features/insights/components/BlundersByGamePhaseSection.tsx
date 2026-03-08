import { Link } from "react-router-dom";
import { BarRow } from "./BarRow";
import { Section } from "./Section";

interface BlundersByGamePhaseSectionProps {
  byPhase: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
  total: number;
}

export function BlundersByGamePhaseSection({
  byPhase,
  total,
}: Readonly<BlundersByGamePhaseSectionProps>) {
  return (
    <Section title="Blunders by Game Phase">
      <BarRow
        label="Middlegame"
        count={byPhase.middlegame}
        total={total}
        color="#e6a23c"
      />
      <BarRow
        label="Opening"
        count={byPhase.opening}
        total={total}
        color="#81b64c"
      />
      <BarRow
        label="Endgame"
        count={byPhase.endgame}
        total={total}
        color="#5b9a32"
      />
      <div className="flex gap-2 flex-wrap mt-1">
        {(["middlegame", "opening", "endgame"] as const).map((phase) =>
          byPhase[phase] > 0 ? (
            <Link
              key={phase}
              to={`/practice?phase=${phase}`}
              className="text-xs text-[#5a7a9a] hover:text-[#81b64c] transition-colors capitalize"
            >
              Drill {phase} →
            </Link>
          ) : null,
        )}
      </div>
      <p className="mt-3 text-[#989795] text-[0.82em] leading-relaxed">
        {byPhase.middlegame >= byPhase.opening &&
        byPhase.middlegame >= byPhase.endgame
          ? "Most blunders in the middlegame — train tactical pattern recognition."
          : byPhase.opening >= byPhase.endgame
            ? "Opening blunders — focus on development, center control, and not leaving pieces undefended."
            : "Endgame blunders — practice king activity and pawn endings."}
      </p>
    </Section>
  );
}
