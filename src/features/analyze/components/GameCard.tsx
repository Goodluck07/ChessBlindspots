import { useState } from "react";
import { BlunderCard } from "./BlunderCard";
import type { Blunder } from "../../../types";

interface GameCardProps {
  gameUrl: string;
  blunders: Blunder[];
}

export function GameCard({ gameUrl, blunders }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const game = blunders[0];

  const worstDrop = Math.max(...blunders.map((b) => b.evalDrop)) / 100;

  const totalPlayerMoves = game.totalPlayerMoves ?? 0;
  const accuracy =
    totalPlayerMoves > 0
      ? Math.max(0, Math.round((1 - blunders.length / totalPlayerMoves) * 100))
      : null;
  const accuracyColor =
    accuracy === null
      ? "text-[#989795]"
      : accuracy >= 90
        ? "text-green-500"
        : accuracy >= 75
          ? "text-yellow-500"
          : "text-red-500";

  const resultBg =
    game.gameResult === "win"
      ? "bg-green-800 text-green-500"
      : game.gameResult === "loss"
        ? "bg-red-800 text-red-500"
        : "bg-[#3d3a37] text-[#bababa]";

  return (
    <div className="fade-in bg-[#1e1c1a] rounded-lg border border-[#3d3a37] overflow-hidden transition-shadow transform duration-200 hover:shadow-xl hover:-translate-y-0.5">
      {/* Clickable Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 bg-transparent border-none cursor-pointer flex justify-between items-center gap-4"
      >
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Opponent */}
          <span className="text-[#e0e0e0] text-base font-semibold">
            vs {game.opponent}
          </span>

          {/* Pills */}
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-[#3d3a37] rounded-full text-[0.75em] text-[#bababa] capitalize">
              {game.timeClass}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-[0.75em] ${resultBg}`}
            >
              {game.gameResult === "win"
                ? "Won"
                : game.gameResult === "loss"
                  ? "Lost"
                  : "Draw"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Accuracy */}
          {accuracy !== null && (
            <div className="text-right">
              <div className={`text-sm font-semibold ${accuracyColor}`}>
                {accuracy}%
              </div>
              <div className="text-[#989795] text-[0.75em]">accuracy</div>
            </div>
          )}

          {/* Stats */}
          <div className="text-right">
            <div className="text-red-500 text-sm font-semibold">
              {blunders.length} blunder{blunders.length > 1 ? "s" : ""}
            </div>
            <div className="text-[#989795] text-[0.75em]">
              worst: -{worstDrop.toFixed(1)}
            </div>
          </div>

          {/* Chevron */}
          <span
            className={`text-[#989795] text-xl transition-transform duration-200 ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[#3d3a37]">
          {/* View Game Link */}
          <div className="py-3 mb-3">
            <a
              href={gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-[0.85em] hover:underline"
            >
              View full game on chess.com →
            </a>
          </div>

          {/* Blunders */}
          <div className="flex flex-col gap-3">
            {blunders.map((blunder) => (
              <BlunderCard
                key={`${blunder.gameUrl}-${blunder.moveNumber}`}
                blunder={blunder}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
