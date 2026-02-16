import type { Blunder } from '../types';

interface BlunderSummaryProps {
  readonly blunders: Blunder[];
}

interface Pattern {
  type: string;
  icon: string;
  label: string;
  value: string;
  color: string;
}

function detectPatterns(blunders: Blunder[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Count by piece type
  const pieceCount: Record<string, number> = {};
  blunders.forEach(b => {
    pieceCount[b.pieceMoved] = (pieceCount[b.pieceMoved] || 0) + 1;
  });

  const mostBlunderedPiece = Object.entries(pieceCount)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostBlunderedPiece && mostBlunderedPiece[1] >= 2) {
    const pieceIcons: Record<string, string> = {
      'K': 'K', 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N', 'P': 'P'
    };
    const pieceNames: Record<string, string> = {
      'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight', 'P': 'Pawn'
    };
    patterns.push({
      type: 'piece',
      icon: pieceIcons[mostBlunderedPiece[0]] || '?',
      label: 'Trouble Piece',
      value: `${pieceNames[mostBlunderedPiece[0]]} (${mostBlunderedPiece[1]}x)`,
      color: '#e6a23c',
    });
  }

  // Count by game phase
  const phaseCount: Record<string, number> = { opening: 0, middlegame: 0, endgame: 0 };
  blunders.forEach(b => {
    phaseCount[b.gamePhase]++;
  });

  const worstPhase = Object.entries(phaseCount)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0];

  if (worstPhase && worstPhase[1] >= 2) {
    const phaseLabels: Record<string, string> = {
      opening: 'Opening',
      middlegame: 'Middlegame',
      endgame: 'Endgame'
    };
    patterns.push({
      type: 'phase',
      icon: worstPhase[0] === 'opening' ? '1' : worstPhase[0] === 'middlegame' ? '2' : '3',
      label: 'Weak Phase',
      value: `${phaseLabels[worstPhase[0]]} (${worstPhase[1]}x)`,
      color: '#fa412d',
    });
  }

  // Count missed captures
  const missedCaptures = blunders.filter(b => b.bestMoveWasCapture && !b.wasCapture).length;
  if (missedCaptures >= 2) {
    patterns.push({
      type: 'capture',
      icon: 'x',
      label: 'Missed Captures',
      value: `${missedCaptures} opportunities`,
      color: '#ff6b6b',
    });
  }

  // Average eval drop
  const avgDrop = blunders.reduce((sum, b) => sum + b.evalDrop, 0) / blunders.length / 100;
  patterns.push({
    type: 'avg',
    icon: '-',
    label: 'Avg. Drop',
    value: `${avgDrop.toFixed(1)} pawns`,
    color: '#81b64c',
  });

  // Count blunders that led to losses
  const costlyBlunders = blunders.filter(b => b.gameResult === 'loss').length;
  if (costlyBlunders >= 1) {
    const costPercent = Math.round((costlyBlunders / blunders.length) * 100);
    patterns.push({
      type: 'costly',
      icon: '!',
      label: 'Cost Games',
      value: `${costlyBlunders} losses (${costPercent}%)`,
      color: '#fa412d',
    });
  }

  return patterns;
}

function generateSummary(blunders: Blunder[]): string {
  if (blunders.length === 0) return '';

  const parts: string[] = [];

  const phaseCount: Record<string, number> = { opening: 0, middlegame: 0, endgame: 0 };
  const pieceCount: Record<string, number> = {};
  let missedCaptures = 0;

  blunders.forEach(b => {
    phaseCount[b.gamePhase]++;
    pieceCount[b.pieceMoved] = (pieceCount[b.pieceMoved] || 0) + 1;
    if (b.bestMoveWasCapture && !b.wasCapture) missedCaptures++;
  });

  const worstPhase = Object.entries(phaseCount).sort((a, b) => b[1] - a[1])[0];
  const worstPiece = Object.entries(pieceCount).sort((a, b) => b[1] - a[1])[0];

  const pieceNames: Record<string, string> = {
    'K': 'king', 'Q': 'queen', 'R': 'rook', 'B': 'bishop', 'N': 'knight', 'P': 'pawn'
  };

  if (worstPhase[1] >= Math.ceil(blunders.length * 0.6)) {
    parts.push(`Focus on your ${worstPhase[0]} play.`);
  }

  if (worstPiece[1] >= Math.ceil(blunders.length * 0.4)) {
    parts.push(`Be extra careful with ${pieceNames[worstPiece[0]]} moves.`);
  }

  if (missedCaptures >= Math.ceil(blunders.length * 0.4)) {
    parts.push(`Scan for captures before each move.`);
  }

  if (parts.length === 0) {
    const losses = blunders.filter(b => b.gameResult === 'loss').length;
    if (losses > blunders.length / 2) {
      parts.push(`Slow down - these blunders are costing games.`);
    } else {
      parts.push(`Check for threats before each move.`);
    }
  }

  return parts.join(' ');
}

export function BlunderSummary({ blunders }: BlunderSummaryProps) {
  if (blunders.length === 0) return null;

  const patterns = detectPatterns(blunders);
  const summary = generateSummary(blunders);

  return (
    <div className="fade-in" style={{
      backgroundColor: '#1e1c1a',
      border: '1px solid #3d3a37',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px',
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        color: '#ffffff',
        fontSize: '1.2em',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          width: '28px',
          height: '28px',
          backgroundColor: '#81b64c',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8em',
          color: '#1a1a1a',
          fontWeight: 700,
        }}>
          i
        </span>
        Pattern Analysis
      </h3>

      {/* Pattern Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {patterns.map((pattern, i) => (
          <div
            key={i}
            style={{
              backgroundColor: '#272522',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #3d3a37',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                backgroundColor: `${pattern.color}20`,
                color: pattern.color,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75em',
                fontWeight: 700,
              }}>
                {pattern.icon}
              </span>
              <span style={{
                color: '#989795',
                fontSize: '0.75em',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {pattern.label}
              </span>
            </div>
            <span style={{
              color: '#e0e0e0',
              fontSize: '0.95em',
              fontWeight: 500,
            }}>
              {pattern.value}
            </span>
          </div>
        ))}
      </div>

      {/* Takeaway */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(129, 182, 76, 0.1) 0%, rgba(129, 182, 76, 0.05) 100%)',
        padding: '16px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(129, 182, 76, 0.2)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <span style={{
            color: '#81b64c',
            fontSize: '1.2em',
            lineHeight: 1,
          }}>
            *
          </span>
          <p style={{
            margin: 0,
            color: '#e0e0e0',
            lineHeight: 1.6,
            fontSize: '0.95em',
          }}>
            <strong style={{ color: '#81b64c' }}>Takeaway:</strong> {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
