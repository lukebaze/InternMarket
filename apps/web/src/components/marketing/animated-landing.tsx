"use client";

import { HeroSection } from "./hero-section";
import { ProblemSection } from "./problem-section";
import { BuyersSection } from "./buyers-section";
import { CreatorsSection } from "./creators-section";
import { SecuritySection } from "./security-section";
import { SocialProofSection } from "./social-proof-section";

export function AnimatedLanding() {
  return (
    <div className="flex flex-col overflow-hidden">
      <HeroSection />
      <ProblemSection />
      <BuyersSection />
      <CreatorsSection />
      <SecuritySection />
      <SocialProofSection />
    </div>
  );
}
