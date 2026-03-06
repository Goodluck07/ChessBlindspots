import { DashboardLayout } from "../layouts/DashboardLayout";

export function PracticePage() {
  return (
    <DashboardLayout>
      <section className="bg-[#1e1c1a] rounded-xl px-5 md:px-10 py-16 text-center border border-[#3d3a37]">
        <div className="text-6xl mb-5 opacity-60">🎯</div>
        <h1 className="m-0 mb-4 text-white">Practice Mode</h1>
        <p className="text-[#989795] text-lg max-w-125 mx-auto mb-6">
          Train on positions where you've blundered before. Fix your blindspots
          with targeted puzzles from your own games.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <span className="bg-[#3d3a37] text-[#989795] px-6 py-3 rounded-lg font-semibold">
            Coming Soon
          </span>
          {/* {[
              "Your Blunders",
              "Spaced Repetition",
              "Focus Mode",
              "Progress Tracking",
            ].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-[#272522] rounded-full text-sm text-green-600 border border-[#3d3a37]"
              >
                {feature}
              </span>
            ))} */}
        </div>
      </section>
    </DashboardLayout>
  );
}
