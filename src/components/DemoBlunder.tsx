import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';

// Famous "Scholar's Mate" trap position - Black can block but plays wrong move
// Position: 1.e4 e5 2.Bc4 Nc6 3.Qf3 (threatening Qxf7#)
const SAMPLE_FEN = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 3 3';

// Bad move: pawn g7-g6 (allows Qxf7#)
const BLUNDER_FROM = 'g7';
const BLUNDER_TO = 'g6';

// Best move: Queen d8-e7 (blocks the attack)
const BEST_FROM = 'd8';
const BEST_TO = 'e7';

export function DemoBlunder() {
  const [showBadMove, setShowBadMove] = useState(true);

  // Toggle between showing the blunder and the best move every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowBadMove((prev) => !prev);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Dynamic square styles based on which move we're showing
  const squareStyles: Record<string, React.CSSProperties> = showBadMove
    ? {
        [BLUNDER_FROM]: {
          backgroundColor: 'rgba(247, 216, 96, 0.8)', // Yellow - starting square
        },
        [BLUNDER_TO]: {
          backgroundColor: 'rgba(247, 216, 96, 0.8)', // Yellow - destination
        },
      }
    : {
        [BEST_FROM]: {
          backgroundColor: 'rgba(129, 182, 76, 0.85)', // Green - starting square
        },
        [BEST_TO]: {
          backgroundColor: 'rgba(129, 182, 76, 0.85)', // Green - good destination
        },
      };

  // Dynamic arrow based on which move we're showing
  const arrows = showBadMove
    ? [{ startSquare: BLUNDER_FROM, endSquare: BLUNDER_TO, color: '#d32f2f' }]
    : [{ startSquare: BEST_FROM, endSquare: BEST_TO, color: '#5b9a32' }];

  return (
    <div
      style={{
        border: '1px solid #3d3a37',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        backgroundColor: '#272522',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{ margin: 0, color: '#81b64c' }}>
          How It Works
        </h3>
        <span style={{
          fontSize: '0.8em',
          color: '#989795',
          backgroundColor: '#3d3a37',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          Sample Analysis
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Chess Board with animated highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              width: '300px',
              height: '300px',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Chessboard
              options={{
                position: SAMPLE_FEN,
                boardOrientation: 'black',
                allowDragging: false,
                squareStyles: squareStyles,
                arrows: arrows,
                darkSquareStyle: { backgroundColor: '#779556' },
                lightSquareStyle: { backgroundColor: '#ebecd0' },
              }}
            />
          </div>

          {/* Move indicator badge - below board */}
          <div style={{
            backgroundColor: showBadMove ? 'rgba(250, 65, 45, 0.15)' : 'rgba(129, 182, 76, 0.15)',
            color: showBadMove ? '#fa412d' : '#81b64c',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.85em',
            fontWeight: 600,
            textAlign: 'center',
            border: `1px solid ${showBadMove ? 'rgba(250, 65, 45, 0.3)' : 'rgba(129, 182, 76, 0.3)'}`,
            transition: 'all 0.3s ease',
          }}>
            {showBadMove ? 'You played: g7-g6' : 'Best move: Qd8-e7'}
          </div>
        </div>

        {/* Explanation */}
        <div
          style={{
            flex: 1,
            minWidth: '250px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{
            backgroundColor: '#1e1c1a',
            padding: '16px',
            borderRadius: '6px',
            borderLeft: '3px solid #fa412d',
            opacity: showBadMove ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
          }}>
            <p style={{ margin: '0 0 8px 0', color: '#fa412d', fontWeight: 600 }}>
              The Blunder
            </p>
            <p style={{ margin: 0, color: '#bababa', fontSize: '0.95em', lineHeight: 1.5 }}>
              Black moves <strong style={{ color: '#fa412d' }}>Pawn to g6</strong>, but
              this completely ignores White's threat! The Queen and Bishop are both
              attacking f7. White takes <strong>Queen to f7 - checkmate</strong>.
            </p>
          </div>

          <div style={{
            backgroundColor: '#1e1c1a',
            padding: '16px',
            borderRadius: '6px',
            borderLeft: '3px solid #81b64c',
            opacity: showBadMove ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}>
            <p style={{ margin: '0 0 8px 0', color: '#81b64c', fontWeight: 600 }}>
              Better Move
            </p>
            <p style={{ margin: 0, color: '#bababa', fontSize: '0.95em', lineHeight: 1.5 }}>
              <strong style={{ color: '#81b64c' }}>Queen to e7</strong> blocks the diagonal
              and defends the f7 Pawn. The Queen can't be captured, and Black stays in the game.
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            color: '#989795',
            fontSize: '0.85em',
            flexWrap: 'wrap',
          }}>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: 'rgba(129, 182, 76, 0.6)',
              borderRadius: '2px',
            }} />
            <span>Good / From</span>
            <span style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: 'rgba(250, 65, 45, 0.6)',
              borderRadius: '2px',
              marginLeft: '8px',
            }} />
            <span>Blunder</span>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div style={{
        marginTop: '20px',
        padding: '12px 16px',
        backgroundColor: '#1e1c1a',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#989795',
        fontSize: '0.9em',
      }}>
        Enter your chess.com username above to find blunders like this in your games!
      </div>
    </div>
  );
}
