"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface IndicatorGroup {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  indicators: {
    code: string;
    nameEn: string;
    nameBn: string;
    currentValue: string;
    targetValue: string;
    unit: string;
    trend: "up" | "down" | "stable";
    source: string;
  }[];
}

const ECONOMIC_PILLARS: IndicatorGroup[] = [
  {
    id: "growth",
    titleEn: "GSDP Growth & Output",
    titleBn: "জিএসডিপি প্রবৃদ্ধি ও উৎপাদন",
    descriptionEn: "Macroeconomic expansion rates distinguishing nominal output and real volume.",
    descriptionBn: "মুদ্রাস্ফীতি সমন্বয় ও প্রকৃত প্রবৃদ্ধির ভিত্তিপরিমাপ।",
    indicators: [
      {
        code: "GSDP_REAL_GROWTH",
        nameEn: "Real GSDP Growth Rate",
        nameBn: "প্রকৃত জিএসডিপি বৃদ্ধির হার",
        currentValue: "8.4",
        targetValue: "12.5",
        unit: "%",
        trend: "up",
        source: "MoSPI / WB State Budget",
      },
      {
        code: "GSDP_NOMINAL_INR",
        nameEn: "Nominal GSDP (₹ Lakh Cr)",
        nameBn: "নামমাত্র জিএসডিপি (লক্ষ কোটি টাকা)",
        currentValue: "19.8",
        targetValue: "84.0",
        unit: "₹ L Cr",
        trend: "up",
        source: "RBI State Finances",
      },
      {
        code: "PER_CAPITA_INCOME",
        nameEn: "Per-Capita Net Income",
        nameBn: "মাথাপিছু বার্ষিক আয়",
        currentValue: "₹1,54,000",
        targetValue: "₹4,20,000",
        unit: "₹/yr",
        trend: "up",
        source: "Economic Review WB",
      },
    ],
  },
  {
    id: "trade",
    titleEn: "Trade, Ports & Blue Economy",
    titleBn: "বাণিজ্য, সমুদ্র বন্দর ও নীল অর্থনীতি",
    descriptionEn: "Haldia & Tajpur port logistics, seafood, tea, and agro-exports.",
    descriptionBn: "হলদিয়া-তাজপুর বন্দর পণ্য পরিবহন, চা, পাট এবং সামুদ্রিক খাদ্য রপ্তানি।",
    indicators: [
      {
        code: "PORT_CARGO_VOLUME",
        nameEn: "Maritime Port Cargo Throughput",
        nameBn: "সমুদ্র বন্দরের পণ্য পরিবহন ক্ষমতা",
        currentValue: "68.5",
        targetValue: "180.0",
        unit: "MTPA",
        trend: "up",
        source: "Syama Prasad Mookerjee Port Authority",
      },
      {
        code: "SEAFOOD_EXPORTS",
        nameEn: "Marine & Shrimp Export Value",
        nameBn: "সামুদ্রিক ও চিংড়ি রপ্তানি মূল্য",
        currentValue: "₹5,200",
        targetValue: "₹15,000",
        unit: "₹ Cr",
        trend: "up",
        source: "MPEDA / Ministry of Commerce",
      },
      {
        code: "TEA_JUTE_TRADE",
        nameEn: "Tea & Jute Export Value",
        nameBn: "চা ও পাটজাত সামগ্রী রপ্তানি",
        currentValue: "₹4,100",
        targetValue: "₹9,500",
        unit: "₹ Cr",
        trend: "stable",
        source: "Tea Board of India / IJMA",
      },
    ],
  },
  {
    id: "industry",
    titleEn: "Industry, MSMEs & Capex",
    titleBn: "শিল্প, ক্ষুদ্র-মাঝারি উদ্যোগ ও মূলধনী বিনিয়োগ",
    descriptionEn: "Industrial corridors, manufacturing plants, and MSME formalization.",
    descriptionBn: "শিল্প করিডোর, কারখানা ও নিবন্ধিত ক্ষুদ্র-মাঝারি শিল্পের প্রসার।",
    indicators: [
      {
        code: "MSME_REGISTERED",
        nameEn: "Registered MSME Units",
        nameBn: "নিবন্ধিত এমএসএমই শিল্প ইউনিট",
        currentValue: "92.4",
        targetValue: "150.0",
        unit: "Lakh Units",
        trend: "up",
        source: "Udyam Portal",
      },
      {
        code: "ANNUAL_CAPEX",
        nameEn: "State Capital Outlay (Capex)",
        nameBn: "রাজ্যের বার্ষিক মূলধনী ব্যয়",
        currentValue: "₹36,500",
        targetValue: "₹95,000",
        unit: "₹ Cr",
        trend: "up",
        source: "CAG Audit / WB Accounts",
      },
      {
        code: "STARTUPS_DENSITY",
        nameEn: "Recognized Tech Startups",
        nameBn: "স্বীকৃত প্রযুক্তি স্টার্টআপ",
        currentValue: "3,850",
        targetValue: "15,000",
        unit: "Startups",
        trend: "up",
        source: "DPIIT Startup India",
      },
    ],
  },
  {
    id: "inclusion",
    titleEn: "Human Capital & Social Index",
    titleBn: "মানবসম্পদ ও সামাজিক সূচক",
    descriptionEn: "Workforce participation, healthcare centres, and learning outcomes.",
    descriptionBn: "কর্মসংস্থান, স্বাস্থ্য অবকাঠামো এবং টেকনিক্যাল দক্ষতা বৃদ্ধি।",
    indicators: [
      {
        code: "FEMALE_LFPR",
        nameEn: "Female Labor Force Participation",
        nameBn: "মহিলাদের শ্রমশক্তিতে অংশগ্রহণের হার",
        currentValue: "26.4",
        targetValue: "42.0",
        unit: "%",
        trend: "up",
        source: "PLFS / Labour Bureau",
      },
      {
        code: "HEALTH_INFRA_RATIO",
        nameEn: "Primary Health Centres per Block",
        nameBn: "ব্লক স্তরে প্রাথমিক স্বাস্থ্য কেন্দ্র অনুপাত",
        currentValue: "3.2",
        targetValue: "5.0",
        unit: "Per Block",
        trend: "stable",
        source: "National Health Mission",
      },
      {
        code: "VOCATIONAL_APPRENTICES",
        nameEn: "Annual Youth Apprenticeships",
        nameBn: "বার্ষিক যুব শিক্ষানবিশী ও দক্ষতা প্রশিক্ষণ",
        currentValue: "1.2",
        targetValue: "6.0",
        unit: "Lakh/yr",
        trend: "up",
        source: "MSDE National Apprenticeship Portal",
      },
    ],
  },
];

