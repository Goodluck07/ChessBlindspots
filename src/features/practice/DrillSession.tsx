import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { Blunder } from "../../types";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { SessionSummary } from "./components/SessionSummary";

interface SessionStats {
  correct: number;
  wrong: number;
  skipped: number;
}

export function DrillSessionView() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialQueue: Blunder[] = location.state?.queue ?? [];

  useEffect(() => {
    if (initialQueue.length === 0) navigate("/practice", { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [queue, setQueue] = useState<Blunder[]>(initialQueue);
  const [initialQueueLength] = useState(initialQueue.length);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<SessionStats>({
    correct: 0,
    wrong: 0,
    skipped: 0,
  });
  const [retriedSet, setRetriedSet] = useState(new Set<string>());
  const [missedBlunders, setMissedBlunders] = useState<Blunder[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentBlunder = queue[currentIndex];
  const blunderKey = currentBlunder
    ? `${currentBlunder.gameUrl}_${currentBlunder.moveNumber}`
    : "";

  const advance = () => {
    const next = currentIndex + 1;
    if (next >= queue.length) {
      setIsDone(true);
    } else {
      setCurrentIndex(next);
    }
  };

  const handleCorrect = () => {
    setStats((s) => ({ ...s, correct: s.correct + 1 }));
    setStreak((s) => s + 1);
    advance();
  };

  const handleWrong = () => {
    if (!retriedSet.has(blunderKey)) {
      setRetriedSet((prev) => new Set([...prev, blunderKey]));
      setQueue((prev) => [...prev, currentBlunder]);
      setMissedBlunders((prev) => [...prev, currentBlunder]);
    }
    setStats((s) => ({ ...s, wrong: s.wrong + 1 }));
    setStreak(0);
    advance();
  };

  const handleSkip = () => {
    setStats((s) => ({ ...s, skipped: s.skipped + 1 }));
    setStreak(0);
    advance();
  };

  if (initialQueue.length === 0) return null;

  if (isDone) {
    return (
      <SessionSummary
        correct={stats.correct}
        wrong={stats.wrong}
        skipped={stats.skipped}
        total={initialQueueLength}
        missedBlunders={missedBlunders}
        onReset={() => navigate("/practice")}
        onDrillMisses={() =>
          navigate("/drill", { state: { queue: missedBlunders } })
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {currentBlunder && (
        <PuzzleBoard
          blunder={currentBlunder}
          puzzleNumber={currentIndex + 1}
          totalPuzzles={queue.length}
          streak={streak}
          isRetry={retriedSet.has(blunderKey)}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
}
