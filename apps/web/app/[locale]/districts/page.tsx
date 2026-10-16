"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";
import { api } from "@/lib/api";

const ALL_23_DISTRICTS = [
  { code: "KOL", nameEn: "Kolkata", nameBn: "কলকাতা", region: "South Bengal", population: "4.5M", gsdpShare: 14.5, projects: 48 },
  { code: "HWH", nameEn: "Howrah", nameBn: "হাওড়া", region: "South Bengal", population: "4.8M", gsdpShare: 8.2, projects: 32 },
  { code: "N24", nameEn: "North 24 Parganas", nameBn: "উত্তর ২৪ পরগনা", region: "South Bengal", population: "10.0M", gsdpShare: 11.4, projects: 42 },
  { code: "S24", nameEn: "South 24 Parganas", nameBn: "দক্ষিণ ২৪ পরগনা", region: "South Bengal", population: "8.1M", gsdpShare: 7.8, projects: 36 },
  { code: "DAR", nameEn: "Darjeeling", nameBn: "দার্জিলিং", region: "North Bengal", population: "1.8M", gsdpShare: 3.2, projects: 28 },
  { code: "KAL", nameEn: "Kalimpong", nameBn: "কালিম্পং", region: "North Bengal", population: "0.25M", gsdpShare: 0.9, projects: 14 },
  { code: "JAL", nameEn: "Jalpaiguri", nameBn: "জলপাইগুড়ি", region: "North Bengal", population: "2.4M", gsdpShare: 3.5, projects: 22 },
  { code: "ALB", nameEn: "Alipurduar", nameBn: "আলিপুরদুয়ার", region: "North Bengal", population: "1.5M", gsdpShare: 2.1, projects: 18 },
  { code: "COB", nameEn: "Cooch Behar", nameBn: "কোচবিহার", region: "North Bengal", population: "2.8M", gsdpShare: 2.8, projects: 20 },
  { code: "UDI", nameEn: "Uttar Dinajpur", nameBn: "উত্তর দিনাজপুর", region: "North Bengal", population: "3.0M", gsdpShare: 2.6, projects: 16 },
  { code: "DDI", nameEn: "Dakshin Dinajpur", nameBn: "দক্ষিণ দিনাজপুর", region: "North Bengal", population: "1.7M", gsdpShare: 1.8, projects: 15 },
  { code: "MLD", nameEn: "Malda", nameBn: "মালদা", region: "North Bengal", population: "3.9M", gsdpShare: 4.2, projects: 26 },
  { code: "MUR", nameEn: "Murshidabad", nameBn: "মুর্শিদাবাদ", region: "South Bengal", population: "7.1M", gsdpShare: 5.5, projects: 31 },
  { code: "NAD", nameEn: "Nadia", nameBn: "নদিয়া", region: "South Bengal", population: "5.2M", gsdpShare: 5.1, projects: 27 },
  { code: "PUR", nameEn: "Purba Bardhaman", nameBn: "পূর্ব বর্ধমান", region: "South Bengal", population: "4.8M", gsdpShare: 6.8, projects: 34 },
  { code: "PBA", nameEn: "Paschim Bardhaman", nameBn: "পশ্চিম বর্ধমান", region: "South Bengal", population: "2.9M", gsdpShare: 7.9, projects: 38 },
  { code: "BIR", nameEn: "Birbhum", nameBn: "বীরভূম", region: "South Bengal", population: "3.5M", gsdpShare: 3.1, projects: 21 },
  { code: "BNK", nameEn: "Bankura", nameBn: "বাঁকুড়া", region: "South Bengal", population: "3.6M", gsdpShare: 3.4, projects: 23 },
  { code: "PRL", nameEn: "Purulia", nameBn: "পুরুলিয়া", region: "South Bengal", population: "2.9M", gsdpShare: 2.7, projects: 19 },
  { code: "JGM", nameEn: "Jhargram", nameBn: "ঝাড়গ্রাম", region: "South Bengal", population: "1.1M", gsdpShare: 1.4, projects: 17 },
  { code: "PMD", nameEn: "Purba Medinipur", nameBn: "পূর্ব মেদিনীপুর", region: "South Bengal", population: "5.1M", gsdpShare: 6.3, projects: 35 },
  { code: "PSM", nameEn: "Paschim Medinipur", nameBn: "পশ্চিম মেদিনীপুর", region: "South Bengal", population: "4.7M", gsdpShare: 4.8, projects: 29 },
  { code: "HOO", nameEn: "Hooghly", nameBn: "হুগলি", region: "South Bengal", population: "5.5M", gsdpShare: 7.2, projects: 33 },
];

