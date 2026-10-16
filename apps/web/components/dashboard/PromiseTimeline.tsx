"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";
import { PromiseItem } from "./PromiseCard";

interface TimelineEvent {
  status: string;
  statusBn: string;
  date: string;
  titleEn: string;
  titleBn: string;
  commentEn: string;
  commentBn: string;
  sourceType: string;
  sourceTier: "A" | "B" | "C";
  sourceName: string;
  sourceUrl?: string;
}

interface PromiseTimelineProps {
  promise?: PromiseItem;
  onClose?: () => void;
}

const DEFAULT_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    status: "DELIVERED",
    statusBn: "বাস্তবায়িত",
    date: "2026-08-14",
    titleEn: "Operational Clearance & Land Allotment Completed",
    titleBn: "কার্যকরী ছাড়পত্র ও ভূমি বরাদ্দ সম্পন্ন",
    commentEn: "Formal gazette notification published sanctioning port terminal phase 1 construction.",
    commentBn: "বন্দর টার্মিনাল প্রথম পর্ব নির্মাণের জন্য আনুষ্ঠানিক গেজেট বিজ্ঞপ্তি প্রকাশিত।",
    sourceType: "Government Gazette",
    sourceTier: "A",
    sourceName: "West Bengal Official Gazette No. WB/4092",
    sourceUrl: "https://egazette.wb.gov.in",
  },
  {
    status: "UNDER_IMPLEMENTATION",
    statusBn: "বাস্তবায়নাধীন",
    date: "2026-05-10",
    titleEn: "Tender Issued for Deep-Draft Channel Dredging",
    titleBn: "গভীর ড্রাফট চ্যানেল ড্রেজিং-এর টেন্ডার জারি",
    commentEn: "Global engineering procurement and construction tender issued with ₹3,200 Cr outlay.",
    commentBn: "৩,২০০ কোটি টাকার আন্তর্জাতিক ইঞ্জিনিয়ারিং ও নির্মাণ দরপত্র আহ্বান।",
    sourceType: "Public Tender Portal",
    sourceTier: "A",
    sourceName: "WBTenders Portal / Infrastructure Branch",
    sourceUrl: "https://wbtenders.gov.in",
  },
  {
    status: "FUNDED",
    statusBn: "অর্থ বরাদ্দ",
    date: "2026-02-12",
    titleEn: "Budget Allocation in State Budget 2026-27",
    titleBn: "২০২৬-২৭ রাজ্য বাজেটে তহবিল মঞ্জুর",
    commentEn: "Appropriation bill sanctioned dedicated capital expenditure of ₹4,500 Cr.",
    commentBn: "বিনিময় বিলে ৪,৫০০ কোটি টাকার সুনির্দিষ্ট মূলধনী ব্যয় মঞ্জুর করা হয়েছে।",
    sourceType: "Budget Document",
    sourceTier: "A",
    sourceName: "Finance Department, Govt. of West Bengal",
    sourceUrl: "https://wbfin.gov.in/budget",
  },
  {
    status: "ANNOUNCED",
    statusBn: "ঘোষিত",
    date: "2026-01-05",
    titleEn: "Viksit Bengal Economic Corridor Roadmap Unveiled",
    titleBn: "বিকশিত বাংলা অর্থনৈতিক করিডোর রূপরেখা ঘোষণা",
    commentEn: "Formal policy commitment presented in state assembly economic vision address.",
    commentBn: "বিধানসভায় অর্থনৈতিক রূপকল্প ভাষণে নীতিগত অঙ্গীকার উপস্থাপিত।",
    sourceType: "Assembly Proceedings",
    sourceTier: "B",
    sourceName: "Legislative Assembly Secretariat",
  },
];

export default function PromiseTimeline({ promise, onClose }: PromiseTimelineProps) {
  const t = useTranslations("PromiseTimeline");
  const locale = useLocale();

  const activePromise = promise || {
    id: "prom-tajpur",
    code: "INFRA-01",
    categoryId: "cat-infra",
    categoryNameEn: "Infrastructure & Ports",
    categoryNameBn: "অবকাঠামো ও বন্দর",
    titleEn: "Tajpur Deep Sea Port Modernization & Maritime Hub",
    titleBn: "তাজপুর গভীর সমুদ্র বন্দর আধুনিকীকরণ ও সামুদ্রিক হাব",
    descriptionEn: "Development of 16-meter deep draft automated green port handling 60 MTPA.",
    descriptionBn: "১৬ মিটার গভীর ড্রাফটের স্বয়ংক্রিয় গ্রিন বন্দর ও ৬০ এমটিপিএ পণ্য পরিবহন ক্ষমতা।",
    responsibleDepartment: "Commerce & Industries / Transport Dept",
    status: "UNDER_IMPLEMENTATION" as const,
    confidence: "A" as const,
    evidenceCount: 4,
  };

  const format = (val: string | number) => {
    return locale === "bn" ? toBengaliNumerals(val) : val.toString();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              {activePromise.code}
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              {locale === "bn" ? activePromise.categoryNameBn : activePromise.categoryNameEn}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-ink">
            {locale === "bn" ? activePromise.titleBn : activePromise.titleEn}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            🏛️ {activePromise.responsibleDepartment} | {locale === "bn" ? "প্রমাণ নির্ভরযোগ্যতা:" : "Evidence Grade:"} <strong>Grade {activePromise.confidence}</strong>
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 self-start"
            aria-label="Close timeline view"
          >
            ✕
          </button>
        )}
      </div>

      {/* Chronological Timeline Trail */}
      <div className="my-6 relative pl-6 sm:pl-8 before:absolute before:top-2 before:bottom-2 before:left-2.5 sm:before:left-3.5 before:w-0.5 before:bg-emerald-200">
        {DEFAULT_TIMELINE_EVENTS.map((event, index) => (
          <div key={index} className="relative mb-8 last:mb-2 group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                index === 0 ? "bg-primary ring-2 ring-emerald-500" : "bg-emerald-600"
              }`}
            />

            <div className="bg-gray-50/80 rounded-xl p-4 sm:p-5 border border-gray-200/80 hover:bg-white hover:border-emerald-600/40 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-800">
                  {locale === "bn" ? event.statusBn : event.status}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  📅 {format(event.date)}
                </span>
              </div>

              <h4 className="text-base font-bold text-ink mb-1.5">
                {locale === "bn" ? event.titleBn : event.titleEn}
              </h4>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                {locale === "bn" ? event.commentBn : event.commentEn}
              </p>

              {/* Verified Source Document Citation */}
              <div className="pt-2.5 border-t border-gray-200/60 flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Tier {event.sourceTier}: {event.sourceType}
                  </span>
                  <span className="text-gray-600 truncate max-w-[280px]" title={event.sourceName}>
                    {event.sourceName}
                  </span>
                </div>

                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-emerald-950 font-semibold inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>{locale === "bn" ? "সরকারি নথি দেখুন" : "View Official Record"}</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
