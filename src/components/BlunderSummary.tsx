import { useState } from 'react';
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
  description: string;
  advice: string;
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
    const pieceName = pieceNames[mostBlunderedPiece[0]] || 'piece';
    patterns.push({
      type: 'piece',
      icon: pieceIcons[mostBlunderedPiece[0]] || '?',
      label: 'Trouble Piece',
      value: `${pieceName} (${mostBlunderedPiece[1]}x)`,
      color: '#e6a23c',
      description: `Your ${pieceName.toLowerCase()} moves caused ${mostBlunderedPiece[1]} blunders. This piece may be getting you into trouble more than others.`,
      advice: `Before moving your ${pieceName.toLowerCase()}, pause and ask: "Is this piece safe on its new square? What can my opponent do in response?"`,
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
    const phaseDescriptions: Record<string, string> = {
      opening: 'The opening is the first 10-15 moves where you develop pieces and fight for the center.',
      middlegame: 'The middlegame is where most tactics happen. Pieces are active and kings may still be vulnerable.',
      endgame: 'The endgame occurs when most pieces are traded. King activity and pawn structure become critical.',
    };
    const phaseAdvice: Record<string, string> = {
      opening: 'Focus on: developing pieces quickly, controlling the center, castling early, and avoiding moving the same piece twice.',
      middlegame: 'Before each move, check for tactics: forks, pins, skewers, and discovered attacks. Look at all your opponent\'s threats.',
      endgame: 'Activate your king, push passed pawns, and calculate precisely. Every tempo matters in endgames.',
    };
    patterns.push({
      type: 'phase',
      icon: worstPhase[0] === 'opening' ? '1' : worstPhase[0] === 'middlegame' ? '2' : '3',
      label: 'Weak Phase',
      value: `${phaseLabels[worstPhase[0]]} (${worstPhase[1]}x)`,
      color: '#fa412d',
      description: `${worstPhase[1]} of your blunders happened in the ${worstPhase[0]}. ${phaseDescriptions[worstPhase[0]]}`,
      advice: phaseAdvice[worstPhase[0]],
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
      description: `You missed ${missedCaptures} winning captures. These were moves where taking a piece was the best option, but you played something else.`,
      advice: 'Before every move, scan the board for captures. Ask: "Can I take anything? Is anything undefended?" Make this a habit.',
    });
  }

  // Average eval drop
  const avgDrop = blunders.reduce((sum, b) => sum + b.evalDrop, 0) / blunders.length / 100;
  const severityText = avgDrop >= 5 ? 'severe' : avgDrop >= 3 ? 'significant' : 'moderate';
  patterns.push({
    type: 'avg',
    icon: '-',
    label: 'Avg. Drop',
    value: `${avgDrop.toFixed(1)} pawns`,
    color: '#81b64c',
    description: `On average, each blunder cost you ${avgDrop.toFixed(1)} pawns of evaluation. This is a ${severityText} swing per mistake.`,
    advice: avgDrop >= 4
      ? 'Your blunders are costly. Take more time on critical moves and double-check for hanging pieces before clicking.'
      : 'Your mistakes are recoverable. Focus on consistency and reducing the frequency of errors.',
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
      description: `${costlyBlunders} of your blunders occurred in games you lost. These mistakes likely contributed directly to those defeats.`,
      advice: costPercent >= 50
        ? 'Most of your blunders are game-deciding. Consider playing longer time controls to give yourself more thinking time.'
        : 'Some blunders are costing you games. Review these positions carefully to avoid repeating the same mistakes.',
    });
  }

  return patterns;
}

interface TakeawaySummary {
  main: string;
  details: string[];
}