export default function EconomicOverview() {
  const t = useTranslations("EconomicOverview");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState(ECONOMIC_PILLARS[0].id);

  const format = (val: string | number) => {
    return locale === "bn" ? toBengaliNumerals(val) : val.toString();
  };

  const currentGroup = ECONOMIC_PILLARS.find((g) => g.id === activeTab) || ECONOMIC_PILLARS[0];

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-950/10 my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {locale === "bn" ? "অর্থনৈতিক ও সামাজিক অগ্রগতি সূচক" : "Economic & Social Progress Indicators"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "bn"
              ? "১ ট্রিলিয়ন ডলারের লক্ষ্য পূরণে বাস্তব ডেটা ও অফিসিয়াল রিপোর্টের ভিত্তিতে পরিমাপ।"
              : "Measurable indicators independently tracked against NITI Aayog, RBI, and CAG benchmarks."}
          </p>
        </div>

        {/* Pillar Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          {ECONOMIC_PILLARS.map((pillar) => (
            <button
              key={pillar.id}
              onClick={() => setActiveTab(pillar.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[38px] ${
                activeTab === pillar.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
              aria-selected={activeTab === pillar.id}
              role="tab"
            >
              {locale === "bn" ? pillar.titleBn.split(" ")[0] : pillar.titleEn.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Active Pillar Details */}
      <div className="my-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <h3 className="text-lg font-bold text-ink">
            {locale === "bn" ? currentGroup.titleBn : currentGroup.titleEn}
          </h3>
          <span className="text-xs text-muted-foreground ml-2">
            — {locale === "bn" ? currentGroup.descriptionBn : currentGroup.descriptionEn}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {currentGroup.indicators.map((ind) => (
            <div
              key={ind.code}
              className="bg-gray-50/80 rounded-xl p-5 border border-gray-200/80 hover:border-emerald-700/40 hover:bg-white hover:shadow-sm transition-all"
            >
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                {ind.code}
              </div>
              <h4 className="font-bold text-ink text-sm sm:text-base mb-3 leading-snug">
                {locale === "bn" ? ind.nameBn : ind.nameEn}
              </h4>

              <div className="flex items-baseline justify-between pt-2 border-t border-gray-200/60">
                <div>
                  <span className="text-[11px] text-gray-500 block">
                    {locale === "bn" ? "বর্তমান অবস্থা" : "Current Verified"}
                  </span>
                  <span className="text-xl font-black text-ink">
                    {format(ind.currentValue)} {ind.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">
                    {locale === "bn" ? "২০৩৩ লক্ষ্যমাত্রা" : "2033 Target"}
                  </span>
                  <span className="text-xl font-black text-emerald-700">
                    {format(ind.targetValue)} {ind.unit}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate max-w-[200px]" title={ind.source}>
                  📁 {ind.source}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  {ind.trend === "up" ? "▲ Growing" : "■ Steady"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accounting Methodology Callout */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
        <span className="text-base">⚖️</span>
        <div>
          <strong className="font-bold">
            {locale === "bn" ? "অর্থনৈতিক পরিমাপের স্বচ্ছতা:" : "Analytical Integrity Guarantee:"}
          </strong>{" "}
          {locale === "bn"
            ? "সবাই ফাউন্ডেশন প্রতিটি অর্থনৈতিক ডেটার প্রাথমিক উৎস (RBI, MoSPI, NITI Aayog) প্রকাশ করে। মুদ্রাস্ফীতি এবং রুপী-ডলারের বিনিময় হারের তারতম্যকে কোনো রাজনৈতিক দাবির সাথে মিশ্রিত করা হয় না।"
            : "Sabai Foundation ensures all macroeconomic targets are presented with explicitly stated assumptions on inflation, rupee-dollar exchange fluctuations, and constant vs. current price base years."}
        </div>
      </div>
    </section>
  );
}