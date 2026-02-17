import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Blunder } from '../types';

interface BlunderCardProps {
  blunder: Blunder;
  compact?: boolean;
}

// Get piece on a square from FEN
function getPieceOnSquare(fen: string, square: string): string | null {
  const pieceNames: Record<string, string> = {
    'k': 'King', 'q': 'Queen', 'r': 'Rook', 'b': 'Bishop', 'n': 'Knight', 'p': 'Pawn',
    'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight', 'P': 'Pawn',
  };

  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7

  const boardPart = fen.split(' ')[0];
  const rows = boardPart.split('/').reverse(); // reverse so rank 1 is index 0

  if (rank < 0 || rank > 7 || file < 0 || file > 7) return null;

  const row = rows[rank];
  let currentFile = 0;

  for (const char of row) {
    if (/\d/.test(char)) {
      currentFile += parseInt(char);
    } else {
      if (currentFile === file) {
        return pieceNames[char] || null;
      }
      currentFile++;
    }
  }
  return null;
}

function formatMoveWithSquares(san: string, fromSquare: string, toSquare: string, fen: string): string {
  if (san === 'O-O' || san === '0-0') return 'Castled kingside';
  if (san === 'O-O-O' || san === '0-0-0') return 'Castled queenside';

  const pieces: Record<string, string> = {
    'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight',
  };

  let move = san.replace(/[+#]$/, '');

  const promoMatch = move.match(/=([QRBN])$/);
  let promotion = '';
  if (promoMatch) {
    promotion = `, promoted to ${pieces[promoMatch[1]]}`;
    move = move.replace(/=[QRBN]$/, '');
  }

  const isCapture = move.includes('x');
  const pieceChar = move.match(/^[KQRBN]/)?.[0];
  const piece = pieceChar ? pieces[pieceChar] : 'Pawn';

  if (isCapture) {
    const capturedPiece = getPieceOnSquare(fen, toSquare);
    if (capturedPiece) {
      return `${piece} from ${fromSquare} captures ${capturedPiece} on ${toSquare}${promotion}`;
    }
    return `${piece} from ${fromSquare} captures on ${toSquare}${promotion}`;
  }
  return `${piece} from ${fromSquare} to ${toSquare}${promotion}`;
}

function formatUciMove(uci: string): string {
  if (uci.length < 4) return uci;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  return `${from} → ${to}`;
}

// Get severity level based on eval drop
function getSeverity(evalDrop: number): { label: string; color: string; bgColor: string } {
  const pawns = evalDrop / 100;
  if (pawns >= 6) {
    return { label: 'Blunder', color: '#ff4444', bgColor: 'rgba(255, 68, 68, 0.15)' };
  } else if (pawns >= 4) {
    return { label: 'Blunder', color: '#fa412d', bgColor: 'rgba(250, 65, 45, 0.15)' };
  } else {
    return { label: 'Mistake', color: '#e6a23c', bgColor: 'rgba(230, 162, 60, 0.15)' };
  }
}

export function BlunderCard({ blunder, compact = false }: BlunderCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showBadMove, setShowBadMove] = useState(true);

  const severity = getSeverity(blunder.evalDrop);

  const getPieceName = (piece: string): string => {
    const names: Record<string, string> = {
      'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight', 'P': 'Pawn'
    };
    return names[piece] || 'piece';
  };

  const pieceName = getPieceName(blunder.pieceMoved);

  // Position-specific insight
  const getOutcomeMessage = (): string => {
    const afterPawns = blunder.evalAfter / 100;
    const evalSwing = Math.abs(blunder.evalDrop / 100);

    // Get pieces involved in the best move for more specific messages
    const bestMovePiece = getPieceOnSquare(blunder.fen, blunder.bestMoveFrom) || 'piece';
    const targetPiece = getPieceOnSquare(blunder.fen, blunder.bestMoveTo);

    if (Math.abs(afterPawns) > 50) {
      return `Moving your ${pieceName} from ${blunder.moveFrom} to ${blunder.moveTo} opened a checkmate for your opponent. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} instead would have blocked the threat and kept you in the game.`;
    }

    if (blunder.bestMoveWasCapture && !blunder.wasCapture && targetPiece) {
      return `There was a free ${targetPiece} on ${blunder.bestMoveTo} you could have captured with your ${bestMovePiece} from ${blunder.bestMoveFrom}. Instead, your ${pieceName} move to ${blunder.moveTo} let that opportunity slip, costing ${evalSwing.toFixed(1)} pawns.`;
    }

    if (blunder.wasCapture && evalSwing > 3) {
      const capturedPiece = getPieceOnSquare(blunder.fen, blunder.moveTo);
      const capturedDesc = capturedPiece ? `the ${capturedPiece}` : 'that piece';
      return `Your ${pieceName} captured ${capturedDesc} on ${blunder.moveTo}, but it was defended. Your opponent recaptures and wins material. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} was safer.`;
    }

    if (evalSwing > 5) {
      return `Moving your ${pieceName} to ${blunder.moveTo} left another piece undefended. Playing your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} would have kept your pieces protected, saving ${evalSwing.toFixed(1)} pawns.`;
    }

    if (evalSwing > 3) {
      return `Your ${pieceName} move to ${blunder.moveTo} allowed your opponent a strong tactical reply. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} avoids this and maintains your position.`;
    }

    if (blunder.gamePhase === 'opening') {
      return `Your ${pieceName} move to ${blunder.moveTo} on move ${blunder.moveNumber} wastes time in the opening. Your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} develops more efficiently or fights for the center.`;
    }

    if (blunder.gamePhase === 'endgame') {
      return `In this endgame, your ${pieceName} on ${blunder.moveTo} is passive. Your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} is more active and gives your pieces better control.`;
    }

    return `Your ${pieceName} move from ${blunder.moveFrom} to ${blunder.moveTo} gave away ${evalSwing.toFixed(1)} pawns. Your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} was the stronger continuation.`;
  };

  const outcomeMessage = getOutcomeMessage();
  const movePlayedDisplay = formatMoveWithSquares(blunder.movePlayed, blunder.moveFrom, blunder.moveTo, blunder.fen);
  const bestMoveDisplay = formatUciMove(blunder.bestMove);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBadMove((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const squareStyles: Record<string, React.CSSProperties> = showBadMove
    ? {
        [blunder.moveFrom]: { backgroundColor: 'rgba(247, 216, 96, 0.8)' },
        [blunder.moveTo]: { backgroundColor: 'rgba(247, 216, 96, 0.8)' },
      }
    : {
        [blunder.bestMoveFrom]: { backgroundColor: 'rgba(129, 182, 76, 0.85)' },
        [blunder.bestMoveTo]: { backgroundColor: 'rgba(129, 182, 76, 0.85)' },
      };

  const arrows = showBadMove
    ? [{ startSquare: blunder.moveFrom, endSquare: blunder.moveTo, color: '#d32f2f' }]
    : [{ startSquare: blunder.bestMoveFrom, endSquare: blunder.bestMoveTo, color: '#5b9a32' }];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fade-in"
      style={{
        border: '1px solid #3d3a37',
        borderRadius: '8px',
        padding: compact ? '14px' : '18px',
        backgroundColor: '#272522',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '14px',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px',
            backgroundColor: severity.bgColor,
            color: severity.color,
            borderRadius: '4px',
            fontSize: '0.8em',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}>
            {severity.label}
            <span style={{ opacity: 0.8, fontSize: '0.9em' }}>
              -{(blunder.evalDrop / 100).toFixed(1)}
            </span>
          </span>
          <span style={{ color: '#bababa', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Move {blunder.moveNumber}
          </span>
          <span style={{
            padding: '3px 8px',
            backgroundColor: '#3d3a37',
            borderRadius: '4px',
            fontSize: '0.7em',
            color: '#989795',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
          }}>
            {blunder.gamePhase}
          </span>
        </div>
        {!compact && (
          <span style={{
            color: '#989795',
            fontSize: '0.85em',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flexShrink: 1,
          }}>
            vs {blunder.opponent}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Chessboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
          <div style={{
            width: compact ? '220px' : '260px',
            height: compact ? '220px' : '260px',
            borderRadius: '6px',
            overflow: 'hidden',
          }}>
            <Chessboard
              options={{
                position: blunder.fen,
                boardOrientation: blunder.playerColor,
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
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.75em',
            fontWeight: 600,
            textAlign: 'center',
            border: `1px solid ${showBadMove ? 'rgba(250, 65, 45, 0.3)' : 'rgba(129, 182, 76, 0.3)'}`,
            transition: 'all 0.3s ease',
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