function generateSummary(blunders: Blunder[]): TakeawaySummary {
  if (blunders.length === 0) return { main: '', details: [] };

  const phaseCount: Record<string, number> = { opening: 0, middlegame: 0, endgame: 0 };
  const pieceCount: Record<string, number> = {};
  let missedCaptures = 0;
  let totalEvalDrop = 0;
  let gamesLost = 0;

  blunders.forEach(b => {
    phaseCount[b.gamePhase]++;
    pieceCount[b.pieceMoved] = (pieceCount[b.pieceMoved] || 0) + 1;
    if (b.bestMoveWasCapture && !b.wasCapture) missedCaptures++;
    totalEvalDrop += b.evalDrop;
    if (b.gameResult === 'loss') gamesLost++;
  });

  const worstPhase = Object.entries(phaseCount).sort((a, b) => b[1] - a[1])[0];
  const worstPiece = Object.entries(pieceCount).sort((a, b) => b[1] - a[1])[0];
  const avgDrop = (totalEvalDrop / blunders.length / 100).toFixed(1);

  const pieceNames: Record<string, string> = {
    'K': 'king', 'Q': 'queen', 'R': 'rook', 'B': 'bishop', 'N': 'knight', 'P': 'pawn'
  };

  const details: string[] = [];
  let main = '';

  // Build personalized main message
  const phasePercent = Math.round((worstPhase[1] / blunders.length) * 100);
  const piecePercent = Math.round((worstPiece[1] / blunders.length) * 100);

  if (phasePercent >= 60) {
    main = `${phasePercent}% of your blunders happen in the ${worstPhase[0]}. This is your biggest area to improve.`;
  } else if (piecePercent >= 50) {
    main = `Your ${pieceNames[worstPiece[0]]} is involved in ${piecePercent}% of blunders. Slow down when moving this piece.`;
  } else if (missedCaptures >= blunders.length * 0.4) {
    main = `You missed ${missedCaptures} winning captures. Train yourself to scan for takes before every move.`;
  } else if (gamesLost > blunders.length / 2) {
    main = `${gamesLost} of these ${blunders.length} blunders led to losses. Focus on critical moments.`;
  } else {
    main = `Across ${blunders.length} blunders, you lost an average of ${avgDrop} pawns per mistake.`;
  }

  // Build specific action items
  if (worstPhase[1] >= 2) {
    const phaseActions: Record<string, string> = {
      opening: 'Study opening principles: develop pieces, control center, castle early',
      middlegame: 'Before moving, ask: "What is my opponent threatening?"',
      endgame: 'Practice king and pawn endgames - activity is everything',
    };
    details.push(phaseActions[worstPhase[0]]);
  }

  if (worstPiece[1] >= 2 && piecePercent >= 30) {
    details.push(`Review ${pieceNames[worstPiece[0]]} tactics - ${worstPiece[1]} blunders with this piece`);
  }

  if (missedCaptures >= 2) {
    details.push(`Practice capture awareness - you missed ${missedCaptures} free pieces`);
  }

  return { main, details };
}

export function BlunderSummary({ blunders }: BlunderSummaryProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  if (blunders.length === 0) return null;

  const patterns = detectPatterns(blunders);
  const summary = generateSummary(blunders);

  const handleCardClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

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
        <span style={{
          fontSize: '0.6em',
          color: '#989795',
          fontWeight: 400,
          marginLeft: 'auto',
        }}>
          Tap cards for details
        </span>
      </h3>

      {/* Pattern Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'start',
      }}>
        {patterns.map((pattern, i) => {
          const isExpanded = expandedCard === i;
          const isHovered = hoveredCard === i;
          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: isExpanded ? '#312e2b' : isHovered ? '#2d2a27' : '#272522',
                borderRadius: '10px',
                padding: '16px',
                border: `1px solid ${isExpanded ? pattern.color : isHovered ? '#4d4a47' : '#3d3a37'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isExpanded ? 'scale(1.02)' : isHovered ? 'translateY(-2px)' : 'scale(1)',
                boxShadow: isHovered && !isExpanded ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
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
                <span style={{
                  marginLeft: 'auto',
                  color: '#989795',
                  fontSize: '0.7em',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}>
                  ▼
                </span>
              </div>
              <span style={{
                color: '#e0e0e0',
                fontSize: '0.95em',
                fontWeight: 500,
              }}>
                {pattern.value}
              </span>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  marginTop: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid #3d3a37',
                }}>
                  <p style={{
                    margin: '0 0 10px 0',
                    color: '#bababa',
                    fontSize: '0.85em',
                    lineHeight: 1.5,
                  }}>
                    {pattern.description}
                  </p>
                  <div style={{
                    backgroundColor: `${pattern.color}15`,
                    borderRadius: '6px',
                    padding: '10px 12px',
                    borderLeft: `3px solid ${pattern.color}`,
                  }}>
                    <span style={{
                      color: pattern.color,
                      fontSize: '0.7em',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Tip
                    </span>
                    <p style={{
                      margin: '4px 0 0 0',
                      color: '#e0e0e0',
                      fontSize: '0.8em',
                      lineHeight: 1.5,
                    }}>
                      {pattern.advice}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Takeaway */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(129, 182, 76, 0.12) 0%, rgba(129, 182, 76, 0.04) 100%)',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid rgba(129, 182, 76, 0.25)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
        }}>
          <span style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#81b64c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8em',
            color: '#1a1a1a',
            fontWeight: 700,
          }}>
            ✓
          </span>
          <span style={{
            color: '#81b64c',
            fontSize: '0.85em',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Your Priority
          </span>
        </div>

        <p style={{
          margin: '0 0 16px 0',
          color: '#ffffff',
          lineHeight: 1.6,
          fontSize: '1.05em',
          fontWeight: 500,
        }}>
          {summary.main}
        </p>

        {summary.details.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {summary.details.map((detail, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                }}
              >
                <span style={{
                  color: '#81b64c',
                  fontSize: '0.85em',
                  fontWeight: 600,
                  minWidth: '20px',
                }}>
                  {i + 1}.
                </span>
                <span style={{
                  color: '#bababa',
                  fontSize: '0.9em',
                  lineHeight: 1.5,
                }}>
                  {detail}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