export default function DistrictsPage() {
  const locale = useLocale();
  const isBn = locale === "bn";

  const [districts, setDistricts] = useState(ALL_23_DISTRICTS);
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const live = await api.getDistricts();
        if (Array.isArray(live) && live.length > 0) {
          const merged = ALL_23_DISTRICTS.map((d) => {
            const found = (live as any[]).find((l) => l.code === d.code);
            return found
              ? {
                  ...d,
                  nameEn: found.nameEn || d.nameEn,
                  nameBn: found.nameBn || d.nameBn,
                  gsdpShare: found.gsdpShare || d.gsdpShare,
                  projects: found.promiseCount || d.projects,
                }
              : d;
          });
          setDistricts(merged);
        }
      } catch {
        // preserve fallback
      }
    }
    load();
  }, []);

  const filtered = districts.filter((d) => {
    const term = `${d.nameEn} ${d.nameBn} ${d.code}`.toLowerCase();
    if (search && !term.includes(search.toLowerCase())) return false;
    if (selectedRegion !== "ALL" && d.region !== selectedRegion) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-[#1C1008] text-white p-6 sm:p-10 rounded-xl border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#E8620A] font-bold">
              {isBn ? "আঞ্চলিক রূপান্তর সমীক্ষা" : "Regional Transformation Ledger"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black mt-1 text-white">
              {isBn ? "পশ্চিমবঙ্গের ২৩টি জেলার উন্নয়ন সূচক" : "23 Districts Development Explorer"}
            </h1>
            <p className="font-body text-sm sm:text-base text-white/70 italic mt-1 max-w-3xl">
              {isBn
                ? "দার্জিলিং থেকে সুন্দরবন — প্রতিটি জেলার জিএসডিপি অবদান, জনসংখ্যা এবং চলমান সরকারি ফ্ল্যাগশিপ প্রকল্প"
                : "Tracking economic output, demographic indices, and flagship infrastructure commitments across all 23 districts"}
            </p>
          </div>

          <div className="font-mono text-xs bg-white/10 px-4 py-2 rounded border border-white/20 text-center self-start sm:self-center">
            <span className="text-[#E8620A] font-bold text-2xl block leading-none">
              {isBn ? toBengaliNumerals(23) : "23/23"}
            </span>
            <span className="text-[10px] uppercase text-white/60">
              {isBn ? "সম্পূর্ণ রাজ্য কভারেজ" : "Districts Monitored"}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div>
            <label className="block text-white/60 text-[10px] uppercase mb-1">
              {isBn ? "জেলা খুঁজুন" : "Search District"}
            </label>
            <input
              type="text"
              placeholder={isBn ? "যেমন: দার্জিলিং, হাওড়া..." : "e.g. Darjeeling, Howrah..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#E8620A]"
            />
          </div>

          <div>
            <label className="block text-white/60 text-[10px] uppercase mb-1">
              {isBn ? "অঞ্চল ফিল্টার" : "Zone / Region"}
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#1C1008] border border-white/20 rounded p-2 text-white focus:outline-none focus:border-[#E8620A]"
            >
              <option value="ALL">{isBn ? "সমস্ত অঞ্চল (All)" : "All Regions (23 Districts)"}</option>
              <option value="North Bengal">{isBn ? "উত্তরবঙ্গ (৮টি জেলা)" : "North Bengal (8 Districts)"}</option>
              <option value="South Bengal">{isBn ? "দক্ষিণবঙ্গ (১৫টি জেলা)" : "South Bengal (15 Districts)"}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setSelectedRegion("ALL");
              }}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded p-2 text-white/80 hover:text-white transition text-center uppercase tracking-wider"
            >
              {isBn ? "ফিল্টার মুছুন" : "Reset Filters"}
            </button>
          </div>
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((d) => (
          <Link
            key={d.code}
            href={`/${locale}/districts/${d.code}`}
            className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm hover:shadow-md hover:border-[#E8620A]/50 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-[#E8620A] bg-[#FFF3E8] px-2 py-0.5 rounded border border-[#E8620A]/30">
                  {d.code}
                </span>
                <span className="font-mono text-[10px] text-stone-500 uppercase">
                  {d.region}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-ink group-hover:text-[#E8620A] transition">
                {isBn ? d.nameBn : d.nameEn}
              </h3>

              <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div>
                  <span className="text-[9px] uppercase text-stone-400 block">
                    {isBn ? "জনসংখ্যা" : "Pop"}
                  </span>
                  <span className="font-bold text-ink block mt-0.5">
                    {isBn ? toBengaliNumerals(d.population) : d.population}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-stone-400 block">
                    {isBn ? "জিএসডিপি" : "GSDP"}
                  </span>
                  <span className="font-bold text-[#1A6B2A] block mt-0.5">
                    {isBn ? toBengaliNumerals(d.gsdpShare) : d.gsdpShare}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-stone-400 block">
                    {isBn ? "প্রকল্প" : "Projects"}
                  </span>
                  <span className="font-bold text-[#E8620A] block mt-0.5">
                    {isBn ? toBengaliNumerals(d.projects) : d.projects}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-[#E8620A] font-semibold">
              <span>{isBn ? "জেলার বিস্তারিত দেখুন" : "View District Indicators"}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
