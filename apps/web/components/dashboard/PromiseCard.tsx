"use client";

import React from "react";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

export type PromiseStatus =
  | "NOT_STARTED"
  | "ANNOUNCED"
  | "LEGALLY_INITIATED"
  | "FUNDED"
  | "UNDER_IMPLEMENTATION"
  | "PARTIALLY_DELIVERED"
  | "DELIVERED"
  | "DELAYED"
  | "REVERSED"
  | "DISPUTED"
  | "NOT_VERIFIABLE";

export interface PromiseItem {
  id: string;
  code: string;
  categoryId: string;
  categoryNameEn: string;
  categoryNameBn: string;
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  responsibleDepartment: string;
  status: PromiseStatus;
  confidence: "A" | "B" | "C" | "D";
  evidenceCount: number;
  deadlineDate?: string;
}

interface PromiseCardProps {
  promise: PromiseItem;
  onSelect?: (p: PromiseItem) => void;
  isSelected?: boolean;
}

const STATUS_CONFIG: Record<
  PromiseStatus,
  { labelEn: string; labelBn: string; colorClass: string; bgClass: string }
> = {
  NOT_STARTED: { labelEn: "Not Started", labelBn: "শুরু হয়নি", colorClass: "text-gray-700", bgClass: "bg-gray-100 border-gray-300" },
  ANNOUNCED: { labelEn: "Announced", labelBn: "ঘোষিত", colorClass: "text-blue-800", bgClass: "bg-blue-50 border-blue-200" },
  LEGALLY_INITIATED: { labelEn: "Legally Initiated", labelBn: "আইনত সূচিত", colorClass: "text-indigo-800", bgClass: "bg-indigo-50 border-indigo-200" },
  FUNDED: { labelEn: "Funded / Sanctioned", labelBn: "অর্থ বরাদ্দকৃত", colorClass: "text-teal-800", bgClass: "bg-teal-50 border-teal-200" },
  UNDER_IMPLEMENTATION: { labelEn: "Under Implementation", labelBn: "বাস্তবায়নাধীন", colorClass: "text-amber-800", bgClass: "bg-amber-50 border-amber-300" },
  PARTIALLY_DELIVERED: { labelEn: "Partially Delivered", labelBn: "আংশিক বাস্তবায়িত", colorClass: "text-emerald-800", bgClass: "bg-emerald-50 border-emerald-300" },
  DELIVERED: { labelEn: "Delivered", labelBn: "সম্পূর্ণ বাস্তবায়িত", colorClass: "text-white", bgClass: "bg-primary border-primary font-bold" },
  DELAYED: { labelEn: "Delayed", labelBn: "বিলম্বিত", colorClass: "text-rose-800", bgClass: "bg-rose-50 border-rose-300" },
  REVERSED: { labelEn: "Reversed / Withdrawn", labelBn: "প্রত্যাহারকৃত", colorClass: "text-purple-800", bgClass: "bg-purple-50 border-purple-200" },
  DISPUTED: { labelEn: "Disputed Claims", labelBn: "বিতর্কিত তথ্য", colorClass: "text-orange-800", bgClass: "bg-orange-50 border-orange-200" },
  NOT_VERIFIABLE: { labelEn: "Not Verifiable", labelBn: "যাচাই অযোগ্য", colorClass: "text-stone-700", bgClass: "bg-stone-100 border-stone-300" },
};

const CONFIDENCE_CONFIG = {
  A: { label: "Tier A (Primary Gazette/Govt)", badge: "A: Official Primary", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  B: { label: "Tier B (Institutional/Audited)", badge: "B: Credible Secondary", color: "bg-blue-100 text-blue-800 border-blue-300" },
  C: { label: "Tier C (Public Claim/Press)", badge: "C: Political Claim", color: "bg-amber-100 text-amber-800 border-amber-300" },
  D: { label: "Tier D (Unverified/Crowd)", badge: "D: Unverified", color: "bg-gray-100 text-gray-700 border-gray-300" },
};

export default function PromiseCard({ promise, onSelect, isSelected }: PromiseCardProps) {
  const locale = useLocale();
  const statusInfo = STATUS_CONFIG[promise.status] || STATUS_CONFIG.NOT_STARTED;
  const confInfo = CONFIDENCE_CONFIG[promise.confidence] || CONFIDENCE_CONFIG.D;

  const format = (val: string | number) => {
    return locale === "bn" ? toBengaliNumerals(val) : val.toString();
  };

  return (
    <div
      className={`bg-white rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? "border-primary ring-2 ring-primary shadow-md"
          : "border-gray-200/80 hover:border-emerald-600/50 hover:shadow-sm"
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-ink border border-gray-200">
              {promise.code}
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              {locale === "bn" ? promise.categoryNameBn : promise.categoryNameEn}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${confInfo.color}`}
              title={confInfo.label}
            >
              Grade {promise.confidence}
            </span>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.bgClass} ${statusInfo.colorClass}`}>
              {locale === "bn" ? statusInfo.labelBn : statusInfo.labelEn}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-bold text-ink leading-snug mb-2">
          {locale === "bn" ? promise.titleBn : promise.titleEn}
        </h4>

        {/* Description snippet */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {locale === "bn"
            ? promise.descriptionBn || "প্রতিশ্রুতির বিস্তারিত বিবরণ ও প্রমাণসমূহ পর্যালোচনাধীন।"
            : promise.descriptionEn || "Detailed commitments and milestone verification under review."}
        </p>
      </div>

      {/* Footer Meta & Action */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className="text-[11px] text-gray-500">
          <span>🏛️ {promise.responsibleDepartment}</span>
        </div>

        <button
          onClick={() => onSelect && onSelect(promise)}
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-emerald-950 transition-colors py-1 px-2 rounded hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px]"
          aria-label={`View evidence trail for ${promise.code}`}
        >
          <span>📑 {format(promise.evidenceCount)} {locale === "bn" ? "প্রমাণ" : "Evidence"}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}