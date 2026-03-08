import React, { useState, useEffect, useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Blunder } from "../../../types";

interface PuzzleBoardProps {
  blunder: Blunder;
  puzzleNumber: number;
  totalPuzzles: number;
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

export function PuzzleBoard({
  blunder,
  puzzleNumber,
  totalPuzzles,
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

  useEffect(() => {
    if (puzzleState === "correct") {
      const t = setTimeout(() => onCorrect(), 1500);
      return () => clearTimeout(t);
    }
  }, [puzzleState, onCorrect]);

  useEffect(() => {
    if (puzzleState === "wrong") {
      const t = setTimeout(() => {
        setWrongAttempt(null);
        setPuzzleState("revealed");
      }, 900);
      return () => clearTimeout(t);
    }
  }, [puzzleState]);

  // pieceType is "wR", "bR" etc. — first char is color
  const isPlayerPiece = (pieceType: string) => {
    const isWhite = pieceType[0] === "w";
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

  // Primary click handler — fires for both piece squares and empty squares,
  // including touch events (onPieceClick does not fire on mobile).
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

  // Legal destinations for the selected piece — used for move dots
  const legalDestinations = useMemo<Set<string>>(() => {
    if (!selectedSquare || puzzleState !== "waiting") return new Set();
    const chess = new Chess(blunder.fen);
    const moves = chess.moves({ square: selectedSquare as Square, verbose: true });
    return new Set(moves.map((m) => m.to));
  }, [selectedSquare, puzzleState, blunder.fen]);

  // Current board position map for deciding dot vs ring on capture squares
  const currentPosition = useMemo(() => {
    const chess = new Chess(blunder.fen);
    return chess.board().flat().reduce<Record<string, true>>((acc, sq) => {
      if (sq) acc[sq.square] = true;
      return acc;
    }, {});
  }, [blunder.fen]);

  const squareStyles: Record<string, React.CSSProperties> = (() => {
    if (puzzleState === "correct") {
      return {
        [blunder.bestMoveFrom]: { backgroundColor: "rgba(129, 182, 76, 0.85)" },
        [blunder.bestMoveTo]: { backgroundColor: "rgba(129, 182, 76, 0.85)" },
      };
    }
    if (puzzleState === "wrong" && wrongAttempt) {
      return {
        [wrongAttempt.from]: { backgroundColor: "rgba(250, 65, 45, 0.65)" },
        [wrongAttempt.to]: { backgroundColor: "rgba(250, 65, 45, 0.65)" },
      };
    }
    if (puzzleState === "revealed") {
      return {
        [blunder.bestMoveFrom]: { backgroundColor: "rgba(129, 182, 76, 0.6)" },
        [blunder.bestMoveTo]: { backgroundColor: "rgba(129, 182, 76, 0.6)" },
      };
    }
    const styles: Record<string, React.CSSProperties> = {};
    if (hintLevel >= 1) {
      styles[blunder.bestMoveFrom] = { backgroundColor: "rgba(129, 182, 76, 0.45)" };
    }
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(247, 216, 96, 0.75)" };
      // Legal move dots
      for (const sq of legalDestinations) {
        if (currentPosition[sq]) {
          // Capture square — ring
          styles[sq] = {
            background:
              "radial-gradient(circle, transparent 58%, rgba(0,0,0,0.28) 60%)",
          };
        } else {
          // Empty square — dot
          styles[sq] = {
            background:
              "radial-gradient(circle, rgba(0,0,0,0.28) 24%, transparent 26%)",
          };
        }
      }
    }
    return styles;
  })();

  const arrows =
    puzzleState === "correct" || puzzleState === "revealed"
      ? [{ startSquare: blunder.bestMoveFrom, endSquare: blunder.bestMoveTo, color: "#5b9a32" }]
      : [];

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
          {isRetry && (
            <span className="px-2 py-0.5 rounded-md text-xs bg-[#272522] text-[#6b6864] border border-[#3d3a37]">
              Retry
            </span>
          )}
        </div>
        <span className="text-[#5a5856] text-sm font-mono tabular-nums">
          {puzzleNumber}
          <span className="text-[#3d3a37]"> / </span>
          {totalPuzzles}
        </span>
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
                position: blunder.fen,
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
                arrows,
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
              <p className="text-[#6b9a48] text-xs m-0 font-mono">
                {blunder.bestMoveFrom} → {blunder.bestMoveTo}
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
              <p className="text-[#8a4040] text-xs m-0">
                Showing the best move…
              </p>
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
              <p className="text-[#bababa] text-base font-mono font-semibold m-0 mb-1">
                {blunder.bestMoveFrom} → {blunder.bestMoveTo}
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
            {puzzleState === "revealed" && (
              <button
                onClick={onWrong}
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
