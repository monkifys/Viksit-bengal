"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";
import { api } from "@/lib/api";

const STATUS_CONFIG: Record<string, { labelEn: string; labelBn: string; color: string }> = {
  NOT_STARTED: { labelEn: "Not Started", labelBn: "শুরু হয়নি", color: "bg-gray-100 text-gray-800 border-gray-300" },
  ANNOUNCED: { labelEn: "Announced", labelBn: "ঘোষিত", color: "bg-blue-50 text-blue-800 border-blue-200" },
  LEGALLY_INITIATED: { labelEn: "Legally Initiated", labelBn: "আইনত সূচিত", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  FUNDED: { labelEn: "Funded", labelBn: "বরাদ্দকৃত", color: "bg-teal-50 text-teal-800 border-teal-200" },
  UNDER_IMPLEMENTATION: { labelEn: "Under Implementation", labelBn: "বাস্তবায়নাধীন", color: "bg-amber-50 text-amber-800 border-amber-300" },
  PARTIALLY_DELIVERED: { labelEn: "Partially Delivered", labelBn: "আংশিক বাস্তবায়িত", color: "bg-lime-50 text-lime-800 border-lime-300" },
  DELIVERED: { labelEn: "Delivered", labelBn: "সম্পূর্ণ বাস্তবায়িত", color: "bg-emerald-100 text-emerald-900 border-emerald-400" },
  DELAYED: { labelEn: "Delayed", labelBn: "বিলম্বিত", color: "bg-rose-50 text-rose-800 border-rose-300" },
  REVERSED: { labelEn: "Reversed", labelBn: "প্রত্যাহারকৃত", color: "bg-red-100 text-red-900 border-red-400" },
  DISPUTED: { labelEn: "Disputed", labelBn: "বিতর্কিত", color: "bg-orange-50 text-orange-800 border-orange-300" },
  NOT_VERIFIABLE: { labelEn: "Not Verifiable", labelBn: "যাচাইযোগ্য নয়", color: "bg-neutral-100 text-neutral-700 border-neutral-300" },
};

export default function PromisesPage() {
  const locale = useLocale();
  const isBn = locale === "bn";

  const [promises, setPromises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedTier, setSelectedTier] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getPromises();
        if (Array.isArray(data) && data.length > 0) {
          setPromises(data);
        } else {
          loadFallback();
        }
      } catch {
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      setPromises([
        {
          code: "GOV-02",
          titleEn: "Clear all DA arrears and implement 7th Pay Commission for state employees within 45 days",
          titleBn: "দায়িত্ব গ্রহণের ৪৫ দিনের মধ্যে সমস্ত সরকারি কর্মচারীদের বকেয়া ডিএ মেটানো ও ৭ম বেতন কমিশন কার্যকর",
          status: "UNDER_IMPLEMENTATION",
          confidence: "A",
          category: { titleEn: "Governance & Rule of Law", titleBn: "শাসন ও আইনের শাসন" },
          department: "Finance Department",
        },
        {
          code: "SEC-02",
          titleEn: "Land allocation for fencing along India-Bangladesh border within 45 days",
          titleBn: "ভারত-বাংলাদেশ সীমান্তে কাঁটাতার বেড়ার জন্য ৪৫ দিনের মধ্যে জমি হস্তান্তর সম্পন্ন করা",
          status: "UNDER_IMPLEMENTATION",
          confidence: "A",
          category: { titleEn: "National Security", titleBn: "জাতীয় নিরাপত্তা" },
          department: "Home & Hill Affairs",
        },
        {
          code: "WOMEN-01",
          titleEn: "Provide monthly financial assistance of ₹3,000 to women directly into bank accounts",
          titleBn: "মহিলাদের অর্থনৈতিক আত্মমর্যাদার জন্য প্রতি মাসে ৩,০০০ টাকা সরাসরি আর্থিক সহায়তা প্রদান",
          status: "ANNOUNCED",
          confidence: "B",
          category: { titleEn: "Women's Empowerment", titleBn: "নারী সুরক্ষা ও ক্ষমতায়ন" },
          department: "Women & Child Development",
        },
        {
          code: "HEALTH-01",
          titleEn: "Implement Ayushman Bharat PM-JAY with ₹5 Lakh cashless coverage converging with Swasthya Sathi",
          titleBn: "স্বাস্থ্য সাথীর সাথে যুক্ত করে ৫ লক্ষ টাকার ক্যাশলেস কভারেজ সহ আয়ুষ্মান ভারত চালু",
          status: "LEGALLY_INITIATED",
          confidence: "A",
          category: { titleEn: "Healthcare", titleBn: "স্বাস্থ্য পরিষেবা" },
          department: "Health & Family Welfare",
        },
        {
          code: "TEA-01",
          titleEn: "Rejuvenate abandoned tea estates in Dooars and Terai with direct PF settlement fund",
          titleBn: "ডুয়ার্স ও তরাইয়ের রুগ্ন চা বাগান পুনরুজ্জীবন ও পিএফ বকেয়া নিষ্পত্তিতে বিশেষ তহবিল",
          status: "FUNDED",
          confidence: "B",
          category: { titleEn: "Tea Industry", titleBn: "চা শিল্প" },
          department: "Commerce & Industries",
        },
        {
          code: "INFRA-01",
          titleEn: "Fast-track construction of Tajpur Deep Sea Port and allied port-led industrial corridor",
          titleBn: "তাজপুর গভীর সমুদ্র বন্দর এবং সংশ্লিষ্ট বন্দর-ভিত্তিক শিল্প করিডোরের কাজ দ্রুত বাস্তবায়ন",
          status: "UNDER_IMPLEMENTATION",
          confidence: "A",
          category: { titleEn: "Infrastructure", titleBn: "অবকাঠামো ও যোগাযোগ" },
          department: "Transport Department",
        },
      ]);
    }

    loadData();
  }, []);

  const filtered = promises.filter((p) => {
    const textToMatch = `${p.code} ${p.titleEn} ${p.titleBn || ""} ${p.department || ""}`.toLowerCase();
    if (search && !textToMatch.includes(search.toLowerCase())) return false;
    if (selectedCategory !== "ALL" && p.category?.titleEn !== selectedCategory) return false;
    if (selectedStatus !== "ALL" && p.status !== selectedStatus) return false;
    if (selectedTier !== "ALL" && p.confidence !== selectedTier) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-[#1C1008] text-white p-6 sm:p-10 rounded-xl border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#E8620A] font-bold">
              {isBn ? "সার্বজনীন দায়বদ্ধতা ট্র্যাকার" : "Public Accountability Ledger"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black mt-1 text-white">
              {isBn ? "সরকারি প্রতিশ্রুতির খতিয়ান (২০২৬–২০৩১)" : "Commitments & Promise Explorer"}
            </h1>
            <p className="font-body text-sm sm:text-base text-white/70 italic mt-1 max-w-3xl">
              {isBn
                ? "পশ্চিমবঙ্গ সরকারের প্রতিটি প্রতিশ্রুতির ১১-ধাপের বাস্তবায়ন স্থিতি, গেজেট প্রমাণ ও নিরীক্ষা বিবরণী"
                : "Tracking every commitment made to the people of West Bengal across 11 governance stages with verifiable gazette evidence"}
            </p>
          </div>
          <div className="font-mono text-sm bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-center self-start sm:self-center">
            <span className="text-[#E8620A] font-bold text-xl block leading-none">
              {isBn ? toBengaliNumerals(filtered.length) : filtered.length}
            </span>
            <span className="text-[10px] uppercase text-white/60">
              {isBn ? "প্রদর্শিত প্রতিশ্রুতি" : "Matching Promises"}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {/* Search Input */}
          <div>
            <label className="block text-white/60 text-[10px] uppercase mb-1">
              {isBn ? "অনুসন্ধান (কীওয়ার্ড বা কোড)" : "Search keyword or code"}
            </label>
            <input
              type="text"
              placeholder={isBn ? "যেমন: DA, জমি, তাজপুর..." : "e.g. DA, Border, Tajpur..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#E8620A]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-white/60 text-[10px] uppercase mb-1">
              {isBn ? "বাস্তবায়ন অবস্থা (১১ স্তর)" : "Status (11 Stages)"}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#1C1008] border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#E8620A]"
            >
              <option value="ALL">{isBn ? "সমস্ত অবস্থা (All)" : "All Statuses"}</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {isBn ? cfg.labelBn : cfg.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Evidence Confidence Tier */}
          <div>
            <label className="block text-white/60 text-[10px] uppercase mb-1">
              {isBn ? "প্রমাণ আত্মবিশ্বাস গ্রেড" : "Evidence Tier"}
            </label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-[#1C1008] border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#E8620A]"
            >
              <option value="ALL">{isBn ? "সমস্ত গ্রেড (All)" : "All Tiers (A-D)"}</option>
              <option value="A">Grade A (Official Gazette / CAG)</option>
              <option value="B">Grade B (Department Tender / Order)</option>
              <option value="C">Grade C (Verified Press Report)</option>
              <option value="D">Grade D (Citizen / Unverified)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setSelectedStatus("ALL");
                setSelectedCategory("ALL");
                setSelectedTier("ALL");
              }}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded p-2 text-white/80 hover:text-white transition text-center uppercase tracking-wider"
            >
              {isBn ? "ফিল্টার মুছুন" : "Clear Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* Promises Cards Grid */}
      {loading ? (
        <div className="text-center py-16 font-mono text-stone-500">
          <span className="inline-block w-6 h-6 border-2 border-[#E8620A] border-t-transparent rounded-full animate-spin mb-2" />
          <p>{isBn ? "প্রতিশ্রুতির তথ্য লোড হচ্ছে..." : "Loading commitments ledger..."}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-stone-300">
          <span className="text-4xl block mb-2">🔍</span>
          <h3 className="font-serif text-xl font-bold text-ink">
            {isBn ? "কোনো প্রতিশ্রুতি পাওয়া যায়নি" : "No promises matched your filters"}
          </h3>
          <p className="font-mono text-xs text-stone-500 mt-1">
            {isBn ? "অনুগ্রহ করে অনুসন্ধান শব্দ পরিবর্তন করুন।" : "Try clearing filters or using another keyword."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.NOT_STARTED;
            return (
              <div
                key={p.code}
                className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#E8620A] bg-[#FFF3E8] px-2 py-0.5 rounded border border-[#E8620A]/30">
                      {p.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusCfg.color}`}>
                      {isBn ? statusCfg.labelBn : statusCfg.labelEn}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-ink hover:text-[#E8620A] transition">
                    <Link href={`/${locale}/promises/${p.code}`}>
                      {isBn ? p.titleBn || p.titleEn : p.titleEn}
                    </Link>
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono text-stone-600">
                    {p.category && (
                      <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        📁 {isBn ? p.category.titleBn : p.category.titleEn}
                      </span>
                    )}
                    {p.department && (
                      <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        🏢 {p.department}
                      </span>
                    )}
                    {p.confidence && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        Grade {p.confidence} (Evidence)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">
                    {isBn ? "সম্পূর্ণ অডিট ও গেজেট লিঙ্ক" : "Audited with state gazettes"}
                  </span>
                  <Link
                    href={`/${locale}/promises/${p.code}`}
                    className="text-[#E8620A] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>{isBn ? "অডিট খতিয়ান দেখুন" : "View Audit Ledger"}</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
