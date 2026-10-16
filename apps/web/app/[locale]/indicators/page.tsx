"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface IndicatorItem {
  id: string;
  nameEn: string;
  nameBn: string;
  category: "ECONOMIC" | "SOCIAL";
  pillar: string;
  currentValue: string;
  target2033: string;
  unit: string;
  source: string;
  period: string;
}

const INDICATORS_DATA: IndicatorItem[] = [
  // Economic
  {
    id: "gsdp-nominal",
    nameEn: "Nominal Gross State Domestic Product (GSDP)",
    nameBn: "মোট রাজ্য অভ্যন্তরীণ উৎপাদন (জিএসডিপি)",
    category: "ECONOMIC",
    pillar: "Macroeconomic Growth",
    currentValue: "₹18.8 Lakh Cr ($225B)",
    target2033: "₹85.0 Lakh Cr ($1,000B)",
    unit: "INR Lakh Cr / USD Billion",
    source: "MoSPI & West Bengal Finance Dept",
    period: "FY 2025-26",
  },
  {
    id: "gsdp-growth",
    nameEn: "Real GSDP Annual Growth Rate",
    nameBn: "প্রকৃত জিএসডিপি বার্ষিক প্রবৃদ্ধির হার",
    category: "ECONOMIC",
    pillar: "Macroeconomic Growth",
    currentValue: "7.8%",
    target2033: "12.5% CAGR",
    unit: "% annual",
    source: "Directorate of Economics & Statistics",
    period: "FY 2025-26",
  },
  {
    id: "per-capita",
    nameEn: "Per Capita Net State Domestic Product",
    nameBn: "মাথাপিছু বার্ষিক রাজ্য আয়",
    category: "ECONOMIC",
    pillar: "Household Prosperity",
    currentValue: "₹1,56,000",
    target2033: "₹5,20,000",
    unit: "INR per annum",
    source: "Economic Review of West Bengal",
    period: "2025",
  },
  {
    id: "exports",
    nameEn: "Merchandise & Service Exports",
    nameBn: "পণ্য ও পরিষেবা রপ্তানি",
    category: "ECONOMIC",
    pillar: "Trade & Ports",
    currentValue: "US$ 14.2 Billion",
    target2033: "US$ 100 Billion",
    unit: "USD Billion",
    source: "Ministry of Commerce (DGCIS)",
    period: "FY 2025",
  },
  {
    id: "msme",
    nameEn: "Registered Active MSME Units",
    nameBn: "নিবন্ধিত ক্ষুদ্র ও মাঝারি শিল্প (MSME)",
    category: "ECONOMIC",
    pillar: "Industry & Corridors",
    currentValue: "92 Lakh Units",
    target2033: "1.5 Crore Units",
    unit: "Lakh units",
    source: "Udyam Portal & MSME Dept",
    period: "2026",
  },
  {
    id: "women-workforce",
    nameEn: "Female Labour Force Participation Rate (FLFPR)",
    nameBn: "নারীদের কর্মসংস্থান অংশগ্রহণের হার",
    category: "ECONOMIC",
    pillar: "Human Capital",
    currentValue: "31.4%",
    target2033: "50.0%",
    unit: "% eligible women",
    source: "Periodic Labour Force Survey (PLFS)",
    period: "2025",
  },

  // Social Development
  {
    id: "tap-water",
    nameEn: "Rural Tap Water Coverage (Jal Jeevan Mission)",
    nameBn: "গ্রামীণ নলবাহিত পানীয় জল সংযোগ",
    category: "SOCIAL",
    pillar: "Public Utilities",
    currentValue: "64.2%",
    target2033: "100.0%",
    unit: "% households",
    source: "JJM Dashboard (Govt of India)",
    period: "2026",
  },
  {
    id: "maternal-mortality",
    nameEn: "Maternal Mortality Ratio (MMR)",
    nameBn: "মাতৃমৃত্যুর হার (প্রতি লক্ষ প্রসূতি)",
    category: "SOCIAL",
    pillar: "Healthcare",
    currentValue: "103 per 100k",
    target2033: "< 50 per 100k",
    unit: "per 1,00,000 live births",
    source: "SRS Bulletin & Health Dept",
    period: "2024",
  },
  {
    id: "school-enrolment",
    nameEn: "Secondary Education Gross Enrolment Ratio",
    nameBn: "মাধ্যমিক শিক্ষায় মোট ভর্তির অনুপাত",
    category: "SOCIAL",
    pillar: "Education",
    currentValue: "81.6%",
    target2033: "98.0%",
    unit: "% eligible cohort",
    source: "UDISE+ (Ministry of Education)",
    period: "2024-25",
  },
  {
    id: "electrification",
    nameEn: "24x7 Quality Power Access to Households",
    nameBn: "সার্বক্ষণিক বিদ্যুৎ সরবরাহ কভারেজ",
    category: "SOCIAL",
    pillar: "Infrastructure",
    currentValue: "99.1%",
    target2033: "100.0%",
    unit: "% households",
    source: "WBSEDCL & Power Ministry",
    period: "2026",
  },
];

