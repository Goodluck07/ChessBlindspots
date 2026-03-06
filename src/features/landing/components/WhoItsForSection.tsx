export function WhoItsForSection() {
  return (
    <section className="py-20 px-6 border-b border-[#3d3a37]">
      <div className="max-w-240 mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-bold text-white mb-3">
            Built for Players Who Want to Improve
          </h2>
          <p className="text-[#989795] text-lg m-0 max-w-125 mx-auto">
            Whether you're a casual weekend player or grinding to hit your next
            rating milestone.
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
              <div className="text-2xl text-green-600 mb-3 leading-none">"</div>
              <p className="text-[#bababa] text-sm italic leading-relaxed mb-4">
                {quote.slice(1, -1)}
              </p>
              <span className="text-xs text-[#5a5856] font-semibold uppercase tracking-wider">
                — {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
