import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Chess } from "chess.js";
import { LandingPage } from "./pages/Landing";
import { AnalyzePage } from "./pages/Analyze";
import { InsightsPage } from "./pages/Insights";
import { PracticePage } from "./pages/Practice";
import { NotFoundPage } from "./pages/NotFound";
import { fetchRecentGames } from "./services/chesscom";
import { evaluatePosition, destroyEngine } from "./services/stockfish";
import type { Blunder, ChessGame, TimeClass } from "./types";

const BLUNDER_THRESHOLD = 200; // centipawns (2 pawns)
const MAX_BLUNDERS_TO_SHOW = 5;
const GAMES_TO_ANALYZE = 10;
const ANALYSIS_DEPTH = 12;
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Cache utilities ──────────────────────────────────────────
interface CachedAnalysis {
  username: string;
  blunders: Blunder[];
  gamesAnalyzed: number;
  timestamp: number;
}

function cacheKey(username: string) {
  return `chessblinds_${username.toLowerCase()}`;
}

function saveToCache(
  username: string,
  blunders: Blunder[],
  gamesAnalyzed: number,
) {
  try {
    const data: CachedAnalysis = {
      username,
      blunders,
      gamesAnalyzed,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey(username), JSON.stringify(data));
    const names: string[] = JSON.parse(
      localStorage.getItem("chessblinds_usernames") || "[]",
    );
    if (!names.includes(username.toLowerCase())) {
      names.push(username.toLowerCase());
      localStorage.setItem("chessblinds_usernames", JSON.stringify(names));
    }
  } catch {
    /* storage full or unavailable */
  }
}

