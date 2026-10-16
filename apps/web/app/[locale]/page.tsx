import React from "react";
import MastheadTracker from "@/components/dashboard/MastheadTracker";
import StatsBand from "@/components/dashboard/StatsBand";
import CategoryNav from "@/components/dashboard/CategoryNav";
import KeyPromisesGrid from "@/components/dashboard/KeyPromisesGrid";
import HeroTargetCard from "@/components/dashboard/HeroTargetCard";
import CategorizedManifesto from "@/components/dashboard/CategorizedManifesto";
import AIScraperFeed from "@/components/dashboard/AIScraperFeed";
import EconomicOverview from "@/components/dashboard/EconomicOverview";
import DistrictMap from "@/components/dashboard/DistrictMap";
import MethodologySection from "@/components/dashboard/MethodologySection";
import FloatingSubmitButton from "@/components/dashboard/FloatingSubmitButton";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFAF5]">
      {/* 1. Masthead Tracker with Lotus Badge, Live Date, and Real-Time Countdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <MastheadTracker />
      </div>

      {/* 2. Key Progress Stats Band with Segmented Completion Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatsBand />
      </div>

      {/* 3. Sticky Category Navigation Bar */}
      <CategoryNav />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* 4. ⭐ BJP's 15 Key Promises — Headline Commitments */}
        <KeyPromisesGrid />

        {/* 5. Macroeconomic Engine: US$1 Trillion Target by 2033 & Viksit Bharat @2047 */}
        <div id="macro-targets" className="scroll-mt-36">
          <HeroTargetCard />
        </div>

        {/* 6. Official Categorized Manifesto Chapters (15 Sectors with Audit Citations) */}
        <CategorizedManifesto />

        {/* 7. Autonomous AI Scraper & Real-Time Evidence Ingestion Feed */}
        <AIScraperFeed />

        {/* 8. Regional Transformation: 23 Districts of West Bengal */}
        <div id="district-tracker" className="scroll-mt-36">
          <DistrictMap />
        </div>

        {/* 9. Economic & Social Development Overview (4 Pillars) */}
        <div id="economic-pillars" className="scroll-mt-36">
          <EconomicOverview />
        </div>

        {/* 10. Methodology, Good Faith, Neutrality, & Manifesto PDFs */}
        <MethodologySection />
      </div>

      {/* 11. Floating Action Button for Citizen Evidence Submissions */}
      <FloatingSubmitButton />
    </div>
  );
}