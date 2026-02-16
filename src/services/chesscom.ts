import type { ChessGame, TimeClass } from '../types';

interface ChessComGame {
  pgn: string;
  white: { username: string };
  black: { username: string };
  url: string;
  time_class: string;
}

interface ChessComGamesResponse {
  games: ChessComGame[];
}

export async function fetchRecentGames(username: string, limit: number = 20): Promise<ChessGame[]> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const url = `https://api.chess.com/pub/player/${username.toLowerCase()}/games/${year}/${month}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Player "${username}" not found on chess.com`);
    }
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  const data: ChessComGamesResponse = await response.json();

  if (!data.games || data.games.length === 0) {
    // Try previous month if current month has no games
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYear = now.getMonth() === 0 ? year - 1 : year;
    const prevMonthStr = String(prevMonth).padStart(2, '0');

    const prevUrl = `https://api.chess.com/pub/player/${username.toLowerCase()}/games/${prevYear}/${prevMonthStr}`;
    const prevResponse = await fetch(prevUrl);

    if (prevResponse.ok) {
      const prevData: ChessComGamesResponse = await prevResponse.json();
      if (prevData.games && prevData.games.length > 0) {
        return prevData.games.slice(-limit).map(mapGame);
      }
    }

    throw new Error(`No recent games found for "${username}"`);
  }

  return data.games.slice(-limit).map(mapGame);
}

function mapGame(game: ChessComGame): ChessGame {
  return {
    pgn: game.pgn,
    white: game.white.username,
    black: game.black.username,
    url: game.url,
    timeClass: (game.time_class as TimeClass) || 'rapid',
  };
}
