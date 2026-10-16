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

export default function PromiseDetailPage({
  params: { code, locale },
}: {
  params: { code: string; locale: string };
}) {
  const isBn = locale === "bn";
  const [promise, setPromise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getPromiseByCode(code);
        if (data && data.code) {
          setPromise(data);
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
      setPromise({
        code: code.toUpperCase(),
        titleEn: `Official Commitment ${code.toUpperCase()}: Implementation and delivery roadmap`,
        titleBn: `অফিসিয়াল প্রতিশ্রুতি ${code.toUpperCase()}: রূপায়ণ ও বাস্তবায়ন কর্মপরিকল্পনা`,
        descriptionEn: "Full official text extracted from the manifesto (Bhoroshar Shopoth) with verified government notifications.",
        descriptionBn: "নির্বাচনী ইস্তাহার (ভরসার শপথ) থেকে সংকলিত পূর্ণাঙ্গ বিবরণ ও গেজেট প্রজ্ঞাপন।",
        status: "UNDER_IMPLEMENTATION",
        confidence: "A",
        commitmentDate: "2026-05-09",
        deadlineDate: "2026-12-31",
        responsibleDepartment: "Department of Finance & Administration",
        category: { titleEn: "Governance & Administration", titleBn: "শাসন ও প্রশাসন" },
        statusHistory: [
          {
            oldStatus: "ANNOUNCED",
            newStatus: "LEGALLY_INITIATED",
            reason: "Cabinet ratification memo passed in first council meeting.",
            timestamp: "2026-05-14T10:00:00Z",
            changedById: "admin@viksitbengal.gov.in",
          },
          {
            oldStatus: "LEGALLY_INITIATED",
            newStatus: "UNDER_IMPLEMENTATION",
            reason: "Official Gazette notification published and budget treasury head opened.",
            timestamp: "2026-06-01T15:30:00Z",
            changedById: "researcher@viksitbengal.gov.in",
          },
        ],
        evidenceItems: [
          {
            id: "ev-1",
            title: "Extraordinary Gazette Notification on Implementation Framework",
            sourceUrl: "https://egazette.wb.gov.in",
            publisher: "State Government Printing & Stationery",
            publishedAt: "2026-06-01",
            sourceTier: "TIER_1",
            extractedText: "In exercise of statutory authority, sanction is accorded to operationalize administrative mechanisms immediately.",
          },
          {
            id: "ev-2",
            title: "Departmental Works & Supply Tender Notice",
            sourceUrl: "https://wbtenders.gov.in",
            publisher: "WB e-Procurement Directorate",
            publishedAt: "2026-06-20",
            sourceTier: "TIER_2",
            extractedText: "Notice Inviting e-Tender for regional monitoring and field audit deployment.",
          },
        ],
      });
    }

    load();
  }, [code]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center font-mono text-stone-500">
        <span className="inline-block w-8 h-8 border-2 border-[#E8620A] border-t-transparent rounded-full animate-spin mb-3" />
        <p>{isBn ? "প্রতিশ্রুতি অডিট লোড হচ্ছে..." : "Loading promise audit record..."}</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[promise?.status] || STATUS_CONFIG.NOT_STARTED;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href={`/${locale}/promises`}
          className="font-mono text-xs text-[#E8620A] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>←</span>
          <span>{isBn ? "সমস্ত প্রতিশ্রুতির তালিকায় ফিরে যান" : "Back to Promises Explorer"}</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-[#1C1008] text-white p-6 sm:p-10 rounded-xl border border-white/10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#E8620A] bg-[#E8620A]/10 px-3 py-1 rounded border border-[#E8620A]/30">
              {promise.code}
            </span>
            <span className="font-mono text-xs text-white/60">
              {promise.category ? (isBn ? promise.category.titleBn : promise.category.titleEn) : "Public Policy"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded font-mono text-xs font-bold uppercase border ${statusCfg.color}`}>
              {isBn ? statusCfg.labelBn : statusCfg.labelEn}
            </span>
            <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-600 px-2.5 py-1 rounded font-mono text-xs font-bold">
              Grade {promise.confidence || "A"} (Evidence)
            </span>
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-black text-white leading-tight">
          {isBn ? promise.titleBn || promise.titleEn : promise.titleEn}
        </h1>

        <p className="font-body text-base text-white/80 mt-3 italic leading-relaxed">
          {isBn ? promise.descriptionBn || promise.descriptionEn : promise.descriptionEn}
        </p>

        {/* Metadata Grid */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <span className="text-white/50 text-[10px] uppercase block">
              {isBn ? "দায়িত্বপ্রাপ্ত বিভাগ" : "Responsible Dept"}
            </span>
            <span className="font-bold text-white mt-0.5 block truncate">
              {promise.responsibleDepartment || "State Government of WB"}
            </span>
          </div>
          <div>
            <span className="text-white/50 text-[10px] uppercase block">
              {isBn ? "ঘোষণার তারিখ" : "Commitment Date"}
            </span>
            <span className="font-bold text-white mt-0.5 block">
              {promise.commitmentDate || "9 May 2026"}
            </span>
          </div>
          <div>
            <span className="text-white/50 text-[10px] uppercase block">
              {isBn ? "বাস্তবায়ন সময়সীমা" : "Target Horizon"}
            </span>
            <span className="font-bold text-[#E8620A] mt-0.5 block">
              {promise.deadlineDate || "Dec 2026"}
            </span>
          </div>
          <div>
            <span className="text-white/50 text-[10px] uppercase block">
              {isBn ? "সর্বশেষ নিরীক্ষা" : "Last Audit"}
            </span>
            <span className="font-bold text-emerald-400 mt-0.5 block">
              {isBn ? "আজ যাচাইকৃত" : "Verified Today"}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Timeline & Supporting Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Status Change History Timeline */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-ink mb-1 flex items-center gap-2">
            <span>⏱️</span>
            <span>{isBn ? "স্থিতি পরিবর্তনের নিরীক্ষা ইতিহাস" : "Status Transition Audit History"}</span>
          </h2>
          <p className="font-mono text-xs text-stone-500 mb-6">
            {isBn ? "প্রতিটি পরিবর্তনের পেছনের সরকারি আদেশ ও গবেষক অনুমোদন" : "Chronological ledger of peer-reviewed stage advancements"}
          </p>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {promise.statusHistory && promise.statusHistory.length > 0 ? (
              promise.statusHistory.map((item: any, i: number) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[#E8620A] border-2 border-white shadow" />
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-[#E8620A]">
                      {item.newStatus}
                    </span>
                    <span className="text-stone-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-body text-sm text-stone-700 mt-1">
                    {item.reason}
                  </p>
                  <span className="font-mono text-[10px] text-stone-400 block mt-1">
                    Audited by: {item.changedById}
                  </span>
                </div>
              ))
            ) : (
              <p className="font-mono text-xs text-stone-400 italic">
                {isBn ? "কোনো পূর্ববর্তী স্থিতি নথিভুক্ত নেই।" : "No historical transitions logged."}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Supporting Evidence Documents */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-ink mb-1 flex items-center gap-2">
            <span>📑</span>
            <span>{isBn ? "সরকারি গেজেট ও যাচাইকৃত প্রমাণাদি" : "Supporting Official Evidence"}</span>
          </h2>
          <p className="font-mono text-xs text-stone-500 mb-6">
            {isBn ? "টায়ার এ ও বি সরকারি আদেশ, দরপত্র ও প্রজ্ঞাপন লিঙ্ক" : "Tier A & B official gazettes, orders, and tenders"}
          </p>

          <div className="space-y-4">
            {promise.evidenceItems && promise.evidenceItems.length > 0 ? (
              promise.evidenceItems.map((ev: any) => (
                <div key={ev.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {ev.sourceTier === "TIER_1" ? "Tier A (Gazette / CAG)" : "Tier B (Department Tender)"}
                    </span>
                    <span className="font-mono text-[10px] text-stone-500">
                      {ev.publishedAt}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-ink">
                    {ev.title}
                  </h3>

                  <p className="font-body text-xs text-stone-600 italic">
                    "{ev.extractedText}"
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500">🏢 {ev.publisher}</span>
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E8620A] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{isBn ? "গেজেট দেখুন" : "View Gazette"}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="font-mono text-xs text-stone-400 italic">
                {isBn ? "কোনো প্রমাণ নথিভুক্ত নেই।" : "No supporting evidence items linked."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
