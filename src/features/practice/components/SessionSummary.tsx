import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import type { Blunder } from "../../../types";

interface SessionSummaryProps {
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  missedBlunders: Blunder[];
  onReset: () => void;
  onDrillMisses: () => void;
}

function getEmoji(accuracy: number): string {
  if (accuracy >= 80) return "🏆";
  if (accuracy >= 50) return "💪";
  return "📚";
}

export function SessionSummary({
  correct,
  wrong,
  skipped,
  total,
  missedBlunders,
  onReset,
  onDrillMisses,
}: Readonly<SessionSummaryProps>) {
  const attempted = correct + wrong;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const getMessage = () => {
    if (accuracy >= 80) return "Great session! Keep drilling to lock in those patterns.";
    if (accuracy >= 50) return "Solid effort. Review the positions you missed and try again.";
    return "These are tricky spots — keep practicing and they'll click.";
  };

  return (
    <div className="fade-in flex flex-col gap-5 max-w-lg mx-auto">
      <section className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">{getEmoji(accuracy)}</div>
        <h1 className="text-white m-0 mb-1 text-2xl">Session Complete</h1>
        <p className="text-[#989795] m-0 mb-6 text-sm">{getMessage()}</p>

        {/* Accuracy ring */}
        <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 border-[#81b64c] mb-6">
          <span className="text-3xl font-bold text-[#81b64c]">{accuracy}%</span>
          <span className="text-[#989795] text-xs">accuracy</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#272522] rounded-lg p-3 border border-[#3d3a37]">
            <div className="text-2xl font-bold text-[#81b64c]">{correct}</div>
            <div className="text-[#989795] text-xs mt-0.5">Correct</div>
          </div>
          <div className="bg-[#272522] rounded-lg p-3 border border-[#3d3a37]">
            <div className="text-2xl font-bold text-[#fa412d]">{wrong}</div>
            <div className="text-[#989795] text-xs mt-0.5">Wrong</div>
          </div>
          <div className="bg-[#272522] rounded-lg p-3 border border-[#3d3a37]">
            <div className="text-2xl font-bold text-[#989795]">{skipped}</div>
            <div className="text-[#989795] text-xs mt-0.5">Skipped</div>
          </div>
        </div>

        <div className="text-[#5a5856] text-sm mb-6">
          {total} puzzle{total === 1 ? "" : "s"} in this session
        </div>

        <div className="flex flex-col gap-3">
          {missedBlunders.length > 0 && (
            <button
              onClick={onDrillMisses}
              className="w-full py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer"
              style={{
                color: "#fa412d",
                background: "rgba(250,65,45,0.08)",
                borderColor: "rgba(250,65,45,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(250,65,45,0.14)";
                e.currentTarget.style.borderColor = "rgba(250,65,45,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(250,65,45,0.08)";
                e.currentTarget.style.borderColor = "rgba(250,65,45,0.3)";
              }}
            >
              Drill your misses ({missedBlunders.length})
            </button>
          )}
          <Button onClick={onReset}>Drill Again</Button>
          <Link
            to="/insights"
            className="text-[#989795] hover:text-[#bababa] text-sm transition-colors"
          >
            ← Back to Insights
          </Link>
        </div>
      </section>
    </div>
  );
}
