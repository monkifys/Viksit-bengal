import React from "react";
import Link from "next/link";
import CategorizedManifesto from "@/components/dashboard/CategorizedManifesto";
import CategoryNav from "@/components/dashboard/CategoryNav";

export default function ManifestoPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const isBn = locale === "bn";

  return (
    <div className="space-y-8 py-6">
      {/* Breadcrumb / Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
          <Link href={`/${locale}`} className="hover:text-[#E8620A] transition-colors">
            {isBn ? "হোম" : "Home"}
          </Link>
          <span>/</span>
          <span className="text-ink font-bold">
            {isBn ? "১৫টি নির্বাচনী ইস্তাহার অধ্যায়" : "15 Official Manifesto Chapters"}
          </span>
        </div>

        <div className="mt-4 border-b border-stone-200 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E8620A] bg-[#E8620A]/10 px-3 py-1 rounded">
                {isBn ? "নির্বাচনী ইস্তাহার রেজিস্টার" : "Official Manifesto Register"}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-black text-ink mt-2">
                {isBn ? "১৫টি অধ্যায়ভিত্তিক সরকারি অঙ্গীকার" : "15 Sectoral Manifesto Chapters"}
              </h1>
              <p className="font-body text-stone-600 mt-2 max-w-3xl text-sm sm:text-base">
                {isBn
                  ? "পশ্চিমবঙ্গ বিধানসভা নির্বাচন ২০২৬-এর 'ভরসার শপথ' ইস্তাহারের পূর্ণাঙ্গ অধ্যায়ভিত্তিক প্রতিশ্রুতি, সরকারি গেজেট প্রমাণাদি এবং বাস্তবায়ন অগ্রগতি নিরীক্ষা।"
                  : "Comprehensive sectoral register of the 'Bhoroshar Shopoth' 2026 election commitments, supporting government gazettes, and verified delivery status."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/promises`}
                className="font-mono text-xs font-bold px-4 py-2 bg-ink text-white rounded hover:bg-[#E8620A] transition-colors"
              >
                {isBn ? "প্রতিশ্রুতি ফিল্টার দেখুন →" : "Explore All Promises →"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Quick Nav */}
      <CategoryNav />

      {/* Main 15 Chapters Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategorizedManifesto />
      </div>
    </div>
  );
}
