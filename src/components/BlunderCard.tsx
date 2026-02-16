import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Blunder } from '../types';

interface BlunderCardProps {
  blunder: Blunder;
  compact?: boolean;
}

function formatMove(san: string): string {
  if (san === 'O-O' || san === '0-0') return 'Castle kingside';
  if (san === 'O-O-O' || san === '0-0-0') return 'Castle queenside';

  const pieces: Record<string, string> = {
    'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight',
  };

  let move = san.replace(/[+#]$/, '');

  const promoMatch = move.match(/=([QRBN])$/);
  let promotion = '';
  if (promoMatch) {
    promotion = ` (promotes to ${pieces[promoMatch[1]]})`;
    move = move.replace(/=[QRBN]$/, '');
  }

  const isCapture = move.includes('x');
  move = move.replace('x', '');

  const pieceChar = move.match(/^[KQRBN]/)?.[0];
  const destination = move.match(/[a-h][1-8]/)?.[0] || move;

  const piece = pieceChar ? pieces[pieceChar] : 'Pawn';
  const action = isCapture ? 'takes' : 'to';

  return `${piece} ${action} ${destination}${promotion}`;
}

function formatUciMove(uci: string): string {
  if (uci.length < 4) return uci;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  return `${from} to ${to}`;
}

export function BlunderCard({ blunder, compact = false }: BlunderCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showBadMove, setShowBadMove] = useState(true);

  const getPieceName = (piece: string): string => {
    const names: Record<string, string> = {
      'K': 'king', 'Q': 'queen', 'R': 'rook', 'B': 'bishop', 'N': 'knight', 'P': 'pawn'
    };
    return names[piece] || 'piece';
  };

  const getOutcomeMessage = (): string => {
    const beforePawns = blunder.evalBefore / 100;
    const afterPawns = blunder.evalAfter / 100;
    const evalSwing = Math.abs(blunder.evalDrop / 100);
    const wasWinning = beforePawns > 1.5;
    const wasEqual = beforePawns >= -1.5 && beforePawns <= 1.5;
    const pieceName = getPieceName(blunder.pieceMoved);

    let whatHappened = '';
    if (Math.abs(afterPawns) > 50) {
      whatHappened = `Moving your ${pieceName} allowed checkmate.`;
    } else if (blunder.bestMoveWasCapture && !blunder.wasCapture) {
      whatHappened = `You missed a winning capture.`;
    } else if (blunder.wasCapture && evalSwing > 3) {
      whatHappened = `That ${pieceName} capture lost material.`;
    } else if (evalSwing > 3) {
      whatHappened = `Your ${pieceName} move cost ~${evalSwing.toFixed(0)} pawns.`;
    } else if (evalSwing > 1.5) {
      whatHappened = `That ${pieceName} move gave up a strong position.`;
    } else {
      whatHappened = `Your ${pieceName} move weakened your position.`;
    }

    let outcome = '';
    if (blunder.gameResult === 'loss') {
      if (wasWinning) {
        outcome = `You were winning, but ${blunder.opponent} came back.`;
      } else if (wasEqual) {
        outcome = `This gave ${blunder.opponent} a winning advantage.`;
      } else {
        outcome = `${blunder.opponent} converted this into a win.`;
      }
    } else if (blunder.gameResult === 'win') {
      outcome = `${blunder.opponent} didn't punish this.`;
    } else {
      if (wasWinning) {
        outcome = `This let ${blunder.opponent} escape with a draw.`;
      } else {
        outcome = `Game ended in a draw.`;
      }
    }

    return `${whatHappened} ${outcome}`;
  };

  const outcomeMessage = getOutcomeMessage();
  const movePlayedDisplay = formatMove(blunder.movePlayed);
  const bestMoveDisplay = formatUciMove(blunder.bestMove);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBadMove((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const squareStyles: Record<string, React.CSSProperties> = showBadMove
    ? {
        [blunder.moveFrom]: { backgroundColor: 'rgba(129, 182, 76, 0.6)' },
        [blunder.moveTo]: { backgroundColor: 'rgba(250, 65, 45, 0.6)' },
      }
    : {
        [blunder.bestMoveFrom]: { backgroundColor: 'rgba(129, 182, 76, 0.6)' },
        [blunder.bestMoveTo]: { backgroundColor: 'rgba(129, 182, 76, 0.6)' },
      };

  const arrows = showBadMove
    ? [{ startSquare: blunder.moveFrom, endSquare: blunder.moveTo, color: 'rgba(250, 65, 45, 0.8)' }]
    : [{ startSquare: blunder.bestMoveFrom, endSquare: blunder.bestMoveTo, color: 'rgba(129, 182, 76, 0.8)' }];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #3d3a37',
        borderRadius: '8px',
        padding: compact ? '14px' : '18px',
        backgroundColor: '#272522',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#fa412d', fontWeight: 600 }}>
            Move {blunder.moveNumber}
          </span>
          <span style={{
            padding: '3px 8px',
            backgroundColor: '#3d3a37',
            borderRadius: '4px',
            fontSize: '0.75em',
            color: '#989795',
            textTransform: 'capitalize',
          }}>
            {blunder.gamePhase}
          </span>
        </div>
        {!compact && (
          <span style={{ color: '#989795', fontSize: '0.85em' }}>
            vs {blunder.opponent}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Chessboard */}
        <div style={{
          width: compact ? '220px' : '260px',
          height: compact ? '220px' : '260px',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}>
          <Chessboard
            options={{
              position: blunder.fen,
              boardOrientation: blunder.playerColor,
              allowDragging: false,
              squareStyles: squareStyles,
              arrows: arrows,
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: showBadMove ? '#fa412d' : '#81b64c',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7em',
            fontWeight: 600,
          }}>
            {showBadMove ? `You: ${blunder.movePlayed}` : `Best: ${blunder.bestMove}`}
          </div>
        </div>

        {/* Move details */}
        <div style={{
          flex: 1,
          minWidth: '160px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{
            backgroundColor: '#1e1c1a',
            padding: '10px 12px',
            borderRadius: '6px',
            borderLeft: '3px solid #fa412d',
            opacity: showBadMove ? 1 : 0.5,
            transition: 'opacity 0.3s ease',
          }}>
            <span style={{ color: '#989795', fontSize: '0.75em' }}>You played</span>
            <div style={{ color: '#fa412d', fontWeight: 600, marginTop: '2px', fontSize: '0.9em' }}>
              {movePlayedDisplay}
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e1c1a',
            padding: '10px 12px',
            borderRadius: '6px',
            borderLeft: '3px solid #81b64c',
            opacity: showBadMove ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}>
            <span style={{ color: '#989795', fontSize: '0.75em' }}>Best move</span>
            <div style={{ color: '#81b64c', fontWeight: 600, marginTop: '2px', fontSize: '0.9em' }}>
              {bestMoveDisplay}
            </div>
          </div>

          <div style={{
            color: '#bababa',
            backgroundColor: '#1e1c1a',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '0.8em',
            lineHeight: 1.5,
            flex: 1,
          }}>
            {outcomeMessage}
          </div>

          {!compact && (
            <a
              href={blunder.gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#81b64c',
                fontSize: '0.8em',
                textDecoration: 'none',
              }}
            >
              View full game →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
