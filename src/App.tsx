import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { UsernameForm } from "./components/UsernameForm";
import { BlunderCard } from "./components/BlunderCard";
import { DemoBlunder } from "./components/DemoBlunder";
import { BlunderSummary } from "./components/BlunderSummary";
import { GameCard } from "./components/GameCard";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { InsightsPage } from "./components/InsightsPage";
import { fetchRecentGames } from "./services/chesscom";
import { evaluatePosition, destroyEngine } from "./services/stockfish";
import type { Blunder, ChessGame, TimeClass } from "./types";

type Page = "analyze" | "insights" | "practice";

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

const TIME_CLASS_LABELS: Record<TimeClass | "all", string> = {
  all: "All Games",
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rapid",
  daily: "Daily",
};

const APP_PAGES: Page[] = ["analyze", "insights", "practice"];

function getHashPage(): Page | null {
  const h = window.location.hash.slice(1) as Page;
  return APP_PAGES.includes(h) ? h : null;
}

function App() {
  const [showLanding, setShowLanding] = useState<boolean>(
    () => getHashPage() === null,
  );
  const [currentPage, setCurrentPage] = useState<Page>(
    () => getHashPage() ?? "analyze",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBlunders, setAllBlunders] = useState<Blunder[]>([]);
  const [progress, setProgress] = useState("");
  const [gamesAnalyzed, setGamesAnalyzed] = useState(0);
  const [timeClassFilter, setTimeClassFilter] = useState<TimeClass | "all">(
    "all",
  );
  const [viewMode, setViewMode] = useState<"overall" | "byGame">("overall");

  // Sync hash → state when user hits back/forward
  useEffect(() => {
    const onHashChange = () => {
      const page = getHashPage();
      if (page) {
        setShowLanding(false);
        setCurrentPage(page);
      } else setShowLanding(true);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Navigate within app and keep hash in sync
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  const enterApp = () => {
    setShowLanding(false);
    window.location.hash = "analyze";
    window.scrollTo(0, 0);
  };

  const goToLanding = () => {
    setShowLanding(true);
    window.location.hash = "";
    window.scrollTo(0, 0);
  };

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

  if (showLanding) {
    return <LandingPage onGetStarted={enterApp} />;
  }

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-linear-to-b from-[rgba(39,37,34,0.98)] to-[rgba(39,37,34,0.95)] backdrop-blur-md border-b border-[#3d3a37] py-3 px-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div
            onClick={goToLanding}
            className="flex items-center gap-2.5 cursor-pointer"
            title="Back to home"
          >
            <div className="w-8 h-8 bg-linear-to-br from-green-400 to-green-700 rounded-lg flex items-center justify-center text-lg shadow-md">
              &#9816;
            </div>
            <h1 className="m-0 text-xl font-bold text-white tracking-tight">
              Chess Blindspots
            </h1>
          </div>
          <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8 min-h-screen">
        {/* Analyze Page */}
        {currentPage === "analyze" && (
          <>
            {/* Search Section */}
            <section className="bg-[#1e1c1a] rounded-xl p-6 mb-8 border border-[#3d3a37]">
              <UsernameForm onSubmit={analyzeGames} loading={loading} />

              {/* Time Control Filter */}
              <div className="mt-5">
                <label className="block text-[#989795] text-[0.85em] mb-2 uppercase tracking-wide">
                  Time Control
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(
                    Object.keys(TIME_CLASS_LABELS) as (TimeClass | "all")[]
                  ).map((tc) => (
                    <button
                      key={tc}
                      onClick={() => setTimeClassFilter(tc)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-full text-[0.9em] transition-all duration-200 cursor-pointer ${
                        timeClassFilter === tc
                          ? "bg-green-600 text-black font-semibold"
                          : "bg-[#3d3a37] text-[#bababa]"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {TIME_CLASS_LABELS[tc]}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#3d2522] border border-red-500 rounded-lg text-red-500 mb-6 text-[0.95em]">
                {error}
              </div>
            )}

            {/* Progress Indicator */}
            {progress && (
              <div className="flex items-center justify-center gap-3 text-[#989795] mb-8 p-5 bg-[#1e1c1a] rounded-lg border border-[#3d3a37]">
                {loading && (
                  <div className="w-6 h-6 border-3 border-[#3d3a37] border-t-3 border-t-green-600 rounded-full animate-spin" />
                )}
                <span className="text-base">
                  {progress}
                  {gamesAnalyzed > 0 && loading && (
                    <span className="text-green-600 ml-2">
                      ({gamesAnalyzed}/{GAMES_TO_ANALYZE})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Demo Section */}
            {allBlunders.length === 0 && !error && !loading && <DemoBlunder />}

            {/* Results Section */}
            {filteredBlunders.length > 0 && (
              <section>
                {/* Results Header with Controls */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                  <h2 className="m-0 text-2xl">
                    {viewMode === "overall"
                      ? "Your Worst Blunders"
                      : "Blunders By Game"}
                    {timeClassFilter !== "all" && (
                      <span className="text-[0.5em] text-green-600 ml-3 capitalize font-normal">
                        {timeClassFilter} only
                      </span>
                    )}
                  </h2>

                  {/* View Toggle */}
                  <div className="flex bg-[#272522] rounded-lg p-1 border border-[#3d3a37]">
                    <button
                      onClick={() => setViewMode("overall")}
                      className={`px-4 py-2 rounded-md text-[0.85em] transition-all duration-200 ${
                        viewMode === "overall"
                          ? "bg-green-600 text-black font-semibold"
                          : "text-[#bababa]"
                      }`}
                    >
                      Top 5
                    </button>
                    <button
                      onClick={() => setViewMode("byGame")}
                      className={`px-4 py-2 rounded-md text-[0.85em] transition-all duration-200 ${
                        viewMode === "byGame"
                          ? "bg-green-600 text-black font-semibold"
                          : "text-[#bababa]"
                      }`}
                    >
                      By Game
                    </button>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] mb-7">
                  <div className="p-4 bg-[#1e1c1a] rounded-lg border border-[#3d3a37] border-l-4 border-l-red-500">
                    <div className="text-[#989795] text-[0.7em] uppercase tracking-wide mb-1 font-medium">
                      Total Blunders
                    </div>
                    <div className="text-red-500 text-[1.8em] font-bold leading-none">
                      {filteredBlunders.length}
                    </div>
                  </div>
                  <div className="p-4 bg-[#1e1c1a] rounded-lg border border-[#3d3a37] border-l-4 border-l-green-600">
                    <div className="text-[#989795] text-[0.7em] uppercase tracking-wide mb-1 font-medium">
                      Games Analyzed
                    </div>
                    <div className="text-green-600 text-[1.8em] font-bold leading-none">
                      {gamesAnalyzed}
                    </div>
                  </div>
                  <div className="p-4 bg-[#1e1c1a] rounded-lg border border-[#3d3a37] border-l-4 border-l-yellow-500">
                    <div className="text-[#989795] text-[0.7em] uppercase tracking-wide mb-1 font-medium">
                      Worst Drop
                    </div>
                    <div className="text-yellow-500 text-[1.8em] font-bold leading-none">
                      {Math.abs(
                        filteredBlunders[0]?.evalDrop / 100 || 0,
                      ).toFixed(1)}
                      <span className="text-[0.5em] font-medium ml-1 text-[#989795]">
                        pawns
                      </span>
                    </div>
                  </div>
                </div>

                {/* Blunder Cards */}
                <div className="flex flex-col gap-4">
                  {viewMode === "overall" ? (
                    <>
                      {displayBlunders.map((blunder) => (
                        <BlunderCard
                          key={`${blunder.gameUrl}-${blunder.moveNumber}`}
                          blunder={blunder}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {Object.entries(blundersByGame).map(
                        ([gameUrl, gameBlunders]) => (
                          <GameCard
                            key={gameUrl}
                            gameUrl={gameUrl}
                            blunders={gameBlunders}
                          />
                        ),
                      )}
                    </>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-8">
                  <BlunderSummary
                    blunders={
                      viewMode === "overall"
                        ? displayBlunders
                        : filteredBlunders
                    }
                  />
                </div>
              </section>
            )}

            {/* No Results for Filter */}
            {allBlunders.length > 0 && filteredBlunders.length === 0 && (
              <div className="p-10 bg-[#1e1c1a] rounded-xl text-center text-[#989795] border border-[#3d3a37]">
                <p className="text-lg m-0">
                  No blunders found in{" "}
                  <span className="text-green-600 capitalize">
                    {timeClassFilter}
                  </span>{" "}
                  games.
                </p>
                <p className="text-sm mt-2 mb-0">
                  Try selecting a different time control.
                </p>
              </div>
            )}
          </>
        )}

        {/* Insights Page */}
        {currentPage === "insights" && (
          <InsightsPage
            blunders={filteredBlunders}
            gamesAnalyzed={gamesAnalyzed}
            onGoAnalyze={() => navigateTo("analyze")}
            onViewWorstBlunder={() => navigateTo("analyze")}
            cachedAnalyses={getAllCached()}
            onLoadCache={restoreFromCache}
          />
        )}

        {/* Practice Page - Coming Soon */}
        {currentPage === "practice" && (
          <div className="bg-[#1e1c1a] rounded-xl px-10 py-16 text-center border border-[#3d3a37]">
            <div className="text-4xl mb-5 opacity-60">🎯</div>
            <h2 className="m-0 mb-4 text-white text-[1.8em]">
              Practice Mode Coming Soon
            </h2>
            <p className="text-[#989795] text-[1.1em] max-w-125 mx-auto mb-6">
              Train on positions where you've blundered before. Fix your
              blindspots with targeted puzzles from your own games.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                "Your Blunders",
                "Spaced Repetition",
                "Focus Mode",
                "Progress Tracking",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 bg-[#272522] rounded-full text-[0.9em] text-green-600 border border-[#3d3a37]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[#3d3a37] mt-10 text-[#989795] text-[0.85em]">
        <a
          href="https://github.com/Goodluck07/ChessBlindspots"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          View on GitHub
        </a>
        <span className="mx-3">|</span>
        <span>Built with Stockfish + React</span>
      </footer>
    </>
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
