import { Button } from "../../../components/ui/Button";

export function NoPracticeData() {
  return (
    <section className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl px-5 md:px-10 py-16 text-center">
      <div className="text-6xl mb-5 opacity-50">🎯</div>
      <h1 className="text-white m-0 mb-4">No puzzles yet</h1>
      <p className="text-[#989795] m-0 mb-6 text-lg">
        Analyze your games first — your blunders become your personal puzzle set.
      </p>
      <Button as="a" href="/analyze">
        Analyze My Games
      </Button>
    </section>
  );
}
