import { Section } from "./Section";
import type { TimeClass } from "../../../types";
import { BarRow } from "./BarRow";

interface BlundersByTimeControlSectionProps {
  byTimeClass: Partial<Record<TimeClass, number>>;
  total: number;
  activeTimeClasses: TimeClass[];
}

export function BlundersByTimeControlSection({
  byTimeClass,
  total,
  activeTimeClasses,
}: BlundersByTimeControlSectionProps) {
  const timeClassLabels: Record<TimeClass, string> = {
    bullet: "Bullet",
    blitz: "Blitz",
    rapid: "Rapid",
    daily: "Daily",
  };

  return (
    <>
      {activeTimeClasses.length > 0 && (
        <Section title="Blunders by Time Control">
          {(["bullet", "blitz", "rapid", "daily"] as TimeClass[])
            .filter((tc) => byTimeClass[tc] !== undefined)
            .map((tc) => (
              <BarRow
                key={tc}
                label={timeClassLabels[tc]}
                count={byTimeClass[tc] ?? 0}
                total={total}
                color={
                  tc === "bullet"
                    ? "#fa412d"
                    : tc === "blitz"
                      ? "#e6a23c"
                      : tc === "rapid"
                        ? "#81b64c"
                        : "#5a7a9a"
                }
              />
            ))}
          <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
            {activeTimeClasses.length === 1
              ? `All blunders are from ${timeClassLabels[activeTimeClasses[0]]} games.`
              : "Compare across time controls to see where time pressure hurts you most."}
          </p>
        </Section>
      )}
    </>
  );
}
