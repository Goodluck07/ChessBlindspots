import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="text-center py-6 px-5 border-t border-[#3d3a37] text-[#989795] text-[13px] flex items-center justify-center gap-x-4 gap-y-3 flex-wrap">
      <span className="text-white font-semibold">&#9816; Chess Blindspots</span>
      <span>|</span>
      <span>Built with Stockfish + React</span>
      <span>|</span>
      <Link
        to="https://github.com/Goodluck07/ChessBlindspots"
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-600 hover:underline"
      >
        View on GitHub
      </Link>
    </footer>
  );
}
