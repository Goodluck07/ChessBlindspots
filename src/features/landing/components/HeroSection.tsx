import { Button } from "../../../components/ui/Button";

export function HeroSection() {
  return (
    <section
      className="pt-25 px-5 pb-20 text-center border-b border-[#3d3a37] relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% -5%, rgba(129,182,76,0.2) 0%, rgba(129,182,76,0.07) 40%, transparent 70%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="inline-block bg-[rgba(129,182,76,0.12)] text-green-600 border border-[rgba(129,182,76,0.3)] rounded-full px-4 py-1 text-[13px] font-semibold tracking-wide uppercase mb-7">
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
          <Button as="a" href="/analyze">
            Analyze My Games
          </Button>
          <Button as="a-hash" href="#how-it-works" variant="secondary">
            See How It Works
          </Button>
        </div>

        <p className="mt-5 text-[13px] text-[#5d5c59]">
          Free · No account needed · Works with chess.com
        </p>
      </div>
    </section>
  );
}
