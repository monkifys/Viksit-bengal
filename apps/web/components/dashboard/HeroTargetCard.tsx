"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface Scenario {
  id: "conservative" | "base" | "ambitious";
  labelEn: string;
  labelBn: string;
  cagr: number;
  projected2033: number;
  descriptionEn: string;
  descriptionBn: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "conservative",
    labelEn: "Conservative Scenario",
    labelBn: "রক্ষণশীল দৃশ্যপট",
    cagr: 7.5,
    projected2033: 490,
    descriptionEn: "Moderate industrial growth, slower currency depreciation, and stable agricultural baseline.",
    descriptionBn: "মাঝারি শিল্প বৃদ্ধি, মুদ্রার বিনিময় হার ও স্থিতিশীল কৃষি ভিত্তি।",
  },
  {
    id: "base",
    labelEn: "Base Case Trajectory",
    labelBn: "ভিত্তিরেখা প্রক্ষেপণ",
    cagr: 9.8,
    projected2033: 680,
    descriptionEn: "Accelerated logistics, Haldia-Dankuni corridor, and moderate manufacturing expansion.",
    descriptionBn: "লজিস্টিকস ও হলদিয়া-ডানকুনি করিডোর রূপান্তর এবং উৎপাদন খাতের মধ্যম সম্প্রসারণ।",
  },
  {
    id: "ambitious",
    labelEn: "Ambitious Vision (Target)",
    labelBn: "উচ্চাকাঙ্ক্ষী রূপকল্প (লক্ষ্যমাত্রা)",
    cagr: 13.2,
    projected2033: 1000,
    descriptionEn: "Massive private capex, port modernization (Tajpur), MSME formalization, and tech corridors.",
    descriptionBn: "বৃহৎ বেসরকারি বিনিয়োগ, তাজপুর গভীর সমুদ্র বন্দর, এমএসএমই রূপান্তর ও প্রযুক্তি করিডোর।",
  },
];

