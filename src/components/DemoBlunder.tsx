import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";

// Famous "Scholar's Mate" trap position - Black can block but plays wrong move
// Position: 1.e4 e5 2.Bc4 Nc6 3.Qf3 (threatening Qxf7#)
const SAMPLE_FEN =
  "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 3 3";

// Bad move: pawn g7-g6 (allows Qxf7#)
const BLUNDER_FROM = "g7";
const BLUNDER_TO = "g6";

// Best move: Queen d8-e7 (blocks the attack)
const BEST_FROM = "d8";
const BEST_TO = "e7";

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
          backgroundColor: "rgba(247, 216, 96, 0.8)", // Yellow - starting square
        },
        [BLUNDER_TO]: {
          backgroundColor: "rgba(247, 216, 96, 0.8)", // Yellow - destination
        },
      }
    : {
        [BEST_FROM]: {
          backgroundColor: "rgba(129, 182, 76, 0.85)", // Green - starting square
        },
        [BEST_TO]: {
          backgroundColor: "rgba(129, 182, 76, 0.85)", // Green - good destination
        },
      };

  // Dynamic arrow based on which move we're showing
  const arrows = showBadMove
    ? [{ startSquare: BLUNDER_FROM, endSquare: BLUNDER_TO, color: "#d32f2f" }]
    : [{ startSquare: BEST_FROM, endSquare: BEST_TO, color: "#5b9a32" }];

  // compute badge classes
  const badgeClasses = showBadMove
    ? "bg-red-100 text-red-600 border border-red-200"
    : "bg-green-100 text-green-600 border border-green-200";

  return (
    <div className="border border-[#3d3a37] rounded-lg p-5 mb-8 bg-[#272522] shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-green-600">How It Works</h3>
        <span className="text-xs text-[#989795] bg-[#3d3a37] px-2 py-1 rounded">
          Sample Analysis
        </span>
      </div>

      <div className="flex gap-5 flex-wrap">
        {/* Chess Board with animated highlights */}
        <div className="flex flex-col gap-2">
          <div className="w-75 h-75 rounded-sm overflow-hidden shadow-md">
            <Chessboard
              options={{
                position: SAMPLE_FEN,
                boardOrientation: "black",
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
            className={`${badgeClasses} px-3 py-1.5 rounded text-[0.85em] font-semibold text-center transition-all duration-300`}
          >
            {showBadMove ? "You played: g7-g6" : "Best move: Qd8-e7"}
          </div>
        </div>

        {/* Explanation */}
        <div className="flex-1 min-w-62.5 flex flex-col gap-4">
          <div
            className={`bg-[#1e1c1a] p-4 rounded border-l-4 border-red-600 transition-opacity duration-300 ${
              showBadMove ? "opacity-100" : "opacity-50"
            }`}
          >
            <p className="m-0 text-red-600 font-semibold">The Blunder</p>
            <p className="m-0 text-[#bababa] text-sm leading-relaxed">
              Black moves <strong className="text-red-600">Pawn to g6</strong>,
              but this completely ignores White's threat! The Queen and Bishop
              are both attacking f7. White takes{" "}
              <strong>Queen to f7 - checkmate</strong>.
            </p>
          </div>

          <div
            className={`bg-[#1e1c1a] p-4 rounded border-l-4 border-green-600 transition-opacity duration-300 ${
              showBadMove ? "opacity-50" : "opacity-100"
            }`}
          >
            <p className="m-0 text-green-600 font-semibold">Better Move</p>
            <p className="m-0 text-[#bababa] text-sm leading-relaxed">
              <strong className="text-green-600">Queen to e7</strong> blocks the
              diagonal and defends the f7 Pawn. The Queen can't be captured, and
              Black stays in the game.
            </p>
          </div>

          <div className="flex gap-3 items-center text-[#989795] text-[0.85em] flex-wrap">
            <span className="inline-block w-3 h-3 bg-green-400/60 rounded-sm" />
            <span>Good / From</span>
            <span className="inline-block w-3 h-3 bg-red-400/60 rounded-sm ml-2" />
            <span>Blunder</span>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="mt-5 p-3 bg-[#1e1c1a] rounded text-center text-[#989795] text-[0.9em]">
        Enter your chess.com username above to find blunders like this in your
        games!
      </div>
    </div>
  );
}
