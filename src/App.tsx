import { useState } from 'react';
import { Chess } from 'chess.js';
import { UsernameForm } from './components/UsernameForm';
import { BlunderCard } from './components/BlunderCard';
import { DemoBlunder } from './components/DemoBlunder';
import { BlunderSummary } from './components/BlunderSummary';
import { GameCard } from './components/GameCard';
import { Navigation } from './components/Navigation';
import { fetchRecentGames } from './services/chesscom';
import { evaluatePosition, destroyEngine } from './services/stockfish';
import type { Blunder, ChessGame, TimeClass } from './types';

type Page = 'analyze' | 'insights' | 'practice';

const BLUNDER_THRESHOLD = 200; // centipawns (2 pawns)
const MAX_BLUNDERS_TO_SHOW = 5;
const GAMES_TO_ANALYZE = 10;
const ANALYSIS_DEPTH = 12;

const TIME_CLASS_LABELS: Record<TimeClass | 'all', string> = {
  all: 'All Games',
  bullet: 'Bullet',
  blitz: 'Blitz',
  rapid: 'Rapid',
  daily: 'Daily',
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('analyze');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBlunders, setAllBlunders] = useState<Blunder[]>([]); // Store ALL blunders
  const [progress, setProgress] = useState('');
  const [gamesAnalyzed, setGamesAnalyzed] = useState(0);
  const [timeClassFilter, setTimeClassFilter] = useState<TimeClass | 'all'>('all');
  const [viewMode, setViewMode] = useState<'overall' | 'byGame'>('overall');

  // Filter blunders based on selected time class
  const filteredBlunders = timeClassFilter === 'all'
    ? allBlunders
    : allBlunders.filter(b => b.timeClass === timeClassFilter);

  // Take top 5 from filtered results (use spread to avoid mutating)
  const displayBlunders = [...filteredBlunders]
    .sort((a, b) => b.evalDrop - a.evalDrop)
    .slice(0, MAX_BLUNDERS_TO_SHOW);

  // Group blunders by game for "by game" view
  const blundersByGame = filteredBlunders.reduce((acc, blunder) => {
    const key = blunder.gameUrl;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(blunder);
    return acc;
  }, {} as Record<string, Blunder[]>);

  // Sort each game's blunders by move number
  Object.values(blundersByGame).forEach(gameBlunders => {
    gameBlunders.sort((a, b) => a.moveNumber - b.moveNumber);
  });

  const analyzeGames = async (username: string) => {
    setLoading(true);
    setError(null);
    setAllBlunders([]);
    setProgress('Fetching games...');
    setGamesAnalyzed(0);

    try {
      const allGames = await fetchRecentGames(username, GAMES_TO_ANALYZE * 2); // Fetch more to have enough after filtering
      const games = timeClassFilter === 'all'
        ? allGames.slice(0, GAMES_TO_ANALYZE)
        : allGames.filter(g => g.timeClass === timeClassFilter).slice(0, GAMES_TO_ANALYZE);

      if (games.length === 0) {
        setError(`No ${timeClassFilter === 'all' ? '' : timeClassFilter + ' '}games found.`);
        setLoading(false);
        return;
      }
      setProgress(`Found ${games.length} ${timeClassFilter === 'all' ? '' : timeClassFilter + ' '}games. Starting analysis...`);

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
        setProgress('No blunders found! You played well.');
      } else {
        setProgress(`Found ${allBlunders.length} blunders across ${games.length} games.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProgress('');
    } finally {
      setLoading(false);
      destroyEngine();
    }
  };

  return (
    <>
      {/* Sticky Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(39, 37, 34, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #3d3a37',
        padding: '12px 20px',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.4em',
            fontWeight: 600,
            color: '#ffffff',
          }}>
            Chess Blindspots
          </h1>
          <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px', minHeight: '100vh' }}>

      {/* Analyze Page */}
      {currentPage === 'analyze' && (
        <>
          {/* Search Section */}
      <section style={{
        backgroundColor: '#1e1c1a',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #3d3a37',
      }}>
        <UsernameForm onSubmit={analyzeGames} loading={loading} />

        {/* Time Control Filter */}
        <div style={{ marginTop: '20px' }}>
          <label style={{
            display: 'block',
            color: '#989795',
            fontSize: '0.85em',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Time Control
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(Object.keys(TIME_CLASS_LABELS) as (TimeClass | 'all')[]).map((tc) => (
              <button
                key={tc}
                onClick={() => setTimeClassFilter(tc)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: timeClassFilter === tc ? '#81b64c' : '#3d3a37',
                  color: timeClassFilter === tc ? '#1a1a1a' : '#bababa',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: timeClassFilter === tc ? 600 : 400,
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  fontSize: '0.9em',
                }}
              >
                {TIME_CLASS_LABELS[tc]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#3d2522',
          border: '1px solid #fa412d',
          borderRadius: '8px',
          color: '#fa412d',
          marginBottom: '24px',
          fontSize: '0.95em',
        }}>
          {error}
        </div>
      )}

      {/* Progress Indicator */}
      {progress && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#989795',
          marginBottom: '32px',
          padding: '20px',
          backgroundColor: '#1e1c1a',
          borderRadius: '8px',
          border: '1px solid #3d3a37',
        }}>
          {loading && (
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #3d3a37',
              borderTop: '3px solid #81b64c',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          )}
          <span style={{ fontSize: '1em' }}>
            {progress}
            {gamesAnalyzed > 0 && loading && (
              <span style={{ color: '#81b64c', marginLeft: '8px' }}>
                ({gamesAnalyzed}/{GAMES_TO_ANALYZE})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Demo Section */}
      {allBlunders.length === 0 && !error && !loading && (
        <DemoBlunder />
      )}

      {/* Results Section */}
      {filteredBlunders.length > 0 && (
        <section>
          {/* Results Header with Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '1.5em' }}>
              {viewMode === 'overall' ? 'Your Worst Blunders' : 'Blunders By Game'}
              {timeClassFilter !== 'all' && (
                <span style={{
                  fontSize: '0.5em',
                  color: '#81b64c',
                  marginLeft: '12px',
                  textTransform: 'capitalize',
                  fontWeight: 400,
                }}>
                  {timeClassFilter} only
                </span>
              )}
            </h2>

            {/* View Toggle */}
            <div style={{
              display: 'flex',
              backgroundColor: '#272522',
              borderRadius: '8px',
              padding: '4px',
              border: '1px solid #3d3a37',
            }}>
              <button
                onClick={() => setViewMode('overall')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'overall' ? '#81b64c' : 'transparent',
                  color: viewMode === 'overall' ? '#1a1a1a' : '#bababa',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'overall' ? 600 : 400,
                  fontSize: '0.85em',
                  transition: 'all 0.2s ease',
                }}
              >
                Top 5
              </button>
              <button
                onClick={() => setViewMode('byGame')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'byGame' ? '#81b64c' : 'transparent',
                  color: viewMode === 'byGame' ? '#1a1a1a' : '#bababa',
                  cursor: 'pointer',
                  fontWeight: viewMode === 'byGame' ? 600 : 400,
                  fontSize: '0.85em',
                  transition: 'all 0.2s ease',
                }}
              >
                By Game
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '28px',
            padding: '16px 20px',
            backgroundColor: '#1e1c1a',
            borderRadius: '8px',
            border: '1px solid #3d3a37',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ color: '#989795', fontSize: '0.75em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Blunders
              </div>
              <div style={{ color: '#fa412d', fontSize: '1.4em', fontWeight: 600 }}>
                {filteredBlunders.length}
              </div>
            </div>
            <div>
              <div style={{ color: '#989795', fontSize: '0.75em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Games With Blunders
              </div>
              <div style={{ color: '#bababa', fontSize: '1.4em', fontWeight: 600 }}>
                {Object.keys(blundersByGame).length}
              </div>
            </div>
            <div>
              <div style={{ color: '#989795', fontSize: '0.75em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Worst Drop
              </div>
              <div style={{ color: '#fa412d', fontSize: '1.4em', fontWeight: 600 }}>
                {Math.abs(filteredBlunders[0]?.evalDrop / 100 || 0).toFixed(1)} pawns
              </div>
            </div>
          </div>

          {/* Blunder Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {viewMode === 'overall' ? (
              <>
                {displayBlunders.map((blunder) => (
                  <BlunderCard key={`${blunder.gameUrl}-${blunder.moveNumber}`} blunder={blunder} />
                ))}
              </>
            ) : (
              <>
                {Object.entries(blundersByGame).map(([gameUrl, gameBlunders]) => (
                  <GameCard key={gameUrl} gameUrl={gameUrl} blunders={gameBlunders} />
                ))}
              </>
            )}
          </div>

          {/* Summary */}
          <div style={{ marginTop: '32px' }}>
            <BlunderSummary blunders={viewMode === 'overall' ? displayBlunders : filteredBlunders} />
          </div>
        </section>
      )}

      {/* No Results for Filter */}
      {allBlunders.length > 0 && filteredBlunders.length === 0 && (
        <div style={{
          padding: '40px 20px',
          backgroundColor: '#1e1c1a',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#989795',
          border: '1px solid #3d3a37',
        }}>
          <p style={{ fontSize: '1.1em', margin: 0 }}>
            No blunders found in <span style={{ color: '#81b64c', textTransform: 'capitalize' }}>{timeClassFilter}</span> games.
          </p>
          <p style={{ fontSize: '0.9em', marginTop: '8px', marginBottom: 0 }}>
            Try selecting a different time control.
          </p>
        </div>
      )}
        </>
      )}

      {/* Insights Page - Coming Soon */}
      {currentPage === 'insights' && (
        <div style={{
          backgroundColor: '#1e1c1a',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #3d3a37',
        }}>
          <div style={{
            fontSize: '4em',
            marginBottom: '20px',
            opacity: 0.6,
          }}>
            📊
          </div>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '1.8em' }}>
            Insights Coming Soon
          </h2>
          <p style={{ color: '#989795', fontSize: '1.1em', maxWidth: '500px', margin: '0 auto 24px' }}>
            Deep analysis of your playing patterns, weaknesses by piece type,
            game phase statistics, and personalized improvement recommendations.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {['Heatmaps', 'Phase Analysis', 'Piece Patterns', 'Time Pressure'].map((feature) => (
              <span key={feature} style={{
                padding: '8px 16px',
                backgroundColor: '#272522',
                borderRadius: '20px',
                fontSize: '0.9em',
                color: '#81b64c',
                border: '1px solid #3d3a37',
              }}>
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Practice Page - Coming Soon */}
      {currentPage === 'practice' && (
        <div style={{
          backgroundColor: '#1e1c1a',
          borderRadius: '12px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '1px solid #3d3a37',
        }}>
          <div style={{
            fontSize: '4em',
            marginBottom: '20px',
            opacity: 0.6,
          }}>
            🎯
          </div>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '1.8em' }}>
            Practice Mode Coming Soon
          </h2>
          <p style={{ color: '#989795', fontSize: '1.1em', maxWidth: '500px', margin: '0 auto 24px' }}>
            Train on positions where you've blundered before.
            Fix your blindspots with targeted puzzles from your own games.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {['Your Blunders', 'Spaced Repetition', 'Focus Mode', 'Progress Tracking'].map((feature) => (
              <span key={feature} style={{
                padding: '8px 16px',
                backgroundColor: '#272522',
                borderRadius: '20px',
                fontSize: '0.9em',
                color: '#81b64c',
                border: '1px solid #3d3a37',
              }}>
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid #3d3a37',
        marginTop: '40px',
        color: '#989795',
        fontSize: '0.85em',
      }}>
        <a
          href="https://github.com/Goodluck07/ChessBlindspots"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#81b64c',
            textDecoration: 'none',
          }}
        >
          View on GitHub
        </a>
        <span style={{ margin: '0 12px' }}>|</span>
        <span>Built with Stockfish + React</span>
      </footer>
    </>
  );
}

async function analyzeGame(game: ChessGame, username: string): Promise<Blunder[]> {
  const blunders: Blunder[] = [];
  const chess = new Chess();

  // Determine which color the user played
  const playerColor: 'white' | 'black' =
    game.white.toLowerCase() === username.toLowerCase() ? 'white' : 'black';

  // Get opponent name
  const opponent = playerColor === 'white' ? game.black : game.white;

  // Parse game result from PGN
  const resultMatch = game.pgn.match(/\[Result "([^"]+)"\]/);
  const resultStr = resultMatch ? resultMatch[1] : '*';
  let gameResult: 'win' | 'loss' | 'draw' = 'draw';
  if (resultStr === '1-0') {
    gameResult = playerColor === 'white' ? 'win' : 'loss';
  } else if (resultStr === '0-1') {
    gameResult = playerColor === 'black' ? 'win' : 'loss';
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
      (playerColor === 'white' && moveNumber % 2 === 1) ||
      (playerColor === 'black' && moveNumber % 2 === 0);

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

        // Parse best move UCI notation (e.g., "e2e4" -> from: "e2", to: "e4")
        const bestMoveFrom = bestResult.bestMove.slice(0, 2);
        const bestMoveTo = bestResult.bestMove.slice(2, 4);

        // Determine piece moved from SAN
        const pieceMoved = move.san.match(/^[KQRBN]/) ? move.san[0] : 'P';

        // Check if move was a capture
        const wasCapture = move.san.includes('x');

        // Check if best move was a capture (has piece on destination square)
        const tempChess = new Chess(fenBefore);
        const destSquare = bestMoveTo as import('chess.js').Square;
        const bestMoveWasCapture = tempChess.get(destSquare) !== null;

        // Determine game phase based on move number and material
        let gamePhase: 'opening' | 'middlegame' | 'endgame' = 'middlegame';
        const fullMoveNum = Math.ceil(moveNumber / 2);
        if (fullMoveNum <= 10) {
          gamePhase = 'opening';
        } else if (fullMoveNum >= 40) {
          gamePhase = 'endgame';
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
