import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import type { Blunder } from "../../../types";

interface BlunderCardProps {
  blunder: Blunder;
  compact?: boolean;
}

// Get piece on a square from FEN
function getPieceOnSquare(fen: string, square: string): string | null {
  const pieceNames: Record<string, string> = {
    k: "King",
    q: "Queen",
    r: "Rook",
    b: "Bishop",
    n: "Knight",
    p: "Pawn",
    K: "King",
    Q: "Queen",
    R: "Rook",
    B: "Bishop",
    N: "Knight",
    P: "Pawn",
  };

  const file = square.charCodeAt(0) - "a".charCodeAt(0); // 0-7
  const rank = parseInt(square[1]) - 1; // 0-7

  const boardPart = fen.split(" ")[0];
  const rows = boardPart.split("/").reverse(); // reverse so rank 1 is index 0

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

function formatMoveWithSquares(
  san: string,
  fromSquare: string,
  toSquare: string,
  fen: string,
): string {
  if (san === "O-O" || san === "0-0") return "Castled kingside";
  if (san === "O-O-O" || san === "0-0-0") return "Castled queenside";

  const pieces: Record<string, string> = {
    K: "King",
    Q: "Queen",
    R: "Rook",
    B: "Bishop",
    N: "Knight",
  };

  let move = san.replace(/[+#]$/, "");

  const promoMatch = /=([QRBN])$/.exec(move);
  let promotion = "";
  if (promoMatch) {
    promotion = `, promoted to ${pieces[promoMatch[1]]}`;
    move = move.replace(/=[QRBN]$/, "");
  }

  const isCapture = move.includes("x");
  const pieceChar = /^[KQRBN]/.exec(move)?.[0];
  const piece = pieceChar ? pieces[pieceChar] : "Pawn";

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

// Converts centipawn loss to a human-readable material description
function evalToMaterial(centipawns: number): string {
  const pawns = Math.abs(centipawns) / 100;
  if (pawns >= 8) return "a Queen";
  if (pawns >= 4.5) return "a Rook";
  if (pawns >= 2.5) return "a piece";
  if (pawns >= 1.5) return "a pawn";
  return "an advantage";
}

function getSeverityTint(evalDrop: number): string {
  const pawns = evalDrop / 100;
  if (pawns >= 6) return "rgba(220, 38, 38, 0.07)";
  if (pawns >= 4) return "rgba(220, 38, 38, 0.05)";
  return "rgba(202, 138, 4, 0.05)";
}

// Get severity level based on eval drop
function getSeverity(evalDrop: number): {
  label: string;
  textClass: string;
  bgClass: string;
} {
  const pawns = evalDrop / 100;
  if (pawns >= 6) {
    return {
      label: "Blunder",
      textClass: "text-red-500",
      bgClass: "bg-red-100",
    };
  } else if (pawns >= 4) {
    return {
      label: "Blunder",
      textClass: "text-red-600",
      bgClass: "bg-red-100",
    };
  } else {
    return {
      label: "Mistake",
      textClass: "text-yellow-600",
      bgClass: "bg-yellow-100",
    };
  }
}

export function BlunderCard({ blunder, compact = false }: Readonly<BlunderCardProps>) {
  const [hovered, setHovered] = useState(false);
  const [showBadMove, setShowBadMove] = useState(true);

  const severity = getSeverity(blunder.evalDrop);

  const getPieceName = (piece: string): string => {
    const names: Record<string, string> = {
      K: "King",
      Q: "Queen",
      R: "Rook",
      B: "Bishop",
      N: "Knight",
      P: "Pawn",
    };
    return names[piece] || "piece";
  };

  const pieceName = getPieceName(blunder.pieceMoved);

  // Position-specific insight
  const getOutcomeMessage = (): string => {
    const afterPawns = blunder.evalAfter / 100;
    const evalSwing = Math.abs(blunder.evalDrop / 100);

    // Get pieces involved in the best move for more specific messages
    const bestMovePiece =
      getPieceOnSquare(blunder.fen, blunder.bestMoveFrom) || "piece";
    const targetPiece = getPieceOnSquare(blunder.fen, blunder.bestMoveTo);

    // Missed checkmate — pre-blunder eval was a mate score
    if (blunder.evalDrop > 5000) {
      return `You had a forced checkmate but missed it. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} would have delivered the winning sequence.`;
    }

    // Post-blunder position is a forced mate for opponent
    if (Math.abs(afterPawns) > 50) {
      return `Moving your ${pieceName} from ${blunder.moveFrom} to ${blunder.moveTo} opened a checkmate for your opponent. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} instead would have blocked the threat and kept you in the game.`;
    }

    if (blunder.bestMoveWasCapture && !blunder.wasCapture && targetPiece) {
      return `The best move was to capture the ${targetPiece} on ${blunder.bestMoveTo} with your ${bestMovePiece} from ${blunder.bestMoveFrom}. Instead, your ${pieceName} moved to ${blunder.moveTo}, missing that opportunity.`;
    }

    if (blunder.wasCapture && evalSwing > 3) {
      const capturedPiece = getPieceOnSquare(blunder.fen, blunder.moveTo);
      const capturedDesc = capturedPiece
        ? `the ${capturedPiece}`
        : "that piece";
      return `Your ${pieceName} captured ${capturedDesc} on ${blunder.moveTo}, but it was defended. Your opponent recaptures and wins material. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} was safer.`;
    }

    if (evalSwing > 5) {
      return `Moving your ${pieceName} to ${blunder.moveTo} left another piece undefended. Playing your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} would have kept your pieces protected, saving you ${evalToMaterial(blunder.evalDrop)}.`;
    }

    if (evalSwing > 3) {
      return `Your ${pieceName} move to ${blunder.moveTo} allowed your opponent a strong tactical reply. Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} avoids this and maintains your position.`;
    }

    if (blunder.gamePhase === "opening") {
      return `Your ${pieceName} move to ${blunder.moveTo} on move ${blunder.moveNumber} wastes time in the opening. Your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} develops more efficiently or fights for the center.`;
    }

    if (blunder.gamePhase === "endgame") {
      return `In this endgame, your ${pieceName} on ${blunder.moveTo} is passive. Your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} is more active and gives your pieces better control.`;
    }

    return `Your ${pieceName} move from ${blunder.moveFrom} to ${blunder.moveTo} gave away ${evalToMaterial(blunder.evalDrop)}. Your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} was the stronger continuation.`;
  };

  const outcomeMessage = getOutcomeMessage();
  const movePlayedDisplay = formatMoveWithSquares(
    blunder.movePlayed,
    blunder.moveFrom,
    blunder.moveTo,
    blunder.fen,
  );
  const bestMoveDisplay = formatUciMove(blunder.bestMove);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBadMove((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const squareStyles: Record<string, React.CSSProperties> = showBadMove
    ? {
        [blunder.moveFrom]: { backgroundColor: "rgba(247, 216, 96, 0.8)" },
        [blunder.moveTo]: { backgroundColor: "rgba(247, 216, 96, 0.8)" },
      }
    : {
        [blunder.bestMoveFrom]: { backgroundColor: "rgba(129, 182, 76, 0.85)" },
        [blunder.bestMoveTo]: { backgroundColor: "rgba(129, 182, 76, 0.85)" },
      };

  const arrows = showBadMove
    ? [
        {
          startSquare: blunder.moveFrom,
          endSquare: blunder.moveTo,
          color: "#d32f2f",
        },
      ]
    : [
        {
          startSquare: blunder.bestMoveFrom,
          endSquare: blunder.bestMoveTo,
          color: "#5b9a32",
        },
      ];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#272522",
        backgroundImage: `linear-gradient(135deg, ${getSeverityTint(blunder.evalDrop)} 0%, transparent 60%)`,
      }}
      className={`fade-in transition-all duration-200 border border-[#3d3a37] rounded-lg \
        ${hovered ? "shadow-[0_8px_24px_rgba(0,0,0,0.4)] -translate-y-0.5" : "shadow-[0_2px_8px_rgba(0,0,0,0.2)] translate-y-0"} \
        ${compact ? "p-4" : "p-4.5"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3.5 gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-1 rounded text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap ${severity.bgClass} ${severity.textClass}`}
          >
            {severity.label}
            <span className="opacity-80 text-sm">
              {blunder.evalDrop > 5000 ? "−M" : `−${(blunder.evalDrop / 100).toFixed(1)}`}
            </span>
          </span>
          <span className="text-[#bababa] font-medium whitespace-nowrap">
            Move {blunder.moveNumber}
          </span>
          <span className="px-2 py-0.5 bg-[#3d3a37] rounded text-xs text-[#989795] capitalize whitespace-nowrap">
            {blunder.gamePhase}
          </span>
        </div>
        {!compact && (
          <span className="text-[#989795] text-sm max-w-37.5 truncate">
            vs {blunder.opponent}
          </span>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        {/* Chessboard */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <div
            className={`${compact ? "w-55 h-55" : "w-65 h-65"} rounded-md overflow-hidden`}
          >
            <Chessboard
              options={{
                position: blunder.fen,
                boardOrientation: blunder.playerColor,
                allowDragging: false,
                squareStyles: squareStyles,
                arrows: arrows,
                darkSquareStyle: { backgroundColor: "#779556" },
                lightSquareStyle: { backgroundColor: "#ebecd0" },
              }}
            />
          </div>
          {/* Move indicator badge - below board */}
          <div
            className={`px-2 py-1 rounded text-[0.75em] font-semibold text-center transition-all duration-300 ${
              showBadMove
                ? "bg-[rgba(250,65,45,0.15)] text-[#fa412d] border border-[rgba(250,65,45,0.3)]"
                : "bg-[rgba(129,182,76,0.15)] text-[#81b64c] border border-[rgba(129,182,76,0.3)]"
            }`}
          >
            {showBadMove
              ? `You: ${blunder.movePlayed}`
              : `Best: ${blunder.bestMove}`}
          </div>
        </div>

        {/* Move details */}
        <div className="flex-1 min-w-40 flex flex-col gap-2">
          <div
            className={`bg-[#1e1c1a] p-2.5 rounded border-l-4 transition-opacity duration-300 ${
              showBadMove
                ? "border-l-[#fa412d] opacity-100"
                : "border-l-[#fa412d] opacity-50"
            }`}
          >
            <span className="text-[#989795] text-[0.75em]">You played</span>
            <div className="text-[#fa412d] font-semibold mt-0.5 text-sm">
              {movePlayedDisplay}
            </div>
          </div>

          <div
            className={`bg-[#1e1c1a] p-2.5 rounded border-l-4 transition-opacity duration-300 ${
              showBadMove
                ? "border-l-[#81b64c] opacity-50"
                : "border-l-[#81b64c] opacity-100"
            }`}
          >
            <span className="text-[#989795] text-[0.75em]">Best move</span>
            <div className="text-[#81b64c] font-semibold mt-0.5 text-sm">
              {bestMoveDisplay}
            </div>
          </div>

          <div className="text-[#bababa] bg-[#1e1c1a] p-2.5 rounded text-[13px] leading-tight flex-1">
            {outcomeMessage}
          </div>

          {!compact && (
            <a
              href={blunder.gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#81b64c] text-[13px] no-underline"
            >
              View full game →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
