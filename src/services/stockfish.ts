type MessageHandler = (message: string) => void;

class StockfishEngine {
  private worker: Worker | null = null;
  private messageHandlers: MessageHandler[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady: (() => void) | null = null;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
  }

  async init(): Promise<void> {
    if (this.worker) return;

    // Use local stockfish.js file
    this.worker = new Worker('/stockfish.js');

    this.worker.onmessage = (e) => {
      const message = e.data;
      if (message === 'uciok') {
        this.ready = true;
        this.resolveReady?.();
      }
      this.messageHandlers.forEach((handler) => handler(message));
    };

    this.worker.postMessage('uci');
    await this.readyPromise;
  }

  private send(command: string): void {
    this.worker?.postMessage(command);
  }

  async evaluate(fen: string, depth: number = 12): Promise<{ score: number; bestMove: string }> {
    if (!this.ready) {
      await this.init();
    }

    return new Promise((resolve) => {
      let bestMove = '';
      let score = 0;
      let resolved = false;

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
          resolve({ score, bestMove: bestMove || 'timeout' });
        }
      }, 10000);

      const handler = (message: string) => {
        // Parse score from info string
        if (message.startsWith('info') && message.includes('score')) {
          const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
          if (scoreMatch) {
            if (scoreMatch[1] === 'cp') {
              score = parseInt(scoreMatch[2], 10);
            } else {
              // Mate score: convert to high value
              const mateIn = parseInt(scoreMatch[2], 10);
              score = mateIn > 0 ? 10000 - mateIn : -10000 - mateIn;
            }
          }
        }

        // Parse best move
        if (message.startsWith('bestmove')) {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);

          const moveMatch = message.match(/bestmove (\S+)/);
          if (moveMatch) {
            bestMove = moveMatch[1];
          }

          // Remove this handler and resolve
          this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
          resolve({ score, bestMove });
        }
      };

      this.messageHandlers.push(handler);
      this.send('position fen ' + fen);
      this.send('go depth ' + depth);
    });
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.messageHandlers = [];
  }
}

// Singleton instance
let engineInstance: StockfishEngine | null = null;

export function getEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
  }
  return engineInstance;
}

export async function evaluatePosition(
  fen: string,
  depth: number = 12
): Promise<{ score: number; bestMove: string }> {
  const engine = getEngine();
  return engine.evaluate(fen, depth);
}

export function destroyEngine(): void {
  engineInstance?.destroy();
  engineInstance = null;
}