function loadFromCache(username: string): CachedAnalysis | null {
  try {
    const raw = localStorage.getItem(cacheKey(username));
    if (!raw) return null;
    const data: CachedAnalysis = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(cacheKey(username));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function getAllCached(): CachedAnalysis[] {
  try {
    const names: string[] = JSON.parse(
      localStorage.getItem("chessblinds_usernames") || "[]",
    );
    return names
      .map((n) => loadFromCache(n))
      .filter((d): d is CachedAnalysis => d !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBlunders, setAllBlunders] = useState<Blunder[]>([]);
  const [progress, setProgress] = useState("");
  const [gamesAnalyzed, setGamesAnalyzed] = useState(0);
  const [timeClassFilter, setTimeClassFilter] = useState<TimeClass | "all">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"overall" | "byGame">("overall");

  // Load a previously cached analysis
  const restoreFromCache = (username: string) => {
    const cached = loadFromCache(username);
    if (!cached) return;
    setAllBlunders(cached.blunders);
    setGamesAnalyzed(cached.gamesAnalyzed);
    setProgress(
      `Loaded saved analysis for "${cached.username}" (${timeAgo(cached.timestamp)})`,
    );
  };

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

    try {
      const allGames = await fetchRecentGames(username, GAMES_TO_ANALYZE * 2); // Fetch more to have enough after filtering
      const games =
        timeClassFilter === "all"
          ? allGames.slice(0, GAMES_TO_ANALYZE)
          : allGames
              .filter((g) => g.timeClass === timeClassFilter)
              .slice(0, GAMES_TO_ANALYZE);

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

      // Save to cache for future visits
      saveToCache(username, allBlunders, games.length);

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
            timeClassFilter={timeClassFilter}
            viewMode={viewMode}
            TIME_CLASS_LABELS={TIME_CLASS_LABELS}
            onAnalyzeGames={analyzeGames}
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
            cachedAnalyses={getAllCached()}
            onLoadCache={restoreFromCache}
          />
        }
      />
      <Route path="/practice" element={<PracticePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

async function analyzeGame(
  game: ChessGame,
  username: string,
): Promise<Blunder[]> {
  const blunders: Blunder[] = [];
  const chess = new Chess();

  // Determine which color the user played
  const playerColor: "white" | "black" =
    game.white.toLowerCase() === username.toLowerCase() ? "white" : "black";

  // Get opponent name
  const opponent = playerColor === "white" ? game.black : game.white;

  // Parse game result from PGN
  const resultMatch = game.pgn.match(/\[Result "([^"]+)"\]/);
  const resultStr = resultMatch ? resultMatch[1] : "*";

  // Extract opening name from PGN headers
  const openingMatch = game.pgn.match(/\[Opening "([^"]+)"\]/);
  const ecoMatch = game.pgn.match(/\[ECO "([^"]+)"\]/);
  const opening = openingMatch
    ? openingMatch[1]
    : ecoMatch
      ? ecoMatch[1]
      : undefined;
  let gameResult: "win" | "loss" | "draw" = "draw";
  if (resultStr === "1-0") {
    gameResult = playerColor === "white" ? "win" : "loss";
  } else if (resultStr === "0-1") {
    gameResult = playerColor === "black" ? "win" : "loss";
  }

  try {
    chess.loadPgn(game.pgn);
  } catch {
    // Skip games that can't be parsed
    return blunders;
  }

  // Get all moves from the game
  const moves = chess.history({ verbose: true });

  // Reset to starting position
  chess.reset();

  let prevEval = 0;
  let moveNumber = 0;

  for (const move of moves) {
    moveNumber++;
    const isPlayerMove =
      (playerColor === "white" && moveNumber % 2 === 1) ||
      (playerColor === "black" && moveNumber % 2 === 0);

    // Get position before the move
    const fenBefore = chess.fen();

    // Make the move
    chess.move(move.san);

    if (!isPlayerMove) {
      // Update eval for opponent's move but don't check for blunders
      // After opponent's move, it's player's turn - score is from player's POV
      try {
        const result = await evaluatePosition(chess.fen(), ANALYSIS_DEPTH);
        prevEval = result.score;
      } catch {
        // Continue if evaluation fails
      }
      continue;
    }

    // Evaluate position after player's move
    // After player's move, it's opponent's turn - negate to get player's POV
    try {
      const result = await evaluatePosition(chess.fen(), ANALYSIS_DEPTH);
      const currentEval = -result.score;

      // Check for blunder (eval drop from player's perspective)
      const evalDrop = prevEval - currentEval;

      if (evalDrop >= BLUNDER_THRESHOLD) {
        // Get best move from position before the blunder
        const bestResult = await evaluatePosition(fenBefore, ANALYSIS_DEPTH);

        // Skip if Stockfish returned no valid best move (e.g. checkmate, timeout)
        const isValidMove =
          bestResult.bestMove &&
          bestResult.bestMove.length >= 4 &&
          bestResult.bestMove !== "(none)" &&
          bestResult.bestMove !== "timeout";
        if (!isValidMove) {
          prevEval = currentEval;
          continue;
        }

        // Parse best move UCI notation (e.g., "e2e4" -> from: "e2", to: "e4")
        const bestMoveFrom = bestResult.bestMove.slice(0, 2);
        const bestMoveTo = bestResult.bestMove.slice(2, 4);

        // Determine piece moved from SAN
        const pieceMoved = move.san.match(/^[KQRBN]/) ? move.san[0] : "P";

        // Check if move was a capture
        const wasCapture = move.san.includes("x");

        // Check if best move was a capture (has ENEMY piece on destination square)
        const tempChess = new Chess(fenBefore);
        const destSquare = bestMoveTo as import("chess.js").Square;
        const pieceOnDest = tempChess.get(destSquare);
        const playerColorChar = playerColor === "white" ? "w" : "b";
        const bestMoveWasCapture =
          pieceOnDest != null && pieceOnDest.color !== playerColorChar;

        // Determine game phase based on move number and material
        let gamePhase: "opening" | "middlegame" | "endgame" = "middlegame";
        const fullMoveNum = Math.ceil(moveNumber / 2);
        if (fullMoveNum <= 10) {
          gamePhase = "opening";
        } else if (fullMoveNum >= 40) {
          gamePhase = "endgame";
        }

        blunders.push({
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
          wasCapture,
          bestMoveWasCapture,
          gamePhase,
          opening,
        });
      }

      prevEval = currentEval;
    } catch {
      // Continue if evaluation fails
    }
  }

  return blunders;
}

export default App;
