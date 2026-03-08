import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { Chess, type Square } from "chess.js";
import { LandingPage } from "./pages/Landing";
import { AnalyzePage } from "./pages/Analyze";
import { InsightsPage } from "./pages/Insights";
import { PracticePage } from "./pages/Practice";
import { DrillSessionPage } from "./pages/DrillSession";
import { NotFoundPage } from "./pages/NotFound";
import { fetchRecentGames } from "./services/chesscom";
import { evaluatePosition, destroyEngine } from "./services/stockfish";
import type { Blunder, ChessGame, TimeClass } from "./types";

const BLUNDER_THRESHOLD = 200; // centipawns (2 pawns)
const MAX_BLUNDERS_TO_SHOW = 5;
const ANALYSIS_DEPTH = 12;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBlunders, setAllBlunders] = useState<Blunder[]>([]);
  const [progress, setProgress] = useState("");
  const [gamesAnalyzed, setGamesAnalyzed] = useState(0);
  const [gamesToAnalyze, setGamesToAnalyze] = useState(10);
  const [lastAnalyzedUsername, setLastAnalyzedUsername] = useState("");
  const [timeClassFilter, setTimeClassFilter] = useState<TimeClass | "all">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"overall" | "byGame">("overall");

  // Filter blunders based on selected time class
  const filteredBlunders =
    timeClassFilter === "all"
      ? allBlunders
      : allBlunders.filter((b) => b.timeClass === timeClassFilter);

  // Take top 5 from filtered results (use spread to avoid mutating)
  const displayBlunders = [...filteredBlunders]
    .sort((a, b) => b.evalDrop - a.evalDrop)
    .slice(0, MAX_BLUNDERS_TO_SHOW);

  // Group blunders by game for "by game" view
  const blundersByGame = filteredBlunders.reduce(
    (acc, blunder) => {
      const key = blunder.gameUrl;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(blunder);
      return acc;
    },
    {} as Record<string, Blunder[]>,
  );

  // Sort each game's blunders by move number
  Object.values(blundersByGame).forEach((gameBlunders) => {
    gameBlunders.sort((a, b) => a.moveNumber - b.moveNumber);
  });

  const analyzeGames = async (username: string) => {
    setLoading(true);
    setError(null);
    setAllBlunders([]);
    setProgress("Fetching games...");
    setGamesAnalyzed(0);
    setLastAnalyzedUsername(username);

    try {
      const allGames = await fetchRecentGames(username, gamesToAnalyze * 2); // Fetch more to have enough after filtering
      const games =
        timeClassFilter === "all"
          ? allGames.slice(0, gamesToAnalyze)
          : allGames
              .filter((g) => g.timeClass === timeClassFilter)
              .slice(0, gamesToAnalyze);

      if (games.length === 0) {
        setError(
          `No ${timeClassFilter === "all" ? "" : timeClassFilter + " "}games found.`,
        );
        setLoading(false);
        return;
      }
      setProgress(
        `Found ${games.length} ${timeClassFilter === "all" ? "" : timeClassFilter + " "}games. Starting analysis...`,
      );

      const allBlunders: Blunder[] = [];

      for (let i = 0; i < games.length; i++) {
        setProgress(`Analyzing game ${i + 1} of ${games.length}...`);

        const gameBlunders = await analyzeGame(games[i], username);
        allBlunders.push(...gameBlunders);
        setGamesAnalyzed(i + 1);
      }

      // Store all blunders (filtering happens in render)
      setAllBlunders(allBlunders);

      if (allBlunders.length === 0) {
        setProgress("No blunders found! You played well.");
      } else {
        setProgress(
          `Found ${allBlunders.length} blunders across ${games.length} games.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProgress("");
    } finally {
      setLoading(false);
      destroyEngine();
    }
  };

  const TIME_CLASS_LABELS: Record<TimeClass | "all", string> = {
    all: "All Games",
    bullet: "Bullet",
    blitz: "Blitz",
    rapid: "Rapid",
    daily: "Daily",
  };

  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/analyze"
        element={
          <AnalyzePage
            allBlunders={allBlunders}
            filteredBlunders={filteredBlunders}
            displayBlunders={displayBlunders}
            blundersByGame={blundersByGame}
            loading={loading}
            error={error}
            progress={progress}
            gamesAnalyzed={gamesAnalyzed}
            gamesToAnalyze={gamesToAnalyze}
            lastAnalyzedUsername={lastAnalyzedUsername}
            timeClassFilter={timeClassFilter}
            viewMode={viewMode}
            TIME_CLASS_LABELS={TIME_CLASS_LABELS}
            onAnalyzeGames={analyzeGames}
            onSetGamesToAnalyze={setGamesToAnalyze}
            onSetTimeClassFilter={setTimeClassFilter}
            onSetViewMode={setViewMode}
          />
        }
      />
      <Route
        path="/insights"
        element={
          <InsightsPage
            blunders={filteredBlunders}
            gamesAnalyzed={gamesAnalyzed}
          />
        }
      />
      <Route
        path="/practice"
        element={<PracticePage blunders={filteredBlunders} />}
      />
      <Route path="/practice/drill" element={<DrillSessionPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}

// ── PGN helpers ────────────────────────────────────────────────────────────

function parseOpening(pgn: string): string | undefined {
  const openingMatch = /\[Opening "([^"]+)"\]/.exec(pgn);
  if (openingMatch) return openingMatch[1];

  const ecoUrlMatch = /\[ECOUrl "([^"]+)"\]/.exec(pgn);
  if (ecoUrlMatch) {
    const slug = ecoUrlMatch[1].split("/").pop() ?? "";
    if (slug) {
      const words = slug.split("-");
      const stopWords = new Set(["with", "without", "vs"]);
      let cutoff = Math.min(words.length, 3);
      for (let i = 0; i < Math.min(words.length, 4); i++) {
        if (stopWords.has(words[i].toLowerCase()) || /^\d/.test(words[i])) {
          cutoff = i;
          break;
        }
      }
      return words.slice(0, Math.max(cutoff, 2)).join(" ");
    }
  }

  const ecoMatch = /\[ECO "([^"]+)"\]/.exec(pgn);
  return ecoMatch?.[1];
}

function parseGameResult(
  pgn: string,
  playerColor: "white" | "black",
): "win" | "loss" | "draw" {
  const resultMatch = /\[Result "([^"]+)"\]/.exec(pgn);
  const resultStr = resultMatch?.[1] ?? "*";
  if (resultStr === "1-0") return playerColor === "white" ? "win" : "loss";
  if (resultStr === "0-1") return playerColor === "black" ? "win" : "loss";
  return "draw";
}

function getGamePhase(
  fullMoveNum: number,
): "opening" | "middlegame" | "endgame" {
  if (fullMoveNum <= 10) return "opening";
  if (fullMoveNum >= 40) return "endgame";
  return "middlegame";
}

function isBestMoveCapture(
  fen: string,
  bestMoveTo: string,
  playerColor: "white" | "black",
): boolean {
  const tempChess = new Chess(fen);
  const piece = tempChess.get(bestMoveTo as Square);
  const playerColorChar = playerColor === "white" ? "w" : "b";
  return piece != null && piece.color !== playerColorChar;
}

async function createBlunderIfValid(
  fenBefore: string,
  prevEval: number,
  currentEval: number,
  move: { san: string; from: string; to: string },
  moveNumber: number,
  playerColor: "white" | "black",
  game: ChessGame,
  opponent: string,
  gameResult: "win" | "loss" | "draw",
  opening: string | undefined,
  totalPlayerMoves: number,
): Promise<Blunder | null> {
  const evalDrop = prevEval - currentEval;
  if (evalDrop < BLUNDER_THRESHOLD) return null;

  const bestResult = await evaluatePosition(fenBefore, ANALYSIS_DEPTH);
  const isValidMove =
    bestResult.bestMove &&
    bestResult.bestMove.length >= 4 &&
    bestResult.bestMove !== "(none)" &&
    bestResult.bestMove !== "timeout";

  if (!isValidMove) return null;

  const bestMoveFrom = bestResult.bestMove.slice(0, 2);
  const bestMoveTo = bestResult.bestMove.slice(2, 4);
  const pieceMoved = /^[KQRBN]/.exec(move.san) ? move.san[0] : "P";
  const fullMoveNum = Math.ceil(moveNumber / 2);

  return {
    fen: fenBefore,
    movePlayed: move.san,
    moveFrom: move.from,
    moveTo: move.to,
    bestMove: bestResult.bestMove,
    bestMoveFrom,
    bestMoveTo,
    evalBefore: prevEval,
    evalAfter: currentEval,
    evalDrop,
    moveNumber: fullMoveNum,
    playerColor,
    gameUrl: game.url,
    opponent,
    gameResult,
    timeClass: game.timeClass,
    pieceMoved,
    wasCapture: move.san.includes("x"),
    bestMoveWasCapture: isBestMoveCapture(fenBefore, bestMoveTo, playerColor),
    gamePhase: getGamePhase(fullMoveNum),
    opening,
    totalPlayerMoves,
  };
}

// ── Main analysis ───────────────────────────────────────────────────────────

async function analyzeGame(
  game: ChessGame,
  username: string,
): Promise<Blunder[]> {
  const blunders: Blunder[] = [];
  const chess = new Chess();

  const playerColor: "white" | "black" =
    game.white.toLowerCase() === username.toLowerCase() ? "white" : "black";
  const opponent = playerColor === "white" ? game.black : game.white;
  const gameResult = parseGameResult(game.pgn, playerColor);
  const opening = parseOpening(game.pgn);

  try {
    chess.loadPgn(game.pgn);
  } catch {
    return blunders;
  }

  const moves = chess.history({ verbose: true });
  chess.reset();
  const totalPlayerMoves = Math.ceil(moves.length / 2);
  let prevEval = 0;
  let moveNumber = 0;

  for (const move of moves) {
    moveNumber++;
    const fenBefore = chess.fen();
    chess.move(move.san);

    const isPlayerMove =
      (playerColor === "white" && moveNumber % 2 === 1) ||
      (playerColor === "black" && moveNumber % 2 === 0);

    if (!isPlayerMove) {
      try {
        prevEval = (await evaluatePosition(chess.fen(), ANALYSIS_DEPTH)).score;
      } catch {
        // continue
      }
      continue;
    }

    try {
      const postResult = await evaluatePosition(chess.fen(), ANALYSIS_DEPTH);
      const currentEval = -postResult.score;
      const blunder = await createBlunderIfValid(
        fenBefore, prevEval, currentEval, move, moveNumber,
        playerColor, game, opponent, gameResult, opening, totalPlayerMoves,
      );
      if (blunder) blunders.push(blunder);
      prevEval = currentEval;
    } catch {
      // continue
    }
  }

  return blunders;
}

export default App;
