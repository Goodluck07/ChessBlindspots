export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 px-5 border-b border-[#3d3a37]">
      <div className="max-w-240 mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-bold text-white mb-3">How It Works</h2>
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
                <div className="w-11 h-11 rounded-[10px] bg-[rgba(129,182,76,0.12)] border border-[rgba(129,182,76,0.25)] flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <span className="text-[#5a5856] text-xs font-bold tracking-[1px]">
                  STEP {step}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2.5">
                {title}
              </h3>
              <p className="text-[#989795] text-sm leading-relaxed m-0">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
