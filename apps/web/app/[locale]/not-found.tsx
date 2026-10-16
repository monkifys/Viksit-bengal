"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function NotFound() {
  const locale = useLocale() || "en";
  const isBn = locale === "bn";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 shadow-sm text-center space-y-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-[#E8620A] text-2xl font-mono font-bold">
          404
        </div>

        <h1 className="font-serif text-2xl font-black text-ink">
          {isBn ? "পৃষ্ঠাটি খুঁজে পাওয়া যায়নি" : "Page Not Found"}
        </h1>

        <p className="font-body text-sm text-stone-600">
          {isBn
            ? "আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত বা পরিবর্তিত হয়েছে। অনুগ্রহ করে নিচের মূল লিঙ্কগুলির মাধ্যমে অন্বেষণ করুন।"
            : "The page you are looking for does not exist or has been relocated. Please use the quick links below to continue exploring."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs font-mono font-bold">
          <Link
            href={`/${locale}`}
            className="p-3 rounded bg-ink text-white hover:bg-[#E8620A] transition-colors"
          >
            {isBn ? "🏛️ হোম ড্যাশবোর্ড" : "🏛️ Home Dashboard"}
          </Link>
          <Link
            href={`/${locale}/promises`}
            className="p-3 rounded bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
          >
            {isBn ? "📋 প্রতিশ্রুতি রেজিস্টার" : "📋 All Promises"}
          </Link>
          <Link
            href={`/${locale}/districts`}
            className="p-3 rounded bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
          >
            {isBn ? "🗺️ ২৩টি জেলা" : "🗺️ 23 Districts"}
          </Link>
          <Link
            href={`/${locale}/indicators`}
            className="p-3 rounded bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
          >
            {isBn ? "📈 $১ ট্রিলিয়ন লক্ষ্য" : "📈 $1T Indicators"}
          </Link>
        </div>
      </div>
    </div>
  );
}
