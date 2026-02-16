import type { Blunder } from '../types';

interface BlunderSummaryProps {
  readonly blunders: Blunder[];
}

interface Pattern {
  type: string;
  count: number;
  description: string;
}

function detectPatterns(blunders: Blunder[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Count by piece type
  const pieceCount: Record<string, number> = {};
  blunders.forEach(b => {
    pieceCount[b.pieceMoved] = (pieceCount[b.pieceMoved] || 0) + 1;
  });

  // Find most blundered piece
  const mostBlunderedPiece = Object.entries(pieceCount)
    .sort((a, b) => b[1] - a[1])[0];

  if (mostBlunderedPiece && mostBlunderedPiece[1] >= 2) {
    const pieceNames: Record<string, string> = {
      'K': 'king', 'Q': 'queen', 'R': 'rook', 'B': 'bishop', 'N': 'knight', 'P': 'pawn'
    };
    patterns.push({
      type: 'piece',
      count: mostBlunderedPiece[1],
      description: `${mostBlunderedPiece[1]} of your blunders involved your ${pieceNames[mostBlunderedPiece[0]] || 'pieces'}`,
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
    patterns.push({
      type: 'phase',
      count: worstPhase[1],
      description: `${worstPhase[1]} blunders happened in the ${worstPhase[0]}`,
    });
  }

  // Count missed captures
  const missedCaptures = blunders.filter(b => b.bestMoveWasCapture && !b.wasCapture).length;
  if (missedCaptures >= 2) {
    patterns.push({
      type: 'capture',
      count: missedCaptures,
      description: `${missedCaptures} times you missed a winning capture`,
    });
  }

  // Count by time control
  const timeCount: Record<string, number> = {};
  blunders.forEach(b => {
    timeCount[b.timeClass] = (timeCount[b.timeClass] || 0) + 1;
  });

  const worstTimeControl = Object.entries(timeCount)
    .sort((a, b) => b[1] - a[1])[0];

  if (worstTimeControl && worstTimeControl[1] >= 2 && Object.keys(timeCount).length > 1) {
    patterns.push({
      type: 'time',
      count: worstTimeControl[1],
      description: `${worstTimeControl[1]} blunders came from ${worstTimeControl[0]} games`,
    });
  }

  // Count blunders that led to losses
  const costlyBlunders = blunders.filter(b => b.gameResult === 'loss').length;
  if (costlyBlunders >= 2) {
    patterns.push({
      type: 'costly',
      count: costlyBlunders,
      description: `${costlyBlunders} of these blunders led to losses`,
    });
  }

  return patterns;
}

function generateSummary(blunders: Blunder[]): string {
  if (blunders.length === 0) return '';

  // Build a natural summary
  const parts: string[] = [];

  // Find the dominant pattern
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

  // Main insight
  if (worstPhase[1] >= Math.ceil(blunders.length * 0.6)) {
    parts.push(`Most of your mistakes happen in the ${worstPhase[0]}.`);
  }

  if (worstPiece[1] >= Math.ceil(blunders.length * 0.4)) {
    parts.push(`Watch your ${pieceNames[worstPiece[0]] || 'pieces'} moves more carefully.`);
  }

  if (missedCaptures >= Math.ceil(blunders.length * 0.4)) {
    parts.push(`You're missing winning captures - slow down and look for threats.`);
  }

  // Check time control pattern
  const timeCount: Record<string, number> = {};
  blunders.forEach(b => {
    timeCount[b.timeClass] = (timeCount[b.timeClass] || 0) + 1;
  });
  const worstTime = Object.entries(timeCount).sort((a, b) => b[1] - a[1])[0];
  if (worstTime[1] >= Math.ceil(blunders.length * 0.6) && Object.keys(timeCount).length > 1) {
    parts.push(`Consider playing slower time controls to reduce blunders.`);
  }

  // Fallback
  if (parts.length === 0) {
    const losses = blunders.filter(b => b.gameResult === 'loss').length;
    if (losses > blunders.length / 2) {
      parts.push(`These blunders are costing you games. Take an extra moment before making your move.`);
    } else {
      parts.push(`Keep practicing! Focus on checking for threats before each move.`);
    }
  }

  return parts.join(' ');
}

export function BlunderSummary({ blunders }: BlunderSummaryProps) {
  if (blunders.length === 0) return null;

  const patterns = detectPatterns(blunders);
  const summary = generateSummary(blunders);

  return (
    <div style={{
      backgroundColor: '#1e1c1a',
      border: '1px solid #3d3a37',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '24px',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        color: '#81b64c',
        fontSize: '1.1em',
        fontWeight: 600,
      }}>
        Pattern Analysis
      </h3>

      {patterns.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '16px',
        }}>
          {patterns.map((pattern, i) => (
            <span
              key={i}
              style={{
                backgroundColor: '#272522',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.9em',
                color: '#bababa',
                border: '1px solid #3d3a37',
              }}
            >
              {pattern.description}
            </span>
          ))}
        </div>
      )}

      <div style={{
        backgroundColor: '#272522',
        padding: '14px 16px',
        borderRadius: '6px',
        borderLeft: '3px solid #81b64c',
      }}>
        <p style={{
          margin: 0,
          color: '#e0e0e0',
          lineHeight: 1.5,
          fontSize: '1em',
        }}>
          <strong style={{ color: '#81b64c' }}>Takeaway:</strong> {summary}
        </p>
      </div>
    </div>
  );
}
