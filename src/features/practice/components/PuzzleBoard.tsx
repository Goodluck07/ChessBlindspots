import React, { useState, useEffect, useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Blunder } from "../../../types";

interface PuzzleBoardProps {
  blunder: Blunder;
  puzzleNumber: number;
  totalPuzzles: number;
  streak: number;
  isRetry?: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onSkip: () => void;
}

type PuzzleState = "waiting" | "correct" | "wrong" | "revealed";

const PIECE_NAMES: Record<string, string> = {
  K: "King",
  Q: "Queen",
  R: "Rook",
  B: "Bishop",
  N: "Knight",
  P: "Pawn",
};

function getSeverityLabel(evalDrop: number) {
  const p = evalDrop / 100;
  if (p >= 5) return { label: "Critical", color: "#fa412d" };
  if (p >= 3) return { label: "Major", color: "#e6a23c" };
  return { label: "Moderate", color: "#5a9fd4" };
}

const BOARD_GLOW: Record<PuzzleState, string> = {
  waiting: "0 0 0 2px #2e2b28, 0 8px 32px rgba(0,0,0,0.6)",
  correct: "0 0 0 3px #81b64c, 0 0 40px rgba(129,182,76,0.35)",
  wrong: "0 0 0 3px #fa412d, 0 0 40px rgba(250,65,45,0.35)",
  revealed: "0 0 0 2px rgba(129,182,76,0.5), 0 0 24px rgba(129,182,76,0.15)",
};

function getPieceOnSquare(fen: string, square: string): string | null {
  const pieceNames: Record<string, string> = {
    k: "King", q: "Queen", r: "Rook", b: "Bishop", n: "Knight", p: "Pawn",
    K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn",
  };
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1]) - 1;
  if (rank < 0 || rank > 7 || file < 0 || file > 7) return null;
  const row = fen.split(" ")[0].split("/").reverse()[rank];
  let col = 0;
  for (const char of row) {
    if (/\d/.test(char)) {
      col += parseInt(char);
    } else {
      if (col === file) return pieceNames[char] ?? null;
      col++;
    }
  }
  return null;
}

function evalToMaterial(centipawns: number): string {
  const pawns = Math.abs(centipawns) / 100;
  if (pawns >= 8) return "a Queen";
  if (pawns >= 4.5) return "a Rook";
  if (pawns >= 2.5) return "a piece";
  if (pawns >= 1.5) return "a pawn";
  return "an advantage";
}

function getExplanation(blunder: Blunder): string {
  const pieceName = PIECE_NAMES[blunder.pieceMoved] ?? "piece";
  const bestMovePiece = getPieceOnSquare(blunder.fen, blunder.bestMoveFrom) ?? "piece";
  const targetPiece = getPieceOnSquare(blunder.fen, blunder.bestMoveTo);
  const afterPawns = blunder.evalAfter / 100;
  const evalSwing = Math.abs(blunder.evalDrop / 100);

  if (blunder.evalDrop > 5000) {
    return `You had a forced checkmate! Moving your ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} would have delivered the winning sequence.`;
  }
  if (Math.abs(afterPawns) > 50) {
    return `Moving your ${pieceName} to ${blunder.moveTo} opened a checkmate for your opponent. The ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} would have blocked the threat and kept you in the game.`;
  }
  if (blunder.bestMoveWasCapture && !blunder.wasCapture && targetPiece) {
    return `The best move was to capture the ${targetPiece} on ${blunder.bestMoveTo} with your ${bestMovePiece}. Instead, your ${pieceName} moved to ${blunder.moveTo}, missing that opportunity.`;
  }
  if (blunder.wasCapture && evalSwing > 3) {
    const capturedPiece = getPieceOnSquare(blunder.fen, blunder.moveTo);
    const capturedDesc = capturedPiece ? `the ${capturedPiece}` : "that piece";
    return `Your ${pieceName} captured ${capturedDesc} on ${blunder.moveTo}, but it was defended. Your opponent recaptures and wins material. The ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} was safer.`;
  }
  if (evalSwing > 5) {
    return `Moving your ${pieceName} to ${blunder.moveTo} left a piece undefended. Playing the ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} would have kept your pieces protected, saving you ${evalToMaterial(blunder.evalDrop)}.`;
  }
  if (evalSwing > 3) {
    return `Your ${pieceName} move to ${blunder.moveTo} allowed your opponent a strong tactical reply. The ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} avoids this and maintains your position.`;
  }
  if (blunder.gamePhase === "opening") {
    return `Your ${pieceName} move to ${blunder.moveTo} wastes time in the opening. The ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} develops more efficiently or fights for the center.`;
  }
  if (blunder.gamePhase === "endgame") {
    return `In this endgame, your ${pieceName} on ${blunder.moveTo} is passive. The ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} is more active and gives better control.`;
  }
  return `Your ${pieceName} move to ${blunder.moveTo} gave away ${evalToMaterial(blunder.evalDrop)}. The ${bestMovePiece} from ${blunder.bestMoveFrom} to ${blunder.bestMoveTo} was the stronger continuation.`;
}

