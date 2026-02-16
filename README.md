# Chess Blindspots

An AI-powered chess coach that analyzes your chess.com games and identifies your worst tactical blunders using Stockfish.

![Chess Blindspots Demo](https://img.shields.io/badge/status-live-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Stockfish](https://img.shields.io/badge/Stockfish-WASM-orange)

## Features

- **Blunder Detection** - Analyzes your recent games and finds moves where you lost 2+ pawns of evaluation
- **Time Control Filter** - Focus on bullet, blitz, rapid, or daily games
- **Interactive Board** - Toggle between your move and the best move to see what you missed
- **Pattern Analysis** - Identifies recurring weaknesses (piece types, game phases, missed captures)
- **View Modes** - See your worst 5 blunders overall or browse by game

## How It Works

1. Enter your chess.com username
2. The app fetches your 10 most recent games
3. Stockfish (running in your browser via WebAssembly) evaluates each position
4. Positions where your move cost 200+ centipawns are flagged as blunders
5. You get actionable insights on your playing patterns

## Tech Stack

- **React 18** + TypeScript
- **Vite** for fast development and builds
- **Stockfish WASM** - Chess engine running entirely in-browser
- **chess.js** - Move validation and PGN parsing
- **react-chessboard** - Interactive board visualization
- **chess.com Public API** - Game fetching

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Goodluck07/ChessBlindspots.git
cd ChessBlindspots

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## Deployment

This app is designed to be deployed on Vercel, Netlify, or any static hosting:

```bash
# Deploy to Vercel
npx vercel
```

## Project Structure

```
src/
├── components/
│   ├── BlunderCard.tsx      # Individual blunder display with board
│   ├── BlunderSummary.tsx   # Pattern analysis and insights
│   ├── DemoBlunder.tsx      # Example blunder for new users
│   ├── GameCard.tsx         # Collapsible game view
│   ├── Navigation.tsx       # Page navigation
│   └── UsernameForm.tsx     # Username input
├── services/
│   ├── chesscom.ts          # Chess.com API integration
│   └── stockfish.ts         # Stockfish WASM wrapper
├── types.ts                 # TypeScript interfaces
├── App.tsx                  # Main application
└── index.css                # Global styles
```

## Roadmap

- [x] Core blunder detection
- [x] Time control filtering
- [x] Pattern analysis
- [x] By-game view
- [ ] **Insights Page** - Heatmaps, phase analysis, piece patterns
- [ ] **Practice Mode** - Train on your own blunders with spaced repetition

## Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## License

MIT

---

Built with Claude Code
