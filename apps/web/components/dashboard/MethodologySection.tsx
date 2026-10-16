"use client";

import React from "react";
import { useLocale } from "next-intl";

export default function MethodologySection() {
  const locale = useLocale();

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-emerald-950/10 my-8">
      <div className="pb-6 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
          ⚖️ {locale === "bn" ? "পদ্ধতিগত স্বচ্ছতা ও নীতি" : "Methodology & Governance"}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink">
          {locale === "bn"
            ? "সবাই ফাউন্ডেশন: নিরপেক্ষতা ও তথ্য যাচাই নীতি"
            : "Sabai Foundation: Platform Governance & Research Methodology"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
          {locale === "bn"
            ? "সবাই ফাউন্ডেশন একটি স্বাধীন নাগরিক তথ্য উদ্যোগ। এই প্ল্যাটফর্মটি পশ্চিমবঙ্গের দীর্ঘমেয়াদী অর্থনৈতিক প্রবৃদ্ধি, সামাজিক সূচক এবং উন্নয়নমূলক প্রতিশ্রুতির অগ্রগতি পরিমাপ করে। এটি কোনো সরকার, রাজনৈতিক দল বা নির্বাচন কর্তৃপক্ষের প্রতিনিধিত্ব করে না।"
            : "Sabai Foundation is an independent civic initiative. The platform tracks public commitments and measurable development indicators driving West Bengal's economic and social transformation toward a US$ 1 Trillion economy by 2033 and contributing to Viksit Bharat @2047. It does not represent any government, political party, or election authority."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {/* Pillar 1: Evidence Hierarchy */}
        <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3">
            A
          </div>
          <h3 className="font-bold text-ink text-base mb-2">
            {locale === "bn" ? "প্রমাণের স্তর ও নির্ভরযোগ্যতা" : "Evidence Hierarchy (Tiers A-D)"}
          </h3>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>
              <strong className="text-ink">Grade A:</strong> {locale === "bn" ? "অফিসিয়াল গেজেট, বাজেট বরাদ্দ, সিএজি রিপোর্ট।" : "Gazettes, budget allocations, CAG audits, RBI & MoSPI statistical releases."}
            </li>
            <li>
              <strong className="text-ink">Grade B:</strong> {locale === "bn" ? "প্রাতিষ্ঠানিক গবেষণা, নীতি আয়োগ ও স্বীকৃত অর্থনৈতিক গবেষণা।" : "NITI Aayog reports, verified institutional studies, and recognized media."}
            </li>
            <li>
              <strong className="text-ink">Grade C:</strong> {locale === "bn" ? "রাজনৈতিক বিবৃতি বা সামাজিক মাধ্যম ঘোষণা (যাচাই সাপেক্ষ)।" : "Public speeches or political press claims (not counted as fulfilled)."}
            </li>
            <li>
              <strong className="text-ink">Grade D:</strong> {locale === "bn" ? "নাগরিক প্রস্তাব বা যাচাইবিহীন তথ্য।" : "User submissions requiring human audit."}
            </li>
          </ul>
        </div>

        {/* Pillar 2: 11-Stage Status System */}
        <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm mb-3">
            ⚙️
          </div>
          <h3 className="font-bold text-ink text-base mb-2">
            {locale === "bn" ? "বাস্তবায়ন স্থিতির বৈজ্ঞানিক বিভাজন" : "Defensible Status Lifecycle"}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {locale === "bn"
              ? "শুধু 'পূরণ' বা 'বাকি' না বলে বাস্তবায়নের প্রতিটি পর্যায় চিহ্নিত করা হয়:"
              : "Moving beyond binary fulfilled/pending labels into evidence-backed governance stages:"}
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-800 font-medium">Not Started</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-medium">Announced</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-medium">Legally Initiated</span>
            <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-medium">Funded</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">Under Implementation</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium">Delivered</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-medium">Delayed</span>
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-medium">Disputed</span>
          </div>
        </div>

        {/* Pillar 3: Economic Target Model */}
        <div className="bg-gray-50/80 rounded-xl p-5 border border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm mb-3">
            📈
          </div>
          <h3 className="font-bold text-ink text-base mb-2">
            {locale === "bn" ? "$১ ট্রিলিয়ন হিসাবের পদ্ধতি" : "$1T Mathematical Formulation"}
          </h3>
          <div className="bg-white p-2.5 rounded-lg border font-mono text-xs text-purple-900 mb-2">
            GSDP(t) = GSDP(base) × (1 + g)^n
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {locale === "bn"
              ? "মুদ্রাস্ফীতি, জিএসডিপি ভিত্তি বছর, রুপী-ডলারের বিনিময় হারের অস্থিরতা এবং প্রকৃত উৎপাদন প্রবৃদ্ধিকে তিনটি পৃথক দৃশ্যপটে (রক্ষণশীল, ভিত্তিরেখা ও উচ্চাকাঙ্ক্ষী) প্রকাশ করা হয়।"
              : "Projections rigorously model base-year rebasing, nominal rupee inflation, USD exchange rate sensitivity, and real GVA across 3 transparent scenarios (Conservative, Base, Ambitious)."}
          </p>
        </div>
      </div>

      {/* Good Faith and Open Standards Grid from tracker.wbupdates.com */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 pt-6 border-t border-gray-200">
        <div className="bg-[#FFF3E8] p-5 rounded-xl border border-[#E8620A]/30">
          <h4 className="font-serif font-bold text-base text-[#1C1008] mb-2 flex items-center gap-2">
            <span>🤝</span>
            <span>{locale === "bn" ? "সৎ বিশ্বাসের অঙ্গীকার (A Note on Good Faith)" : "A Note on Good Faith"}</span>
          </h4>
          <p className="text-xs font-body text-[#4A3020] leading-relaxed">
            {locale === "bn"
              ? "এই ট্র্যাকারটি সম্পূর্ণ সৎ বিশ্বাসে তৈরি করা হয়েছে — আমরা নির্বাচিত সরকারকে জনগণের সামনে করা প্রতিশ্রুতিগুলোর প্রতি দায়বদ্ধ রাখায় বিশ্বাস করি, এবং আমরা চাই এই সরকার বাংলার মানুষের জন্য প্রতিশ্রুতিগুলো সফলভাবে পূরণ করুক। আমরা ব্যর্থতার প্রত্যাশা করি না।"
              : "This tracker was created with genuine good faith — we believe in holding elected governments accountable to the promises they made publicly, and we want this government to succeed in fulfilling them for the people of West Bengal. We are not here to root for failure."}
          </p>
          <p className="text-xs font-body text-[#4A3020] mt-2 italic">
            {locale === "bn"
              ? "আমরা সাধারণ নাগরিক, সাংবাদিক নই। কোনো খবর আমাদের নজর এড়িয়ে যেতে পারে। আপনি যদি মাঠ পর্যায়ের কোনো অগ্রগতি জানেন — অনুগ্রহ করে আমাদের জানান।"
              : "We are citizens, not journalists. There is a possibility that we miss news or updates. If you know that something has started, fulfilled, or stalled — please submit evidence."}
          </p>
        </div>

        <div className="bg-[#F7F0E4] p-5 rounded-xl border border-[#D4C4B0]">
          <h4 className="font-serif font-bold text-base text-[#1C1008] mb-2 flex items-center gap-2">
            <span>📄</span>
            <span>{locale === "bn" ? "অফিসিয়াল ইস্তাহার ও মুক্ত উৎস" : "Official Manifesto & Open Source"}</span>
          </h4>
          <p className="text-xs font-body text-[#4A3020] leading-relaxed mb-3">
            {locale === "bn"
              ? "যেকোনো নাগরিক বা জেলা গবেষক এই ট্র্যাকারের সোর্স কোড ব্যবহার করে নিজস্ব জেলা বা নির্বাচনী এলাকার জন্য ট্র্যাকার হোস্ট করতে পারেন।"
              : "Anyone can maintain their own accountability version for their district or constituency. Source code and methodology are open."}
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            <a
              href="https://www.bjp.org/files/election-manifesto-documents/Bhoroshar-Shopoth-EN-WB.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E8620A] hover:underline flex items-center gap-1.5"
            >
              <span>📄</span>
              <span>{locale === "bn" ? "অফিসিয়াল ইস্তাহার ডাউনলোড (English PDF) →" : "Read Official Manifesto (English PDF) →"}</span>
            </a>
            <a
              href="https://www.bjp.org/files/inline-documents/Bhorosha-Shopath-Bangla.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E8620A] hover:underline flex items-center gap-1.5"
            >
              <span>📄</span>
              <span>{locale === "bn" ? "অফিসিয়াল ইস্তাহার ডাউনলোড (বাংলা PDF) →" : "Read Official Manifesto (Bengali PDF) →"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Citizen Submission & Correction Banner */}
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-ink text-sm sm:text-base">
            {locale === "bn" ? "আপনার কাছে কি সরকারি প্রমাণ বা গেজেট বিজ্ঞপ্তি রয়েছে?" : "Have official documents or verified evidence to submit?"}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locale === "bn"
              ? "নাগরিক ও গবেষকদের তথ্য আমাদের টিম সিএজি ও গেজেট নোটিফিকেশনের সাথে মিলিয়ে প্রকাশ করে।"
              : "Researchers review public submissions against state assembly records, tenders, and gazettes before publication."}
          </p>
        </div>

        <a
          href="mailto:evidence@sabai.foundation"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-emerald-950 transition-colors shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {locale === "bn" ? "প্রমাণ জমা দিন (Submit Evidence)" : "Submit Evidence →"}
        </a>
      </div>
    </section>
  );
}
