import type { Blunder, TimeClass } from "../types";

interface CachedMeta {
  username: string;
  blunders: Blunder[];
  gamesAnalyzed: number;
  timestamp: number;
}

interface InsightsPageProps {
  blunders: Blunder[];
  gamesAnalyzed: number;
  onGoAnalyze: () => void;
  onViewWorstBlunder: () => void;
  cachedAnalyses: CachedMeta[];
  onLoadCache: (username: string) => void;
}

function BarRow({
  label,
  count,
  total,
  color,
  sublabel,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  sublabel?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1.5">
        <span className="text-[#bababa] text-[0.9em]">
          {label}
          {sublabel && (
            <span className="text-[#5a5856] text-[0.8em] ml-1.5">
              {sublabel}
            </span>
          )}
        </span>
        <span className="font-bold text-[0.9em]" style={{ color }}>
          {count}
        </span>
      </div>
      <div className="h-2 bg-[#272522] rounded overflow-hidden">
        <div
          className="h-full rounded transition-[width] duration-600 ease-in-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            minWidth: count > 0 ? "4px" : "0",
          }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="bg-[#1e1c1a] border border-[#3d3a37] rounded-[10px] pl-5 pr-5 py-4 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="text-[#989795] text-[0.7em] uppercase tracking-wide mb-1.5 font-medium">
        {label}
      </div>
      <div className="text-[1.8em] font-bold leading-none" style={{ color }}>
        {value}
        {sub && (
          <span className="text-[0.4em] text-[#989795] font-normal ml-1.5">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-6">
      <h3 className="m-0 mb-5 text-white text-base font-semibold uppercase tracking-[0.5px]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function InsightsPage({
  blunders,
  gamesAnalyzed,
  onGoAnalyze,
  onViewWorstBlunder,
  cachedAnalyses,
  onLoadCache,
}: InsightsPageProps) {
  if (blunders.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-10 text-center">
          <div className="text-[3em] mb-4 opacity-50">📊</div>
          <h2 className="text-white m-0 mb-3">No data yet</h2>
          <p className="text-[#989795] m-0 mb-7">
            Analyze your games first to see insights.
          </p>
          <button
            onClick={onGoAnalyze}
            className="bg-[#81b64c] text-[#1a1a1a] rounded-lg px-7 py-3 font-bold text-base cursor-pointer"
          >
            Go Analyze My Games
          </button>
        </div>
        {cachedAnalyses.length > 0 && (
          <div className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-6">
            <h3 className="m-0 mb-4 text-white text-base font-semibold uppercase tracking-[0.5px]">
              Previously Analyzed
            </h3>
            <div className="flex flex-col gap-2.5">
              {cachedAnalyses.map((c) => (
                <div
                  key={c.username}
                  className="flex items-center justify-between flex-wrap gap-2.5 p-3.5 bg-[#272522] rounded-lg border border-[#3d3a37]"
                >
                  <div>
                    <div className="text-white font-semibold text-[0.95em]">
                      {c.username}
                    </div>
                    <div className="text-[#5a5856] text-[0.78em] mt-0.5">
                      {c.blunders.length} blunders · {c.gamesAnalyzed} games ·{" "}
                      {timeAgo(c.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => onLoadCache(c.username)}
                    className="bg-[rgba(129,182,76,0.15)] text-[#81b64c] border border-[rgba(129,182,76,0.3)] rounded-md px-4 py-1.5 text-[0.85em] font-semibold cursor-pointer"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Stats ────────────────────────────────────────────────────
  const total = blunders.length;
  const byPhase = { opening: 0, middlegame: 0, endgame: 0 };
  blunders.forEach((b) => byPhase[b.gamePhase]++);
  const worstPhase = Object.entries(byPhase).sort((a, b) => b[1] - a[1])[0];
  const pieceNames: Record<string, string> = {
    K: "King",
    Q: "Queen",
    R: "Rook",
    B: "Bishop",
    N: "Knight",
    P: "Pawn",
  };
  const byPiece: Record<string, number> = {};
  blunders.forEach((b) => {
    byPiece[b.pieceMoved] = (byPiece[b.pieceMoved] || 0) + 1;
  });
  const worstPiece = Object.entries(byPiece).sort((a, b) => b[1] - a[1])[0];
  const byResult = { win: 0, loss: 0, draw: 0 };
  blunders.forEach((b) => byResult[b.gameResult]++);
  const avgDrop = blunders.reduce((s, b) => s + b.evalDrop, 0) / total / 100;
  const worstBlunder = [...blunders].sort((a, b) => b.evalDrop - a.evalDrop)[0];
  const worstDrop = worstBlunder.evalDrop / 100;
  const missedCaptures = blunders.filter(
    (b) => b.bestMoveWasCapture && !b.wasCapture,
  ).length;
  const blunderWasCapture = blunders.filter((b) => b.wasCapture).length;
  const byColor = { white: 0, black: 0 };
  blunders.forEach((b) => byColor[b.playerColor]++);
  const blundersPerGame =
    gamesAnalyzed > 0 ? (total / gamesAnalyzed).toFixed(1) : "—";
  const phaseLabel: Record<string, string> = {
    opening: "Opening",
    middlegame: "Middlegame",
    endgame: "Endgame",
  };

  // Severity bands
  const critical = blunders.filter((b) => b.evalDrop >= 500).length;
  const major = blunders.filter(
    (b) => b.evalDrop >= 300 && b.evalDrop < 500,
  ).length;
  const moderate = blunders.filter(
    (b) => b.evalDrop >= 200 && b.evalDrop < 300,
  ).length;

  // Move number heatmap
  const moveBuckets = [
    { label: "Moves 1–10", min: 1, max: 10 },
    { label: "Moves 11–20", min: 11, max: 20 },
    { label: "Moves 21–30", min: 21, max: 30 },
    { label: "Moves 31–40", min: 31, max: 40 },
    { label: "Moves 41+", min: 41, max: Infinity },
  ].map((b) => ({
    ...b,
    count: blunders.filter(
      (bl) => bl.moveNumber >= b.min && bl.moveNumber <= b.max,
    ).length,
  }));
  const peakBucket = [...moveBuckets].sort((a, b) => b.count - a.count)[0];

  // Time control
  const timeClassLabels: Record<TimeClass, string> = {
    bullet: "Bullet",
    blitz: "Blitz",
    rapid: "Rapid",
    daily: "Daily",
  };
  const byTimeClass: Partial<Record<TimeClass, number>> = {};
  blunders.forEach((b) => {
    byTimeClass[b.timeClass] = (byTimeClass[b.timeClass] || 0) + 1;
  });
  const activeTimeClasses = Object.keys(byTimeClass) as TimeClass[];

  // Openings
  const byOpening: Record<string, number> = {};
  blunders.forEach((b) => {
    if (b.opening) byOpening[b.opening] = (byOpening[b.opening] || 0) + 1;
  });
  const topOpenings = Object.entries(byOpening)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="fade-in flex flex-col gap-5">
      <div>
        <h2 className="m-0 mb-1 text-white text-[1.6em]">Insights</h2>
        <p className="m-0 text-[#989795] text-[0.9em]">
          Based on {total} blunder{total !== 1 ? "s" : ""} across{" "}
          {gamesAnalyzed} game{gamesAnalyzed !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        <StatCard
          label="Total Blunders"
          value={String(total)}
          color="#fa412d"
        />
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
      </div>

      {/* Severity bands */}
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

      {/* Phase + Piece */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
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
          <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
            {byPhase.middlegame >= byPhase.opening &&
            byPhase.middlegame >= byPhase.endgame
              ? "Most blunders in the middlegame — train tactical pattern recognition."
              : byPhase.opening >= byPhase.endgame
                ? "Opening blunders — focus on development, center control, and not leaving pieces undefended."
                : "Endgame blunders — practice king activity and pawn endings."}
          </p>
        </Section>
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
      </div>

      {/* Move number heatmap */}
      <Section title="When Do You Blunder? (by Move Number)">
        {moveBuckets.map((b) => (
          <BarRow
            key={b.label}
            label={b.label}
            count={b.count}
            total={total}
            color={b.label === peakBucket.label ? "#e6a23c" : "#5a7a9a"}
            sublabel={
              b.label === peakBucket.label ? "← danger zone" : undefined
            }
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

      {/* Time control breakdown */}
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

      {/* Result + Capture */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
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
        <Section title="Capture Awareness">
          <div className="flex flex-col gap-4">
            {[
              {
                value: missedCaptures,
                label: "Missed captures",
                desc: "Best move was taking a piece — you played something else",
                color: "#fa412d",
              },
              {
                value: blunderWasCapture,
                label: "Blunders were captures",
                desc: "You took a piece but it was the wrong move",
                color: "#e6a23c",
              },
            ].map(({ value, label, desc, color }) => (
              <div
                key={label}
                className="flex justify-between items-center p-3.5 bg-[#272522] rounded-lg border border-[#3d3a37]"
              >
                <div>
                  <div className="font-bold text-[1.4em]" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-[#989795] text-[0.8em] mt-0.5">
                    {label}
                  </div>
                </div>
                <div className="text-[#989795] text-[0.82em] max-w-40 text-right leading-relaxed">
                  {desc}
                </div>
              </div>
            ))}
            {missedCaptures >= 2 && (
              <p className="m-0 text-[#989795] text-[0.82em] leading-relaxed">
                Scan for captures before every move: "Can I take anything? Is
                anything undefended?"
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* Color */}
      <Section title="Blunders by Color">
        <div className="flex gap-4 flex-wrap">
          {[
            {
              label: "As White",
              count: byColor.white,
              color: "#ebecd0",
              bg: "rgba(235,236,208,0.08)",
            },
            {
              label: "As Black",
              count: byColor.black,
              color: "#779556",
              bg: "rgba(119,149,86,0.12)",
            },
          ].map(({ label, count, color, bg }) => (
            <div
              key={label}
              className="flex-1 min-w-30 rounded-[10px] p-5 text-center"
              style={{ backgroundColor: bg, border: `1px solid ${color}40` }}
            >
              <div className="text-[2em] font-bold" style={{ color }}>
                {count}
              </div>
              <div className="text-[#989795] text-[0.85em] mt-1">{label}</div>
              <div className="text-[#5a5856] text-[0.75em] mt-0.5">
                {total > 0 ? `${Math.round((count / total) * 100)}%` : "—"}
              </div>
            </div>
          ))}
        </div>
        {byColor.white !== byColor.black && (
          <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
            {byColor.white > byColor.black
              ? "You blunder more as White — possibly overextending when you have the initiative."
              : "You blunder more as Black — possibly struggling under pressure to find defensive resources."}
          </p>
        )}
      </Section>

      {/* Opening names */}
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

      {/* Worst blunder + View button */}
      <Section title="Your Worst Blunder">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-50">
            <div className="flex gap-2.5 mb-3 flex-wrap">
              <span className="bg-[#3d2522] text-[#fa412d] px-3 py-1 rounded-full text-[0.82em] font-semibold">
                -{worstDrop.toFixed(1)} pawns
              </span>
              <span className="bg-[#3d3a37] text-[#bababa] px-3 py-1 rounded-full text-[0.82em] capitalize">
                Move {worstBlunder.moveNumber} · {worstBlunder.gamePhase}
              </span>
              {worstBlunder.opening && (
                <span className="bg-[#3d3a37] text-[#bababa] px-3 py-1 rounded-full text-[0.82em]">
                  {worstBlunder.opening}
                </span>
              )}
            </div>
            <div className="text-[#bababa] text-[0.9em] leading-relaxed">
              You played{" "}
              <strong className="text-[#fa412d]">
                {worstBlunder.movePlayed}
              </strong>{" "}
              when{" "}
              <strong className="text-[#81b64c]">
                {worstBlunder.bestMove.slice(0, 4)}
              </strong>{" "}
              was better — vs{" "}
              <strong className="text-white">{worstBlunder.opponent}</strong> (
              {worstBlunder.gameResult === "loss"
                ? "you lost"
                : worstBlunder.gameResult === "win"
                  ? "you won anyway"
                  : "draw"}
              )
            </div>
          </div>
          <button
            onClick={onViewWorstBlunder}
            className="bg-[rgba(129,182,76,0.15)] text-[#81b64c] border border-[rgba(129,182,76,0.3)] rounded-lg px-5 py-2.5 text-[0.9em] font-semibold cursor-pointer whitespace-nowrap"
          >
            View on Board →
          </button>
        </div>
      </Section>

      {/* Priority tip */}
      <div className="bg-linear-to-br from-[rgba(129,182,76,0.12)] to-[rgba(129,182,76,0.04)] p-5 rounded-xl border border-[rgba(129,182,76,0.25)]">
        <div className="text-[#81b64c] font-semibold text-[0.85em] uppercase tracking-[0.5px] mb-2.5">
          ✓ Your #1 Priority
        </div>
        <p className="m-0 text-white text-[1.05em] leading-relaxed">
          {critical >= 2
            ? `You have ${critical} critical blunders (5+ pawns). These are game-ending — review them on the Analyze page first.`
            : worstPhase[1] / total >= 0.6
              ? `${Math.round((worstPhase[1] / total) * 100)}% of your blunders happen in the ${phaseLabel[worstPhase[0]].toLowerCase()}. Focus your study there first.`
              : missedCaptures >= 3
                ? `You missed ${missedCaptures} free captures. Train yourself to scan for takes before every single move.`
                : byResult.loss > blunders.length * 0.6
                  ? `Most of your blunders happen in games you lose. Slowing down on critical moments could flip results.`
                  : `Your biggest trouble piece is the ${(pieceNames[worstPiece[0]] || "pawn").toLowerCase()} with ${worstPiece[1]} blunders. Pause and double-check before moving it.`}
        </p>
      </div>
    </div>
  );
}