export default function HeroTargetCard() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const [activeScenario, setActiveScenario] = useState<Scenario["id"]>("ambitious");

  const currentGsdpUsd = 240; // Current estimated West Bengal GSDP in Billion USD
  const targetGsdpUsd = 1000;
  const currentYear = 2026;
  const targetYear = 2033;
  const yearsRemaining = targetYear - currentYear;

  const currentPercent = Math.min(100, Math.round((currentGsdpUsd / targetGsdpUsd) * 100));
  const scenario = SCENARIOS.find((s) => s.id === activeScenario) || SCENARIOS[2];

  const formatNumber = (num: number | string) => {
    return locale === "bn" ? toBengaliNumerals(num) : num.toString();
  };

  return (
    <section className="bg-gradient-to-br from-emerald-950 via-[#0A4D2E] to-emerald-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-emerald-800/60 relative overflow-hidden">
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-700/50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-600/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {locale === "bn" ? "পশ্চিমবঙ্গ রূপকল্প ২০৩৩" : "West Bengal Horizon 2033"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              {locale === "bn" ? "$১ ট্রিলিয়ন অর্থনীতির লক্ষ্যমাত্রা" : "US$ 1 Trillion Bengal Economy"}
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
              {locale === "bn"
                ? "পশ্চিমবঙ্গের বর্তমান আনুমানিক ২৪০ বিলিয়ন ডলার থেকে ২০৩৩ সালের মধ্যে ১ ট্রিলিয়ন ডলারে পৌঁছানোর রূপরেখা ও বিকশিত ভারত ২০৪৭-এ অবদান।"
                : "Tracking West Bengal’s transformation from ~US$240B current estimated GSDP to US$1,000B by 2033, powering Viksit Bharat @2047."}
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="bg-emerald-900/80 p-1.5 rounded-xl border border-emerald-700/60 flex flex-col gap-1 sm:self-start">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider px-2 pt-1">
              {locale === "bn" ? "প্রক্ষেপণ দৃশ্যপট" : "Select Scenario"}
            </span>
            <div className="grid grid-cols-3 gap-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all min-h-[36px] ${
                    activeScenario === s.id
                      ? "bg-white text-emerald-950 font-bold shadow-md"
                      : "text-emerald-200 hover:bg-emerald-800/60"
                  }`}
                  aria-pressed={activeScenario === s.id}
                >
                  {locale === "bn" ? s.labelBn.split(" ")[0] : s.labelEn.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
          <div className="bg-emerald-900/50 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-emerald-700/40">
            <span className="text-xs text-emerald-300 font-medium block mb-1">
              {locale === "bn" ? "বর্তমান জিএসডিপি (আনুমানিক)" : "Current Est. GSDP"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ${formatNumber(currentGsdpUsd)}B
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {locale === "bn" ? "~₹২০ লক্ষ কোটি" : "~₹20 Lakh Crore"}
            </span>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-emerald-700/40">
            <span className="text-xs text-emerald-300 font-medium block mb-1">
              {locale === "bn" ? "২০৩৩ লক্ষ্যমাত্রা" : "2033 Goal Milestone"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ${formatNumber(targetGsdpUsd)}B
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {locale === "bn" ? "১ ট্রিলিয়ন মার্কিন ডলার" : "US$ 1,000 Billion"}
            </span>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-emerald-700/40">
            <span className="text-xs text-emerald-300 font-medium block mb-1">
              {locale === "bn" ? "প্রয়োজনীয় বার্ষিক বৃদ্ধি (CAGR)" : "Required Annual CAGR"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              {formatNumber(scenario.cagr)}%
            </div>
            <span className="text-[11px] text-emerald-300/80 mt-1 block">
              {locale === "bn" ? `${scenario.labelBn} ভিত্তিতে` : `Under ${scenario.labelEn}`}
            </span>
          </div>

          <div className="bg-emerald-900/50 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-emerald-700/40">
            <span className="text-xs text-emerald-300 font-medium block mb-1">
              {locale === "bn" ? "সময়সীমা ও বাকি বছর" : "Target Horizon"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatNumber(yearsRemaining)} {locale === "bn" ? "বছর" : "Years"}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {formatNumber(currentYear)} → {formatNumber(targetYear)}
            </span>
          </div>
        </div>

        {/* Progress Bar (Accessible WCAG 2.2 AA) */}
        <div className="bg-emerald-950/80 p-5 rounded-xl border border-emerald-800/80">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-emerald-200">
              {locale === "bn" ? "১ ট্রিলিয়ন ডলার পথের অগ্রগতি" : "Progress toward US$1 Trillion Target"}
            </span>
            <span className="text-white font-bold">{formatNumber(currentPercent)}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={currentPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Target progress percentage"
            className="w-full bg-emerald-900/90 rounded-full h-3.5 overflow-hidden p-0.5 border border-emerald-700/60"
          >
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-emerald-300/80 mt-2 font-mono">
            <span>$0B</span>
            <span>Current: ${formatNumber(currentGsdpUsd)}B</span>
            <span>Target: $1,000B</span>
          </div>
        </div>

        {/* Methodological Transparency Note */}
        <div className="mt-4 flex items-start gap-2.5 text-[12px] text-emerald-200/90 bg-emerald-900/30 p-3 rounded-lg border border-emerald-700/30">
          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            <strong className="text-white">{locale === "bn" ? "পদ্ধতিগত ব্যাখ্যা:" : "Methodology Note:"}</strong>{" "}
            {locale === "bn"
              ? "এই লক্ষ্যমাত্রায় বর্তমান টাকার নিরিখে নামমাত্র জিএসডিপি, মুদ্রাস্ফীতি সমন্বয়, ডলারের বিনিময় হার এবং পিপিপি পৃথকভাবে ট্র্যাক করা হয়। এটি সরকারি তথ্যের সাথে তুলনাভিত্তিক নাগরিক মডেল।"
              : "Calculations distinguish between Nominal GSDP (₹), Real GSDP, USD exchange conversion, and PPP metrics based on RBI and MoSPI economic releases."}
          </p>
        </div>
      </div>
    </section>
  );
}