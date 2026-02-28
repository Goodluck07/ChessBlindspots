import type { Blunder, TimeClass } from '../types';

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

function BarRow({ label, count, total, color, sublabel }: {
  label: string; count: number; total: number; color: string; sublabel?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: '#bababa', fontSize: '0.9em' }}>
          {label}
          {sublabel && <span style={{ color: '#5a5856', fontSize: '0.8em', marginLeft: '6px' }}>{sublabel}</span>}
        </span>
        <span style={{ color, fontWeight: 700, fontSize: '0.9em' }}>{count}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#272522', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '4px', transition: 'width 0.6s ease', minWidth: count > 0 ? '4px' : '0' }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div style={{ backgroundColor: '#1e1c1a', border: '1px solid #3d3a37', borderLeft: `3px solid ${color}`, borderRadius: '10px', padding: '16px 20px' }}>
      <div style={{ color: '#989795', fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      <div style={{ color, fontSize: '1.8em', fontWeight: 700, lineHeight: 1 }}>
        {value}
        {sub && <span style={{ fontSize: '0.4em', color: '#989795', fontWeight: 400, marginLeft: '6px' }}>{sub}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#1e1c1a', border: '1px solid #3d3a37', borderRadius: '12px', padding: '24px' }}>
      <h3 style={{ margin: '0 0 20px', color: '#fff', fontSize: '1em', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
      {children}
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function InsightsPage({ blunders, gamesAnalyzed, onGoAnalyze, onViewWorstBlunder, cachedAnalyses, onLoadCache }: InsightsPageProps) {

  if (blunders.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ backgroundColor: '#1e1c1a', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px solid #3d3a37' }}>
          <div style={{ fontSize: '3em', marginBottom: '16px', opacity: 0.5 }}>📊</div>
          <h2 style={{ color: '#fff', margin: '0 0 12px' }}>No data yet</h2>
          <p style={{ color: '#989795', margin: '0 0 28px' }}>Analyze your games first to see insights.</p>
          <button onClick={onGoAnalyze} style={{ backgroundColor: '#81b64c', color: '#1a1a1a', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 700, fontSize: '1em', cursor: 'pointer' }}>
            Go Analyze My Games
          </button>
        </div>
        {cachedAnalyses.length > 0 && (
          <div style={{ backgroundColor: '#1e1c1a', borderRadius: '12px', padding: '24px', border: '1px solid #3d3a37' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1em', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Previously Analyzed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cachedAnalyses.map(c => (
                <div key={c.username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: '#272522', borderRadius: '8px', border: '1px solid #3d3a37', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95em' }}>{c.username}</div>
                    <div style={{ color: '#5a5856', fontSize: '0.78em', marginTop: '2px' }}>{c.blunders.length} blunders · {c.gamesAnalyzed} games · {timeAgo(c.timestamp)}</div>
                  </div>
                  <button onClick={() => onLoadCache(c.username)} style={{ backgroundColor: 'rgba(129,182,76,0.15)', color: '#81b64c', border: '1px solid rgba(129,182,76,0.3)', borderRadius: '6px', padding: '7px 16px', fontSize: '0.85em', fontWeight: 600, cursor: 'pointer' }}>Load</button>
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
  blunders.forEach(b => byPhase[b.gamePhase]++);
  const worstPhase = Object.entries(byPhase).sort((a, b) => b[1] - a[1])[0];
  const pieceNames: Record<string, string> = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
  const byPiece: Record<string, number> = {};
  blunders.forEach(b => { byPiece[b.pieceMoved] = (byPiece[b.pieceMoved] || 0) + 1; });
  const worstPiece = Object.entries(byPiece).sort((a, b) => b[1] - a[1])[0];
  const byResult = { win: 0, loss: 0, draw: 0 };
  blunders.forEach(b => byResult[b.gameResult]++);
  const avgDrop = blunders.reduce((s, b) => s + b.evalDrop, 0) / total / 100;
  const worstBlunder = [...blunders].sort((a, b) => b.evalDrop - a.evalDrop)[0];
  const worstDrop = worstBlunder.evalDrop / 100;
  const missedCaptures = blunders.filter(b => b.bestMoveWasCapture && !b.wasCapture).length;
  const blunderWasCapture = blunders.filter(b => b.wasCapture).length;
  const byColor = { white: 0, black: 0 };
  blunders.forEach(b => byColor[b.playerColor]++);
  const blundersPerGame = gamesAnalyzed > 0 ? (total / gamesAnalyzed).toFixed(1) : '—';
  const phaseLabel: Record<string, string> = { opening: 'Opening', middlegame: 'Middlegame', endgame: 'Endgame' };

  // Severity bands
  const critical = blunders.filter(b => b.evalDrop >= 500).length;
  const major = blunders.filter(b => b.evalDrop >= 300 && b.evalDrop < 500).length;
  const moderate = blunders.filter(b => b.evalDrop >= 200 && b.evalDrop < 300).length;

  // Move number heatmap
  const moveBuckets = [
    { label: 'Moves 1–10', min: 1, max: 10 },
    { label: 'Moves 11–20', min: 11, max: 20 },
    { label: 'Moves 21–30', min: 21, max: 30 },
    { label: 'Moves 31–40', min: 31, max: 40 },
    { label: 'Moves 41+', min: 41, max: Infinity },
  ].map(b => ({ ...b, count: blunders.filter(bl => bl.moveNumber >= b.min && bl.moveNumber <= b.max).length }));
  const peakBucket = [...moveBuckets].sort((a, b) => b.count - a.count)[0];

  // Time control
  const timeClassLabels: Record<TimeClass, string> = { bullet: 'Bullet', blitz: 'Blitz', rapid: 'Rapid', daily: 'Daily' };
  const byTimeClass: Partial<Record<TimeClass, number>> = {};
  blunders.forEach(b => { byTimeClass[b.timeClass] = (byTimeClass[b.timeClass] || 0) + 1; });
  const activeTimeClasses = Object.keys(byTimeClass) as TimeClass[];

  // Openings
  const byOpening: Record<string, number> = {};
  blunders.forEach(b => { if (b.opening) byOpening[b.opening] = (byOpening[b.opening] || 0) + 1; });
  const topOpenings = Object.entries(byOpening).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div>
        <h2 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.6em' }}>Insights</h2>
        <p style={{ margin: 0, color: '#989795', fontSize: '0.9em' }}>
          Based on {total} blunder{total !== 1 ? 's' : ''} across {gamesAnalyzed} game{gamesAnalyzed !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <StatCard label="Total Blunders" value={String(total)} color="#fa412d" />
        <StatCard label="Per Game" value={String(blundersPerGame)} sub="avg" color="#e6a23c" />
        <StatCard label="Avg Drop" value={avgDrop.toFixed(1)} sub="pawns" color="#e6a23c" />
        <StatCard label="Worst Drop" value={worstDrop.toFixed(1)} sub="pawns" color="#fa412d" />
        <StatCard label="Weak Phase" value={phaseLabel[worstPhase[0]]} color="#81b64c" />
        <StatCard label="Trouble Piece" value={pieceNames[worstPiece[0]] || '—'} color="#81b64c" />
      </div>

      {/* Severity bands */}
      <Section title="Blunder Severity">
        <BarRow label="Critical  (5+ pawns)" count={critical} total={total} color="#fa412d" />
        <BarRow label="Major  (3–5 pawns)" count={major} total={total} color="#e6a23c" />
        <BarRow label="Moderate  (2–3 pawns)" count={moderate} total={total} color="#81b64c" />
        <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
          {critical > 0
            ? `${critical} critical blunder${critical > 1 ? 's' : ''} — these are game-ending mistakes. Review them first on the Analyze page.`
            : major > moderate
            ? 'Most mistakes are major (3–5 pawns) — serious enough to flip the result.'
            : 'Your blunders are mostly moderate (2–3 pawns) — smaller mistakes that add up over time.'}
        </p>
      </Section>

      {/* Phase + Piece */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section title="Blunders by Game Phase">
          <BarRow label="Middlegame" count={byPhase.middlegame} total={total} color="#e6a23c" />
          <BarRow label="Opening" count={byPhase.opening} total={total} color="#81b64c" />
          <BarRow label="Endgame" count={byPhase.endgame} total={total} color="#5b9a32" />
          <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
            {byPhase.middlegame >= byPhase.opening && byPhase.middlegame >= byPhase.endgame
              ? 'Most blunders in the middlegame — train tactical pattern recognition.'
              : byPhase.opening >= byPhase.endgame
              ? 'Opening blunders — focus on development, center control, and not leaving pieces undefended.'
              : 'Endgame blunders — practice king activity and pawn endings.'}
          </p>
        </Section>
        <Section title="Blunders by Piece Moved">
          {['P', 'N', 'B', 'R', 'Q', 'K'].map(p => (
            <BarRow key={p} label={pieceNames[p]} count={byPiece[p] || 0} total={total}
              color={p === worstPiece[0] ? '#fa412d' : '#5a7a9a'}
              sublabel={p === worstPiece[0] ? '← most blundered' : undefined}
            />
          ))}
        </Section>
      </div>

      {/* Move number heatmap */}
      <Section title="When Do You Blunder? (by Move Number)">
        {moveBuckets.map(b => (
          <BarRow key={b.label} label={b.label} count={b.count} total={total}
            color={b.label === peakBucket.label ? '#e6a23c' : '#5a7a9a'}
            sublabel={b.label === peakBucket.label ? '← danger zone' : undefined}
          />
        ))}
        {peakBucket.count > 0 && (
          <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
            You blunder most during <strong style={{ color: '#e6a23c' }}>{peakBucket.label.toLowerCase()}</strong>. Slow down and double-check during this stage.
          </p>
        )}
      </Section>

      {/* Time control breakdown */}
      {activeTimeClasses.length > 0 && (
        <Section title="Blunders by Time Control">
          {(['bullet', 'blitz', 'rapid', 'daily'] as TimeClass[]).filter(tc => byTimeClass[tc] !== undefined).map(tc => (
            <BarRow key={tc} label={timeClassLabels[tc]} count={byTimeClass[tc] ?? 0} total={total}
              color={tc === 'bullet' ? '#fa412d' : tc === 'blitz' ? '#e6a23c' : tc === 'rapid' ? '#81b64c' : '#5a7a9a'}
            />
          ))}
          <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
            {activeTimeClasses.length === 1
              ? `All blunders are from ${timeClassLabels[activeTimeClasses[0]]} games.`
              : 'Compare across time controls to see where time pressure hurts you most.'}
          </p>
        </Section>
      )}

      {/* Result + Capture */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Section title="Blunders by Game Result">
          <BarRow label="Games you lost" count={byResult.loss} total={total} color="#fa412d" />
          <BarRow label="Games you won" count={byResult.win} total={total} color="#81b64c" />
          <BarRow label="Games drawn" count={byResult.draw} total={total} color="#989795" />
          <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
            {byResult.loss > byResult.win
              ? `${byResult.loss} blunders in lost games — these mistakes are costing you the point.`
              : `You're blundering even in wins — fixing these would make wins more comfortable.`}
          </p>
        </Section>
        <Section title="Capture Awareness">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { value: missedCaptures, label: 'Missed captures', desc: 'Best move was taking a piece — you played something else', color: '#fa412d' },
              { value: blunderWasCapture, label: 'Blunders were captures', desc: 'You took a piece but it was the wrong move', color: '#e6a23c' },
            ].map(({ value, label, desc, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#272522', borderRadius: '8px', border: '1px solid #3d3a37' }}>
                <div>
                  <div style={{ color, fontWeight: 700, fontSize: '1.4em' }}>{value}</div>
                  <div style={{ color: '#989795', fontSize: '0.8em', marginTop: '2px' }}>{label}</div>
                </div>
                <div style={{ color: '#989795', fontSize: '0.82em', maxWidth: '160px', textAlign: 'right', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
            {missedCaptures >= 2 && (
              <p style={{ margin: 0, color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
                Scan for captures before every move: "Can I take anything? Is anything undefended?"
              </p>
            )}
          </div>
        </Section>
      </div>

      {/* Color */}
      <Section title="Blunders by Color">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'As White', count: byColor.white, color: '#ebecd0', bg: 'rgba(235,236,208,0.08)' },
            { label: 'As Black', count: byColor.black, color: '#779556', bg: 'rgba(119,149,86,0.12)' },
          ].map(({ label, count, color, bg }) => (
            <div key={label} style={{ flex: 1, minWidth: '120px', backgroundColor: bg, border: `1px solid ${color}40`, borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
              <div style={{ color, fontSize: '2em', fontWeight: 700 }}>{count}</div>
              <div style={{ color: '#989795', fontSize: '0.85em', marginTop: '4px' }}>{label}</div>
              <div style={{ color: '#5a5856', fontSize: '0.75em', marginTop: '2px' }}>{total > 0 ? `${Math.round((count / total) * 100)}%` : '—'}</div>
            </div>
          ))}
        </div>
        {byColor.white !== byColor.black && (
          <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
            {byColor.white > byColor.black
              ? 'You blunder more as White — possibly overextending when you have the initiative.'
              : 'You blunder more as Black — possibly struggling under pressure to find defensive resources.'}
          </p>
        )}
      </Section>

      {/* Opening names */}
      {topOpenings.length > 0 && (
        <Section title="Openings Where You Blunder Most">
          {topOpenings.map(([name, count]) => (
            <BarRow key={name} label={name} count={count} total={total}
              color={count === topOpenings[0][1] ? '#fa412d' : '#5a7a9a'}
              sublabel={count === topOpenings[0][1] ? '← most blunders' : undefined}
            />
          ))}
          <p style={{ margin: '16px 0 0', color: '#989795', fontSize: '0.82em', lineHeight: 1.5 }}>
            Study the typical middlegame plans and tactical motifs in your most problematic openings.
          </p>
        </Section>
      )}

      {/* Worst blunder + View button */}
      <Section title="Your Worst Blunder">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#3d2522', color: '#fa412d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82em', fontWeight: 600 }}>
                -{worstDrop.toFixed(1)} pawns
              </span>
              <span style={{ backgroundColor: '#3d3a37', color: '#bababa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82em', textTransform: 'capitalize' }}>
                Move {worstBlunder.moveNumber} · {worstBlunder.gamePhase}
              </span>
              {worstBlunder.opening && (
                <span style={{ backgroundColor: '#3d3a37', color: '#bababa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82em' }}>
                  {worstBlunder.opening}
                </span>
              )}
            </div>
            <div style={{ color: '#bababa', fontSize: '0.9em', lineHeight: 1.6 }}>
              You played <strong style={{ color: '#fa412d' }}>{worstBlunder.movePlayed}</strong>{' '}
              when <strong style={{ color: '#81b64c' }}>{worstBlunder.bestMove.slice(0, 4)}</strong> was better —{' '}
              vs <strong style={{ color: '#fff' }}>{worstBlunder.opponent}</strong>{' '}
              ({worstBlunder.gameResult === 'loss' ? 'you lost' : worstBlunder.gameResult === 'win' ? 'you won anyway' : 'draw'})
            </div>
          </div>
          <button onClick={onViewWorstBlunder} style={{ backgroundColor: 'rgba(129,182,76,0.15)', color: '#81b64c', border: '1px solid rgba(129,182,76,0.3)', borderRadius: '8px', padding: '10px 20px', fontSize: '0.9em', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            View on Board →
          </button>
        </div>
      </Section>

      {/* Priority tip */}
      <div style={{ background: 'linear-gradient(135deg, rgba(129,182,76,0.12) 0%, rgba(129,182,76,0.04) 100%)', padding: '20px 24px', borderRadius: '12px', border: '1px solid rgba(129,182,76,0.25)' }}>
        <div style={{ color: '#81b64c', fontWeight: 600, fontSize: '0.85em', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>✓ Your #1 Priority</div>
        <p style={{ margin: 0, color: '#fff', fontSize: '1.05em', lineHeight: 1.6 }}>
          {critical >= 2
            ? `You have ${critical} critical blunders (5+ pawns). These are game-ending — review them on the Analyze page first.`
            : worstPhase[1] / total >= 0.6
            ? `${Math.round((worstPhase[1] / total) * 100)}% of your blunders happen in the ${phaseLabel[worstPhase[0]].toLowerCase()}. Focus your study there first.`
            : missedCaptures >= 3
            ? `You missed ${missedCaptures} free captures. Train yourself to scan for takes before every single move.`
            : byResult.loss > blunders.length * 0.6
            ? `Most of your blunders happen in games you lose. Slowing down on critical moments could flip results.`
            : `Your biggest trouble piece is the ${(pieceNames[worstPiece[0]] || 'pawn').toLowerCase()} with ${worstPiece[1]} blunders. Pause and double-check before moving it.`}
        </p>
      </div>

    </div>
  );
}
