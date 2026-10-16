"use client";

import React from "react";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface StatsProps {
  totalPromises?: number;
  fulfilled?: number;
  inProgress?: number;
  evaded?: number;
  pending?: number;
  districtsCount?: number;
  evidenceCount?: number;
}

export default function StatsBand({
  totalPromises = 120,
  fulfilled = 14,
  inProgress = 42,
  evaded = 3,
  pending = 61,
  districtsCount = 23,
  evidenceCount = 342,
}: StatsProps) {
  const locale = useLocale();
  const isBn = locale === "bn";

  const format = (val: number | string) => {
    return isBn ? toBengaliNumerals(val) : val.toString();
  };

  const fulfilledPct = Math.round((fulfilled / totalPromises) * 100) || 0;
  const inProgressPct = Math.round((inProgress / totalPromises) * 100) || 0;
  const evadedPct = Math.round((evaded / totalPromises) * 100) || 0;
  const pendingPct = 100 - (fulfilledPct + inProgressPct + evadedPct);

  return (
    <section aria-label="Key Performance Statistics" className="my-6">
      <div className="bg-[#F7F0E4] border-t-2 border-b-4 border-[#E8620A] rounded-xl shadow-md p-6 border-x border-[#D4C4B0]">
        {/* Top 6 Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#D4C4B0] text-center gap-y-4">
          {/* Total Promises */}
          <div className="px-3 py-2 flex flex-col justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-[#1C1008] leading-tight">
              {format(totalPromises)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C7060] mt-1 font-semibold">
              {isBn ? "মোট প্রতিশ্রুতি" : "Total Promises"}
            </span>
          </div>

          {/* Fulfilled */}
          <div className="px-3 py-2 flex flex-col justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-[#1A6B2A] leading-tight">
              {format(fulfilled)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#1A6B2A] mt-1 font-bold">
              {isBn ? "পূরণ হয়েছে ✓" : "Fulfilled ✓"}
            </span>
          </div>

          {/* In Progress */}
          <div className="px-3 py-2 flex flex-col justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-[#D4860A] leading-tight">
              {format(inProgress)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#D4860A] mt-1 font-bold">
              {isBn ? "চলমান রূপায়ণ ◑" : "In Progress ◑"}
            </span>
          </div>

          {/* Evaded */}
          <div className="px-3 py-2 flex flex-col justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-[#C0392B] leading-tight">
              {format(evaded)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#C0392B] mt-1 font-bold">
              {isBn ? "এড়ানো হয়েছে ✗" : "Evaded ✗"}
            </span>
          </div>

          {/* Pending */}
          <div className="px-3 py-2 flex flex-col justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-[#8C7060] leading-tight">
              {format(pending)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8C7060] mt-1 font-semibold">
              {isBn ? "অপেক্ষমান ○" : "Pending ○"}
            </span>
          </div>

          {/* Completion Rate */}
          <div className="px-3 py-2 flex flex-col justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-[#E8620A] leading-tight">
              {format(fulfilledPct)}%
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#E8620A] mt-1 font-bold">
              {isBn ? "সম্পন্নতার হার" : "Completion Rate"}
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar with WCAG 2.2 AA ARIA */}
        <div className="mt-6 pt-5 border-t border-[#D4C4B0]">
          <div className="flex justify-between items-center text-xs font-mono text-[#4A3020] mb-2">
            <span className="font-bold uppercase tracking-wider">
              {isBn ? "প্রতিশ্রুতি বিতরণ রূপরেখা (২০২৬-২০৩১)" : "Delivery Progression Timeline (2026–2031)"}
            </span>
            <span className="font-semibold text-[#E8620A]">
              {format(fulfilledPct + inProgressPct)}% {isBn ? "সক্রিয় অগ্রগতি" : "Actioned"}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={fulfilledPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={isBn ? "প্রতিশ্রুতি বাস্তবায়ন অগ্রগতি" : "Promise Implementation Progress"}
            className="h-3 w-full bg-[#D4C4B0]/40 rounded-full overflow-hidden flex shadow-inner"
          >
            {/* Fulfilled segment */}
            <div
              style={{ width: `${fulfilledPct}%` }}
              className="bg-[#1A6B2A] transition-all duration-1000 relative group"
              title={`Fulfilled: ${fulfilledPct}%`}
            />
            {/* In Progress segment */}
            <div
              style={{ width: `${inProgressPct}%` }}
              className="bg-[#D4860A] transition-all duration-1000 relative group"
              title={`In Progress: ${inProgressPct}%`}
            />
            {/* Evaded segment */}
            <div
              style={{ width: `${evadedPct}%` }}
              className="bg-[#C0392B] transition-all duration-1000 relative group"
              title={`Evaded: ${evadedPct}%`}
            />
          </div>

          {/* Legend Dots */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-3 font-mono text-[11px] text-[#4A3020]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A6B2A]" />
                {isBn ? "পূরণ হয়েছে" : "Fulfilled"} ({format(fulfilled)})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4860A]" />
                {isBn ? "চলমান" : "In Progress"} ({format(inProgress)})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                {isBn ? "এড়ানো হয়েছে" : "Evaded"} ({format(evaded)})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4C4B0]" />
                {isBn ? "অপেক্ষমান" : "Pending"} ({format(pending)})
              </span>
            </div>

            <div className="text-[10px] text-[#8C7060]">
              {isBn ? `${format(districtsCount)}টি জেলা · ${format(evidenceCount)}টি নথি` : `${districtsCount} Districts · ${evidenceCount} Evidence Citations`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}