export type TimeClass = 'bullet' | 'blitz' | 'rapid' | 'daily';

export interface ChessGame {
  pgn: string;
  white: string;
  black: string;
  url: string;
  timeClass: TimeClass;
}

export interface Blunder {
  fen: string;
  movePlayed: string;
  moveFrom: string;
  moveTo: string;
  bestMove: string;
  bestMoveFrom: string;
  bestMoveTo: string;
  evalBefore: number;
  evalAfter: number;
  evalDrop: number;
  moveNumber: number;
  playerColor: 'white' | 'black';
  gameUrl: string;
  opponent: string;
  gameResult: 'win' | 'loss' | 'draw';
  timeClass: TimeClass;
  // For detailed analysis
  pieceMoved: string; // K, Q, R, B, N, or P for pawn
  wasCapture: boolean;
  bestMoveWasCapture: boolean;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
}

export interface AnalysisResult {
  blunders: Blunder[];
  gamesAnalyzed: number;
}
