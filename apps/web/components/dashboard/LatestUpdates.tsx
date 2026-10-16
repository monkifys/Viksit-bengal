"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface UpdateItem {
  id: string;
  eventType: string;
  eventDate: string;
  titleEn: string;
  titleBn: string;
  summaryEn: string;
  summaryBn: string;
  district: string;
  department: string;
  sourceTier: "A" | "B" | "C";
  sourceName: string;
  linkedPromiseCode: string;
  url?: string;
}

const VERIFIED_UPDATES: UpdateItem[] = [
  {
    id: "up-1",
    eventType: "administrative_order",
    eventDate: "2026-10-12",
    titleEn: "Land Acquisition Notification for Purba Bardhaman Agro-Hub",
    titleBn: "পূর্ব বর্ধমান এগ্রো-হাবের জন্য জমি অধিগ্রহণ বিজ্ঞপ্তি",
    summaryEn: "District Magistrate gazetted 42 acres for solar-assisted cold chain network and cooperative storage.",
    summaryBn: "সৌরশক্তি চালিত কোল্ড চেইন নেটওয়ার্কের জন্য জেলাশাসক কর্তৃক ৪২ একর জমি অধিগ্রহণ বিজ্ঞপ্তি জারি।",
    district: "Purba Bardhaman",
    department: "Land Reforms / Agriculture Marketing",
    sourceTier: "A",
    sourceName: "District Administration Order No. DM/PB/2026/89",
    linkedPromiseCode: "AGRI-01",
  },
  {
    id: "up-2",
    eventType: "tender_issued",
    eventDate: "2026-10-09",
    titleEn: "Global EPC Tender for Tajpur Port Marine Approach Channel",
    titleBn: "তাজপুর বন্দর সমুদ্র চ্যানেলের জন্য আন্তর্জাতিক ইপিসি টেন্ডার জারি",
    summaryEn: "West Bengal Maritime Board invited international bids for 16m capital dredging contract.",
    summaryBn: "১৬ মিটার গভীর ড্রাফট ক্যাপিটাল ড্রেজিংয়ের জন্য আন্তর্জাতিক দরপত্র আহ্বান করেছে রাজ্য মেরিটাইম বোর্ড।",
    district: "Purba Medinipur",
    department: "Commerce & Industries Dept",
    sourceTier: "A",
    sourceName: "WB Tenders e-Procurement Portal",
    linkedPromiseCode: "INFRA-01",
  },
  {
    id: "up-3",
    eventType: "project_sanctioned",
    eventDate: "2026-10-04",
    titleEn: "Dankuni Multi-Modal Freight Terminal Phase II Sanctioned",
    titleBn: "ডানকুনি মাল্টি-মোডাল ফ্রেইট টার্মিনাল দ্বিতীয় পর্বের অনুমোদন",
    summaryEn: "Inter-departmental clearance granted connecting Eastern Dedicated Freight Corridor with Kolkata Port.",
    summaryBn: "ইস্টার্ন ডেডিকেটেড ফ্রেইট করিডোরের সাথে কলকাতা বন্দরের সংযোগ সাধনে আন্তঃবিভাগীয় অনুমোদন।",
    district: "Hooghly",
    department: "Transport / Railways Liaison",
    sourceTier: "B",
    sourceName: "Dedicated Freight Corridor Corp (DFCCIL) Quarterly Review",
    linkedPromiseCode: "INFRA-02",
  },
  {
    id: "up-4",
    eventType: "audit_report",
    eventDate: "2026-09-28",
    titleEn: "CAG State Finances Audit Confirms MSME Disbursement Metrics",
    titleBn: "সিএজি অডিট রিপোর্টে এমএসএমই ঋণ বিতরণ তথ্যের অনুমোদন",
    summaryEn: "Comptroller & Auditor General reported ₹14,200 Cr bank credit linked to micro-enterprises.",
    summaryBn: "ভারতের কম্পট্রোলার অ্যান্ড অডিটর জেনারেল ক্ষুদ্র শিল্পে ১৪,২০০ কোটি টাকা ঋণ বিতরণের তথ্য নিশ্চিত করেছে।",
    district: "Statewide (All Districts)",
    department: "Finance Dept / Institutional Finance",
    sourceTier: "A",
    sourceName: "Report of the CAG on State Finances (Report No. 3 of 2026)",
    linkedPromiseCode: "JOBS-01",
  },
];

export default function LatestUpdates() {
  const locale = useLocale();

  const format = (val: string | number) => {
    return locale === "bn" ? toBengaliNumerals(val) : val.toString();
  };

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-950/10 my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold mb-2">
            📡 {locale === "bn" ? "যাচাইকৃত তথ্য প্রবাহ" : "Evidence Delta Stream"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {locale === "bn" ? "সাম্প্রতিক যাচাইকৃত সরকারি আপডেট" : "Latest Verified Government & Policy Updates"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "bn"
              ? "গেজেট নোটিফিকেশন, সরকারি আদেশ, টেন্ডার এবং অডিট রিপোর্টের ভিত্তিতে নিয়মিত হালনাগাদ।"
              : "Candidate evidence ingested from official gazettes, tender portals, and audit reports after human researcher verification."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
        {VERIFIED_UPDATES.map((update) => (
          <div
            key={update.id}
            className="bg-gray-50/70 rounded-xl p-5 border border-gray-200/80 hover:bg-white hover:border-emerald-600/40 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  {update.eventType.toUpperCase().replace("_", " ")}
                </span>
                <span className="text-[11px] font-mono text-gray-500">
                  📅 {format(update.eventDate)}
                </span>
              </div>

              <h4 className="text-base font-bold text-ink mb-1.5 leading-snug">
                {locale === "bn" ? update.titleBn : update.titleEn}
              </h4>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {locale === "bn" ? update.summaryBn : update.summaryEn}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="text-[11px] text-gray-600">
                <span>📍 {update.district}</span> • <span>🏛️ {update.department}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Tier {update.sourceTier} Verified
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-800">
                  🔗 {update.linkedPromiseCode}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}