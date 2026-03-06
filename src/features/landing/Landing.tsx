import { CtaSection } from "./components/CtaSection";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { SeeItInActionSection } from "./components/SeeItInActionSection";
import { WhoItsForSection } from "./components/WhoItsForSection";

export function LandingView() {
  return (
    <>
      {/* ─── HERO ─── */}
      <HeroSection />

      {/* ─── SECTION 1: HOW IT WORKS ─── */}
      <HowItWorksSection />

      {/* ─── SECTION 2: SEE IT IN ACTION ─── */}
      <SeeItInActionSection />

      {/* ─── SECTION 3: WHO IT'S FOR ─── */}
      <WhoItsForSection />

      {/* ─── FOOTER CTA ─── */}
      <CtaSection />
    </>
  );
}
