import { useState } from "react";
import type { Blunder } from "../../../types";
import { Button } from "../../../components/ui/Button";

interface DrillFiltersProps {
  blunders: Blunder[];
  initialPhase?: string;
  initialOpening?: string;
  initialSeverity?: string;
  onStart: (queue: Blunder[]) => void;
}

type Phase = "all" | "opening" | "middlegame" | "endgame";
type Severity = "all" | "critical" | "major" | "moderate";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASE_LABELS: Record<Phase, string> = {
  all: "All Phases",
  opening: "Opening",
  middlegame: "Middlegame",
  endgame: "Endgame",
};

const SEVERITY_LABELS: Record<Severity, string> = {
  all: "All",
  critical: "Critical (5+)",
  major: "Major (3–5)",
  moderate: "Moderate (2–3)",
};

function filterBlunders(
  blunders: Blunder[],
  phase: Phase,
  severity: Severity,
  opening: string,
): Blunder[] {
  return blunders.filter((b) => {
    if (phase !== "all" && b.gamePhase !== phase) return false;
    if (severity === "critical" && b.evalDrop < 500) return false;
    if (severity === "major" && (b.evalDrop < 300 || b.evalDrop >= 500))
      return false;
    if (severity === "moderate" && (b.evalDrop < 200 || b.evalDrop >= 300))
      return false;
    if (opening !== "all" && b.opening !== opening) return false;
    return true;
  });
}

export function DrillFilters({
  blunders,
  initialPhase,
  initialOpening,
  initialSeverity,
  onStart,
}: Readonly<DrillFiltersProps>) {
  const [phase, setPhase] = useState<Phase>(
    (initialPhase as Phase) ?? "all",
  );
  const [severity, setSeverity] = useState<Severity>(
    (initialSeverity as Severity) ?? "all",
  );

  const openingNames = Array.from(
    new Set(blunders.map((b) => b.opening).filter(Boolean) as string[]),
  ).sort();
  const [opening, setOpening] = useState<string>(
    initialOpening && openingNames.includes(initialOpening)
      ? initialOpening
      : "all",
  );

  const filtered = filterBlunders(blunders, phase, severity, opening);
  const count = filtered.length;

  const handleStart = () => {
    if (count === 0) return;
    onStart(shuffle(filtered));
  };

  return (
    <div className="fade-in flex flex-col gap-5 max-w-lg">
      <section>
        <h1 className="m-0 mb-1 text-white text-[1.6em]">Practice</h1>
        <p className="m-0 text-[#989795] text-sm">
          Drill positions from your own games. Find the best move to score.
        </p>
      </section>

      {/* Filters */}
      <section className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-5 flex flex-col gap-4">
        {/* Phase */}
        <div>
          <div className="text-[#989795] text-xs font-semibold uppercase tracking-[0.5px] mb-2">
            Game Phase
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PHASE_LABELS) as Phase[]).map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  phase === p
                    ? "bg-[#81b64c] text-white"
                    : "bg-[#272522] text-[#989795] border border-[#3d3a37] hover:border-[#81b64c] hover:text-[#bababa]"
                }`}
              >
                {PHASE_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div>
          <div className="text-[#989795] text-xs font-semibold uppercase tracking-[0.5px] mb-2">
            Severity
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SEVERITY_LABELS) as Severity[]).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  severity === s
                    ? "bg-[#81b64c] text-white"
                    : "bg-[#272522] text-[#989795] border border-[#3d3a37] hover:border-[#81b64c] hover:text-[#bababa]"
                }`}
              >
                {SEVERITY_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Opening */}
        {openingNames.length > 0 && (
          <div>
            <div className="text-[#989795] text-xs font-semibold uppercase tracking-[0.5px] mb-2">
              Opening
            </div>
            <select
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              className="w-full bg-[#272522] border border-[#3d3a37] text-[#bababa] rounded-md px-3 py-2 text-sm outline-none focus:border-[#81b64c] transition-colors cursor-pointer"
            >
              <option value="all">All Openings</option>
              {openingNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Start */}
      <div className="flex items-center gap-4">
        <Button onClick={handleStart} disabled={count === 0}>
          Start Drill
        </Button>
        <span
          className={`text-sm font-medium ${count > 0 ? "text-[#81b64c]" : "text-[#5a5856]"}`}
        >
          {count} puzzle{count !== 1 ? "s" : ""} ready
        </span>
      </div>
    </div>
  );
}
