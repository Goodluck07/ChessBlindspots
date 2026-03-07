import { useState } from "react";
import type { Blunder } from "../../../types";
import { BarRow } from "./BarRow";
import { Section } from "./Section";

interface BlunderOpeningsSectionProps {
  topOpenings: [string, number][];
  total: number;
  blunders: Blunder[];
}

export function BlunderOpeningsSection({
  topOpenings,
  total,
  blunders,
}: BlunderOpeningsSectionProps) {
  const [expandedOpening, setExpandedOpening] = useState<string | null>(null);

  const toggle = (name: string) =>
    setExpandedOpening((prev) => (prev === name ? null : name));

  return (
    <>
      {topOpenings.length > 0 && (
        <Section title="Openings Where You Blunder Most">
          {topOpenings.map(([name, count]) => {
            const isExpanded = expandedOpening === name;
            const openingBlunders = blunders
              .filter((b) => b.opening === name)
              .sort((a, b) => b.evalDrop - a.evalDrop);

            return (
              <div key={name}>
                <BarRow
                  label={name}
                  count={count}
                  total={total}
                  color={count === topOpenings[0][1] ? "#fa412d" : "#5a7a9a"}
                  sublabel={
                    count === topOpenings[0][1] ? "← most blunders" : undefined
                  }
                  expanded={isExpanded}
                  onClick={() => toggle(name)}
                />

                {isExpanded && (
                  <div className="mb-4 mt-1 pl-3 border-l-2 border-[#3d3a37] flex flex-col gap-1.5">
                    {openingBlunders.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-[0.8em] flex-wrap"
                      >
                        <span className="text-[#989795]">
                          Move {b.moveNumber} · {b.gamePhase}
                        </span>
                        <span className="text-[#fa412d] font-semibold">
                          {b.movePlayed}
                        </span>
                        <span className="text-[#5a5856]">→ best:</span>
                        <span className="text-[#81b64c] font-semibold">
                          {b.bestMoveFrom}→{b.bestMoveTo}
                        </span>
                        <span className="text-[#989795]">
                          (-{(b.evalDrop / 100).toFixed(1)})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
            Study the typical middlegame plans and tactical motifs in your most
            problematic openings.
          </p>
        </Section>
      )}
    </>
  );
}
