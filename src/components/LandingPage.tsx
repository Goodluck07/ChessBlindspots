import { DemoBlunder } from "./DemoBlunder";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="font-sans text-[#bababa]">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[rgba(39,37,34,0.96)] backdrop-blur-md border-b border-[#3d3a37] py-3 px-6">
        <div className="max-w-240 mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-green-400 to-green-700 flex items-center justify-center text-lg shadow-md">
              &#9816;
            </div>
            <span className="font-bold text-xl text-white">
              Chess Blindspots
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="landing-nav-link text-[#989795] text-sm hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="landing-nav-link text-[#989795] text-sm hover:text-white transition-colors"
            >
              Features
            </a>
            <button
              onClick={onGetStarted}
              className="bg-green-600 text-black rounded-lg py-2 px-4 font-bold text-sm hover:bg-green-500 transition-colors cursor-pointer"
            >
              Try It Free
            </button>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="py-25 px-6 pb-20 text-center bg-linear-to-b from-[rgba(129,182,76,0.06)] to-transparent border-b border-[#3d3a37]">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-[rgba(129,182,76,0.12)] text-green-600 border border-[rgba(129,182,76,0.3)] rounded-full px-4 py-1 text-[0.82em] font-semibold tracking-wide uppercase mb-7">
            Powered by Stockfish
          </div>

          <h1 className="text-white font-extrabold leading-tight mb-6 text-[clamp(2em,5vw,3.4em)] tracking-[-0.5px]">
            Stop Repeating the{" "}
            <span className="text-green-600">Same Mistakes</span>
          </h1>

          <p className="text-[#989795] text-lg leading-relaxed mb-10 max-w-140 mx-auto">
            Chess Blindspots analyzes your recent games, finds your worst
            blunders, and shows you exactly what you should have played instead.
          </p>

          <div className="flex gap-3.5 justify-center flex-wrap">
            <button
              onClick={onGetStarted}
              className="bg-green-600 text-black rounded-md py-3 px-8 font-bold text-lg shadow-lg transform transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
            >
              Analyze My Games
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-[#bababa] border border-[#3d3a37] rounded-md py-3 px-7 font-medium text-lg hover:border-green-600 transition-colors"
            >
              See How It Works
            </a>
          </div>

          <p className="mt-5 text-[0.82em] text-[#5a5856]">
            Free · No account needed · Works with chess.com
          </p>
        </div>
      </section>

      {/* ─── SECTION 1: HOW IT WORKS ─── */}
      <section
        id="how-it-works"
        className="py-20 px-6 border-b border-[#3d3a37]"
      >
        <div className="max-w-240 mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-[#989795] text-lg mb-0">
              Three steps to finding your blindspots
            </p>
          </div>

          <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {[
              {
                step: "01",
                icon: "♟",
                title: "Enter Your Username",
                description:
                  "Type in your Chess.com username. No login or API key required.",
              },
              {
                step: "02",
                icon: "⚙",
                title: "We Analyze Your Games",
                description:
                  "Stockfish evaluates your last 10 games move-by-move, flagging any moment where you dropped 2+ pawns of evaluation.",
              },
              {
                step: "03",
                icon: "♛",
                title: "See Your Worst Blunders",
                description:
                  "Your top mistakes appear as interactive boards showing what you played vs. what you should have played.",
              },
            ].map(({ step, icon, title, description }) => (
              <div
                key={step}
                className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl px-6 py-7"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-[10px] bg-[rgba(129,182,76,0.12)] border border-[rgba(129,182,76,0.25)] flex items-center justify-center text-[22px]">
                    {icon}
                  </div>
                  <span className="text-[#5a5856] text-[0.75em] font-bold tracking-[1px]">
                    STEP {step}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-[1.1em] mb-2.5">
                  {title}
                </h3>
                <p className="text-[#989795] text-[0.95em] leading-relaxed m-0">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SEE IT IN ACTION ─── */}
      <section
        id="features"
        className="py-20 px-6 border-b border-[#3d3a37] bg-[rgba(0,0,0,0.15)]"
      >
        <div className="max-w-240 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              See It In Action
            </h2>
            <p className="text-[#989795] text-[1.05em] m-0">
              An interactive example — toggle between the mistake and the best
              move
            </p>
          </div>
          <DemoBlunder />
        </div>
      </section>

      {/* ─── SECTION 3: WHO IT'S FOR ─── */}
      <section className="py-20 px-6 border-b border-[#3d3a37]">
        <div className="max-w-240 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">
              Built for Players Who Want to Improve
            </h2>
            <p className="text-[#989795] text-[1.05em] m-0 max-w-125 mx-auto">
              Whether you're a casual weekend player or grinding to hit your
              next rating milestone.
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            {[
              {
                quote:
                  '"I kept hanging the same piece in the endgame and had no idea. This showed me the pattern immediately."',
                label: "Club Player, 1100 Elo",
              },
              {
                quote:
                  '"Filter by blitz games only? Yes please. My rapid blunders are totally different from my bullet mistakes."',
                label: "Blitz Enthusiast, 1450 Elo",
              },
              {
                quote:
                  '"Free, no sign-up, just paste your username and go. Exactly what I needed."',
                label: "Casual Player",
              },
            ].map(({ quote, label }) => (
              <div
                key={label}
                className="bg-[#1e1c1a] border border-[#3d3a37] rounded-lg p-6"
              >
                <div className="text-2xl text-green-600 mb-3 leading-none">
                  "
                </div>
                <p className="text-[#bababa] text-sm italic leading-relaxed mb-4">
                  {quote.slice(1, -1)}
                </p>
                <span className="text-[0.78em] text-[#5a5856] font-semibold uppercase tracking-wider">
                  — {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="py-20 px-6 text-center bg-linear-to-b from-transparent to-[rgba(129,182,76,0.05)]">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Find Your Blindspots?
          </h2>
          <p className="text-[#989795] text-lg mb-9">
            It takes 30 seconds. Enter your username and see exactly where your
            games fall apart.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-green-600 text-black rounded-lg py-4 px-10 font-bold text-xl shadow-lg transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer"
          >
            Analyze My Games — It's Free
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="text-center py-6 border-t border-[#3d3a37] text-[#5a5856] text-[0.85em] flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1 text-white font-semibold">
          &#9816; Chess Blindspots
        </span>
        <span className="text-[#3d3a37]">|</span>
        <span>Built with Stockfish + React</span>
        <span className="text-[#3d3a37]">|</span>
        <a
          href="https://github.com/Goodluck07/ChessBlindspots"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