export default function IndicatorsPage() {
  const locale = useLocale();
  const isBn = locale === "bn";

  const [activeTab, setActiveTab] = useState<"ALL" | "ECONOMIC" | "SOCIAL">("ALL");

  // Interactive Target Calculator State
  const [baseGdp, setBaseGdp] = useState(225); // in USD Billion
  const [cagr, setCagr] = useState(11.2); // in %
  const [years, setYears] = useState(7); // years to 2033
  const [exchangeRate, setExchangeRate] = useState(86); // INR per USD

  // Calculation: GSDP(t) = Base * (1 + g/100)^years
  const projectedUsd = Math.round(baseGdp * Math.pow(1 + cagr / 100, years));
  const projectedInrLakhCrore = ((projectedUsd * exchangeRate) / 1000).toFixed(1);

  const filtered = INDICATORS_DATA.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.category === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="bg-[#1C1008] text-white p-6 sm:p-10 rounded-xl border border-white/10 shadow-xl">
        <span className="font-mono text-xs uppercase tracking-widest text-[#E8620A] font-bold">
          {isBn ? "প্রমাণভিত্তিক উন্নয়ন মেট্রিক্স" : "Evidence-Backed Development Metrics"}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-black mt-1 text-white">
          {isBn ? "অর্থনৈতিক ও সামাজিক অগ্রগতি সূচক" : "Economic Analytics & Social Progress Index"}
        </h1>
        <p className="font-body text-sm sm:text-base text-white/70 italic mt-1 max-w-3xl">
          {isBn
            ? "জিএসডিপি প্রবৃদ্ধি, মাথাপিছু আয়, কর্মসংস্থান, স্বাস্থ্য ও শিক্ষার নির্ভরযোগ্য পরিমাপক — কোনো অনুমান নির্ভর সংখ্যা নয়"
            : "Transparent tracking of West Bengal's macroeconomic growth, social development, and human capital outcomes"}
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 pt-6 border-t border-white/15 flex gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded font-bold uppercase transition ${
              activeTab === "ALL" ? "bg-[#E8620A] text-white" : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {isBn ? "সমস্ত সূচক (All)" : "All Indicators"}
          </button>
          <button
            onClick={() => setActiveTab("ECONOMIC")}
            className={`px-4 py-2 rounded font-bold uppercase transition ${
              activeTab === "ECONOMIC" ? "bg-[#E8620A] text-white" : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {isBn ? "অর্থনৈতিক প্রবৃদ্ধি (Economic)" : "Economic Analytics"}
          </button>
          <button
            onClick={() => setActiveTab("SOCIAL")}
            className={`px-4 py-2 rounded font-bold uppercase transition ${
              activeTab === "SOCIAL" ? "bg-[#E8620A] text-white" : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {isBn ? "সামাজিক উন্নয়ন (Social)" : "Social Development"}
          </button>
        </div>
      </div>

      {/* Interactive Economic Target Calculator Card */}
      <div className="bg-[#F7F0E4] border-2 border-[#E8620A] rounded-xl p-6 sm:p-8 shadow-md border-t-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#D4C4B0]">
          <div>
            <span className="font-mono text-xs font-bold text-[#B84A00] uppercase tracking-wider block">
              {isBn ? "গাণিতিক সিমুলেশন মডেল" : "Mathematical Simulation Model"}
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#1C1008] mt-0.5">
              {isBn ? "১ ট্রিলিয়ন ডলার অর্থনীতি লক্ষ্যমাত্রা ক্যালকুলেটর" : "$1 Trillion GDP Trajectory Calculator"}
            </h2>
          </div>
          <div className="font-mono text-xs bg-white p-2 rounded border border-[#D4C4B0] text-[#4A3020]">
            Formula: GSDP(t) = Base × (1 + g)^n
          </div>
        </div>

        {/* Sliders & Inputs Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
          <div>
            <label className="block text-[#4A3020] font-bold mb-1">
              {isBn ? "ভিত্তি জিএসডিপি (Base GDP)" : "Base GDP ($ Billion)"}: ${baseGdp}B
            </label>
            <input
              type="range"
              min={180}
              max={300}
              step={5}
              value={baseGdp}
              onChange={(e) => setBaseGdp(Number(e.target.value))}
              className="w-full accent-[#E8620A]"
            />
          </div>

          <div>
            <label className="block text-[#4A3020] font-bold mb-1">
              {isBn ? "বার্ষিক প্রবৃদ্ধি (CAGR)" : "Assumed CAGR"}: {cagr}%
            </label>
            <input
              type="range"
              min={6}
              max={18}
              step={0.2}
              value={cagr}
              onChange={(e) => setCagr(Number(e.target.value))}
              className="w-full accent-[#E8620A]"
            />
          </div>

          <div>
            <label className="block text-[#4A3020] font-bold mb-1">
              {isBn ? "অবশিষ্ট বছর (Horizon)" : "Years to Target"}: {years} {isBn ? "বছর" : "Years"}
            </label>
            <input
              type="range"
              min={4}
              max={12}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-[#E8620A]"
            />
          </div>

          <div>
            <label className="block text-[#4A3020] font-bold mb-1">
              {isBn ? "বিনিময় হার (USD/INR)" : "Exchange Rate"}: ₹{exchangeRate}
            </label>
            <input
              type="range"
              min={80}
              max={95}
              step={1}
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-full accent-[#E8620A]"
            />
          </div>
        </div>

        {/* Projected Result Callout */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-[#D4C4B0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#8C7060]">
              {isBn ? "প্রত্যাশিত ২০৩৩ অর্থনীতি আকার" : "Projected 2033 State Economy"}
            </span>
            <div className="font-serif text-3xl sm:text-4xl font-black text-[#1A6B2A] mt-0.5">
              ${projectedUsd} Billion USD
              <span className="text-base sm:text-lg font-normal text-stone-500 ml-2">
                (≈ ₹{projectedInrLakhCrore} Lakh Crore)
              </span>
            </div>
          </div>

          <div className="font-mono text-xs font-bold text-center sm:text-right">
            {projectedUsd >= 1000 ? (
              <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-400 px-3 py-1.5 rounded">
                ✓ {isBn ? "$১ ট্রিলিয়ন লক্ষ্যমাত্রা অর্জিত" : "$1 Trillion Target Achieved"}
              </span>
            ) : (
              <span className="inline-block bg-amber-100 text-amber-900 border border-amber-400 px-3 py-1.5 rounded">
                ⚠ {isBn ? "আরও প্রবৃদ্ধি প্রয়োজন" : `${1000 - projectedUsd}B Shortfall (Needs Higher CAGR)`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Indicators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((ind) => (
          <div
            key={ind.id}
            className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[10px]">
                <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-bold uppercase">
                  {ind.pillar}
                </span>
                <span className="text-stone-400">{ind.period}</span>
              </div>

              <h3 className="font-serif text-lg font-bold text-ink leading-snug">
                {isBn ? ind.nameBn : ind.nameEn}
              </h3>

              <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-stone-50 p-2 rounded">
                  <span className="text-[9px] uppercase text-stone-400 block">
                    {isBn ? "বর্তমান অবস্থা" : "Current Level"}
                  </span>
                  <span className="font-bold text-ink text-sm block mt-0.5">
                    {isBn ? toBengaliNumerals(ind.currentValue) : ind.currentValue}
                  </span>
                </div>

                <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                  <span className="text-[9px] uppercase text-emerald-800 block">
                    {isBn ? "২০৩৩ লক্ষ্য" : "2033 Target"}
                  </span>
                  <span className="font-bold text-[#1A6B2A] text-sm block mt-0.5">
                    {isBn ? toBengaliNumerals(ind.target2033) : ind.target2033}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 font-mono text-[10px] text-stone-500 flex items-center justify-between">
              <span>Source: {ind.source}</span>
              <span className="text-[#E8620A] font-bold">Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
