# Chess Blindspots

**Chess Blindspots** is a free web app that finds the patterns in your worst chess mistakes — and then drills you on them until they're gone.

Most chess improvement tools show you that you blundered. Chess Blindspots shows you *why* you keep blundering in the same situations, and gives you a way to actually fix it.

![Status](https://img.shields.io/badge/status-live-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Stockfish](https://img.shields.io/badge/Stockfish-WASM-orange)

---

## The Problem

You play chess online. You lose. You check the analysis. "Blunder on move 22." You nod, close the tab, and make the same mistake next week.

The issue isn't that you don't know you blundered — it's that you don't know *what kind* of player you are when you blunder. Are you always missing captures? Hanging pieces in the endgame? Losing your Queen in the opening?

Chess Blindspots answers that question using your actual games.

---

## What It Does

### 1. Analyze
Enter your Chess.com username. The app fetches your recent games and runs every position through Stockfish (a grandmaster-level chess engine) — entirely in your browser, no server needed.

Any move where you lost 2+ pawns of evaluation is flagged as a blunder. You get:
- Your **5 worst blunders** with an interactive board showing what you played vs what Stockfish recommends
- A **by-game view** to see all blunders grouped per game
- A plain-English explanation of *why* the move was a mistake

### 2. Insights
After analysis, the Insights page breaks down your blunder patterns:

- **Stats** — total blunders, average evaluation loss, worst single drop
- **By game phase** — do you blunder more in the opening, middlegame, or endgame?
- **By piece moved** — which piece do you move just before a blunder?
- **By time control** — are you worse in bullet vs blitz vs rapid?
- **By result** — do you blunder more when winning or losing?
- **By move number** — which moves in the game are your danger zone?
- **Worst opening** — which opening leads to the most blunders for you?
- **Capture awareness** — how often do you miss free pieces?

### 3. Practice
Turn your blunders into drills. The Practice page presents your worst positions as puzzles — find the move Stockfish recommended.

- **Filter by difficulty and time control** to focus your training
- **Interactive board** — click or drag to make your move
- **Hint system** — highlight the piece to move, or reveal the full answer
- **Explanation after every puzzle** — not just "correct/wrong" but *why* the move was best
- **Retry queue** — missed puzzles resurface before the session ends
- **Streak counter** — tracks consecutive correct answers
- **Drill your misses** — after finishing, instantly re-drill only what you got wrong
- **Opening badge** — see which opening each position came from

---

## How It Works

```
Chess.com API → your recent games (PGN format)
      ↓
chess.js → parse moves, extract positions (FEN)
      ↓
Stockfish WASM → evaluate each position in-browser
      ↓
Compare: what you played vs what Stockfish recommends
      ↓
Flag positions where the difference is ≥ 200 centipawns (2 pawns)
      ↓
Analyze patterns → generate insights → create drill puzzles
```

Everything runs in your browser. No account needed. No data sent to any server.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Stockfish (WASM) | Chess engine — runs in-browser via WebAssembly |
| chess.js | Move validation, PGN parsing, FEN manipulation |
| react-chessboard | Interactive board component |
| Chess.com Public API | Fetching game history |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Goodluck07/ChessBlindspots.git
cd ChessBlindspots

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and enter any Chess.com username to try it.

```bash
# Production build
npm run build
```

Deploys as a static site — works on Vercel, Netlify, GitHub Pages, or any CDN.

---

## Project Structure

```
src/
├── features/
│   ├── analyze/          # Blunder detection UI (search, results, blunder cards)
│   ├── insights/         # Pattern analysis charts and stat cards
│   ├── practice/         # Drill session, puzzle board, session summary
│   └── landing/          # Homepage
├── services/
│   ├── chesscom.ts       # Chess.com API client
│   └── stockfish.ts      # Stockfish WASM wrapper
├── layouts/              # Dashboard and drill layout shells
├── pages/                # Route-level page components
├── types.ts              # Shared TypeScript types
└── App.tsx               # Analysis pipeline + state management
```

---

## Roadmap

- [x] Blunder detection with Stockfish
- [x] Time control and game phase filtering
- [x] By-game view
- [x] Insights — phase, piece, time control, move number, opening breakdowns
- [x] Practice mode with drill sessions
- [x] Drill explanations and resulting position display
- [x] Retry queue and "drill your misses"
- [ ] Persistent blunder history (no re-analysis needed on return)
- [ ] Difficulty ordering within drill sessions
- [ ] Mobile touch interaction improvements

---

## Contributing

Contributions welcome. Open an issue to discuss what you'd like to change, or submit a PR directly.

## License

MIT