export function PuzzleBoard({
  blunder,
  puzzleNumber,
  totalPuzzles,
  streak,
  isRetry = false,
  onCorrect,
  onWrong,
  onSkip,
}: Readonly<PuzzleBoardProps>) {
  const [puzzleState, setPuzzleState] = useState<PuzzleState>("waiting");
  const [hintLevel, setHintLevel] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [wrongAttempt, setWrongAttempt] = useState<{
    from: string;
    to: string;
  } | null>(null);

  useEffect(() => {
    setPuzzleState("waiting");
    setHintLevel(0);
    setSelectedSquare(null);
    setWrongAttempt(null);
  }, [blunder]);

  // Auto-transition from wrong → revealed
  useEffect(() => {
    if (puzzleState === "wrong") {
      const t = setTimeout(() => {
        setWrongAttempt(null);
        setPuzzleState("revealed");
      }, 900);
      return () => clearTimeout(t);
    }
  }, [puzzleState]);

  // Post-move FEN — the position after the best move is played
  const resultFen = useMemo(() => {
    try {
      const chess = new Chess(blunder.fen);
      chess.move({
        from: blunder.bestMoveFrom as Square,
        to: blunder.bestMoveTo as Square,
        promotion: "q",
      });
      return chess.fen();
    } catch {
      return blunder.fen;
    }
  }, [blunder]);

  const isPlayerPiece = (pieceType: string) => {
    const isWhite = pieceType.startsWith("w");
    return blunder.playerColor === "white" ? isWhite : !isWhite;
  };

  const isLegalMove = (from: string, to: string) => {
    const chess = new Chess(blunder.fen);
    return chess
      .moves({ square: from as Square, verbose: true })
      .some((m) => m.to === to);
  };

  const handleMoveAttempt = (from: string, to: string) => {
    if (puzzleState !== "waiting") return;
    if (from === blunder.bestMoveFrom && to === blunder.bestMoveTo) {
      setPuzzleState("correct");
    } else {
      setWrongAttempt({ from, to });
      setPuzzleState("wrong");
    }
  };

  const handlePieceClick = ({
    piece,
    square,
  }: {
    isSparePiece: boolean;
    piece: { pieceType: string };
    square: string | null;
  }) => {
    if (puzzleState !== "waiting" || !square) return;
    if (!selectedSquare) {
      if (isPlayerPiece(piece.pieceType)) setSelectedSquare(square);
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
    } else if (isPlayerPiece(piece.pieceType)) {
      setSelectedSquare(square);
    } else {
      if (!isLegalMove(selectedSquare, square)) return;
      handleMoveAttempt(selectedSquare, square);
      setSelectedSquare(null);
    }
  };

  const handleSquareClick = ({
    piece,
    square,
  }: {
    piece: { pieceType: string } | null;
    square: string;
  }) => {
    if (puzzleState !== "waiting") return;
    if (!selectedSquare) {
      if (piece && isPlayerPiece(piece.pieceType)) setSelectedSquare(square);
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
    } else if (piece && isPlayerPiece(piece.pieceType)) {
      setSelectedSquare(square);
    } else {
      if (!isLegalMove(selectedSquare, square)) return;
      handleMoveAttempt(selectedSquare, square);
      setSelectedSquare(null);
    }
  };

  const handleHint = () => {
    if (puzzleState !== "waiting") return;
    if (hintLevel === 0) {
      setHintLevel(1);
    } else {
      setHintLevel(2);
      setPuzzleState("revealed");
    }
  };

  const legalDestinations = useMemo<Set<string>>(() => {
    if (!selectedSquare || puzzleState !== "waiting") return new Set();
    const chess = new Chess(blunder.fen);
    const moves = chess.moves({ square: selectedSquare as Square, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [selectedSquare, puzzleState, blunder.fen]);

  const currentPosition = useMemo(() => {
    const chess = new Chess(blunder.fen);
    return chess.board().flat().reduce<Record<string, true>>((acc, sq) => {
      if (sq) acc[sq.square] = true;
      return acc;
    }, {});
  }, [blunder.fen]);

  const squareStyles: Record<string, React.CSSProperties> = (() => {
    // After solving — show the landing square highlighted on result position
    if (puzzleState === "correct" || puzzleState === "revealed") {
      return {
        [blunder.bestMoveTo]: { backgroundColor: "rgba(129, 182, 76, 0.7)" },
      };
    }
    if (puzzleState === "wrong" && wrongAttempt) {
      return {
        [wrongAttempt.from]: { backgroundColor: "rgba(250, 65, 45, 0.65)" },
        [wrongAttempt.to]: { backgroundColor: "rgba(250, 65, 45, 0.65)" },
      };
    }
    const styles: Record<string, React.CSSProperties> = {};
    if (hintLevel >= 1) {
      styles[blunder.bestMoveFrom] = { backgroundColor: "rgba(129, 182, 76, 0.45)" };
    }
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(247, 216, 96, 0.75)" };
      for (const sq of legalDestinations) {
        if (currentPosition[sq]) {
          styles[sq] = {
            background: "radial-gradient(circle, transparent 58%, rgba(0,0,0,0.28) 60%)",
          };
        } else {
          styles[sq] = {
            background: "radial-gradient(circle, rgba(0,0,0,0.28) 24%, transparent 26%)",
          };
        }
      }
    }
    return styles;
  })();

  // Show result position after correct/revealed so the user sees the piece landed
  const boardPosition =
    puzzleState === "correct" || puzzleState === "revealed"
      ? resultFen
      : blunder.fen;

  const explanation = getExplanation(blunder);
  const severity = getSeverityLabel(blunder.evalDrop);
  const progress = Math.round(((puzzleNumber - 1) / totalPuzzles) * 100);
  const isSample = blunder.gameUrl === "#";

  return (
    <div className="fade-in flex flex-col gap-5">

      {/* ── Meta row ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase"
            style={{
              color: severity.color,
              background: `${severity.color}18`,
              border: `1px solid ${severity.color}40`,
            }}
          >
            {severity.label} −{(blunder.evalDrop / 100).toFixed(1)}
          </span>
          <span className="text-[#5a5856] text-xs uppercase tracking-wider capitalize">
            {blunder.gamePhase} · move {blunder.moveNumber}
          </span>
          {blunder.opening && (
            <span
              className="px-2 py-0.5 rounded-md text-xs text-[#81b64c] border border-[#81b64c30] truncate max-w-[180px]"
              style={{ background: "#81b64c18" }}
              title={blunder.opening}
            >
              {blunder.opening}
            </span>
          )}
          {isRetry && (
            <span className="px-2 py-0.5 rounded-md text-xs bg-[#272522] text-[#6b6864] border border-[#3d3a37]">
              Retry
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="text-[#e6a23c] text-xs font-semibold tabular-nums">
              🔥 {streak}
            </span>
          )}
          <span className="text-[#5a5856] text-sm font-mono tabular-nums">
            {puzzleNumber}
            <span className="text-[#3d3a37]"> / </span>
            {totalPuzzles}
          </span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-0.5 bg-[#272522] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#81b64c] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Board + panel ── */}
      <div className="flex gap-7 flex-wrap items-start">

        {/* Board column */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          {/* Playing-as badge */}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2 shrink-0"
              style={
                blunder.playerColor === "white"
                  ? { background: "#f0d9b5", borderColor: "#c8a96e" }
                  : { background: "#2c2017", borderColor: "#8b6914" }
              }
            />
            <span className="text-[#6b6864] text-xs uppercase tracking-widest">
              Playing as{" "}
              <span className="text-[#989795] font-semibold capitalize">
                {blunder.playerColor}
              </span>
            </span>
          </div>

          {/* Board */}
          <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
              width: "min(80vw, 420px)",
              height: "min(80vw, 420px)",
              boxShadow: BOARD_GLOW[puzzleState],
            }}
          >
            <Chessboard
              options={{
                position: boardPosition,
                boardOrientation: blunder.playerColor,
                allowDragging: puzzleState === "waiting",
                canDragPiece: ({ piece }) => isPlayerPiece(piece.pieceType),
                onPieceDrop: ({ sourceSquare, targetSquare }) => {
                  if (targetSquare) handleMoveAttempt(sourceSquare, targetSquare);
                  return false;
                },
                onPieceClick: handlePieceClick,
                onSquareClick: handleSquareClick,
                squareStyles,
                arrows: [],
                darkSquareStyle: { backgroundColor: "#779556" },
                lightSquareStyle: { backgroundColor: "#ebecd0" },
              }}
            />
          </div>

          {/* Game source — hidden for sample puzzles */}
          {!isSample && (
            <div className="text-[#3d3a37] text-xs">
              vs{" "}
              <a
                href={blunder.gameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4a6a7a] hover:text-[#81b64c] transition-colors"
              >
                {blunder.opponent} ↗
              </a>
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-3 pt-9">

          {/* Status card */}
          {puzzleState === "waiting" && (
            <div
              className="rounded-xl p-4 border"
              style={{ background: "#1e1b18", borderColor: "#2e2b28" }}
            >
              {hintLevel === 0 ? (
                <>
                  <p className="text-[#bababa] text-sm font-medium m-0 mb-1">
                    Find the best move
                  </p>
                  <p className="text-[#5a5856] text-xs m-0">
                    Select a piece and choose its destination.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[#81b64c] text-xs font-semibold uppercase tracking-wider m-0 mb-1">
                    Hint
                  </p>
                  <p className="text-[#bababa] text-sm m-0">
                    Move the{" "}
                    <span className="font-semibold">
                      {PIECE_NAMES[blunder.pieceMoved] ?? "piece"}
                    </span>{" "}
                    on{" "}
                    <span className="font-mono text-[#e6a23c]">
                      {blunder.bestMoveFrom}
                    </span>
                  </p>
                </>
              )}
            </div>
          )}

          {puzzleState === "correct" && (
            <div
              className="rounded-xl p-4 border"
              style={{
                background: "rgba(129,182,76,0.08)",
                borderColor: "rgba(129,182,76,0.3)",
              }}
            >
              <p className="text-[#81b64c] text-base font-bold m-0 mb-1">
                ✓ Correct!
              </p>
              <p className="text-[#6b9a48] text-xs font-mono m-0 mb-3">
                {blunder.bestMoveFrom} → {blunder.bestMoveTo}
              </p>
              <p className="text-[#989795] text-xs leading-relaxed m-0">
                {explanation}
              </p>
            </div>
          )}

          {puzzleState === "wrong" && (
            <div
              className="rounded-xl p-4 border"
              style={{
                background: "rgba(250,65,45,0.08)",
                borderColor: "rgba(250,65,45,0.3)",
              }}
            >
              <p className="text-[#fa412d] text-base font-bold m-0 mb-1">
                ✗ Not quite
              </p>
              {wrongAttempt && (
                <p className="text-[#8a4040] text-xs m-0">
                  {wrongAttempt.from} → {wrongAttempt.to} wasn't the best.
                  Showing the correct move…
                </p>
              )}
            </div>
          )}

          {puzzleState === "revealed" && (
            <div
              className="rounded-xl p-4 border"
              style={{
                background: "rgba(129,182,76,0.06)",
                borderColor: "rgba(129,182,76,0.2)",
              }}
            >
              <p className="text-[#81b64c] text-xs font-semibold uppercase tracking-wider m-0 mb-2">
                Best move
              </p>
              <p className="text-[#bababa] text-base font-mono font-semibold m-0 mb-3">
                {blunder.bestMoveFrom} → {blunder.bestMoveTo}
              </p>
              <p className="text-[#989795] text-xs leading-relaxed m-0 mb-2">
                {explanation}
              </p>
              <p className="text-[#5a5856] text-xs m-0">
                Added to retry queue.
              </p>
            </div>
          )}

          {/* Hint button */}
          {puzzleState === "waiting" && hintLevel < 2 && (
            <button
              onClick={handleHint}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all cursor-pointer"
              style={{
                color: "#6b9a48",
                background: "rgba(129,182,76,0.06)",
                borderColor: "rgba(129,182,76,0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(129,182,76,0.12)";
                e.currentTarget.style.borderColor = "rgba(129,182,76,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(129,182,76,0.06)";
                e.currentTarget.style.borderColor = "rgba(129,182,76,0.2)";
              }}
            >
              💡{" "}
              {hintLevel === 0 ? "Show hint" : "Reveal answer"}
            </button>
          )}

          {/* Skip / Next */}
          <div className="flex gap-2">
            {puzzleState === "waiting" && (
              <button
                onClick={onSkip}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer"
                style={{
                  color: "#5a5856",
                  background: "transparent",
                  borderColor: "#2e2b28",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#989795";
                  e.currentTarget.style.borderColor = "#3d3a37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#5a5856";
                  e.currentTarget.style.borderColor = "#2e2b28";
                }}
              >
                Skip
              </button>
            )}
            {(puzzleState === "correct" || puzzleState === "revealed") && (
              <button
                onClick={puzzleState === "correct" ? onCorrect : onWrong}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer"
                style={{
                  color: "#bababa",
                  background: "#272522",
                  borderColor: "#3d3a37",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#81b64c";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#3d3a37";
                  e.currentTarget.style.color = "#bababa";
                }}
              >
                Next →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
