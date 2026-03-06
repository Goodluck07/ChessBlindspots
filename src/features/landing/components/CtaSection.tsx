import { Button } from "../../../components/ui/Button";

export function CtaSection() {
  return (
    <section className="py-20 px-5 text-center bg-linear-to-b from-transparent to-[rgba(129,182,76,0.05)]">
      <div className="max-w-xl mx-auto">
        <h2 className="font-bold text-white mb-3">
          Ready to Find Your Blindspots?
        </h2>
        <p className="text-[#989795] text-lg mb-9">
          It takes 30 seconds. Enter your username and see exactly where your
          games fall apart.
        </p>
        <Button as="a" href="/analyze">
          Analyze My Games — It's Free
        </Button>
      </div>
    </section>
  );
}
