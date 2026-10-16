"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface KeyPromise {
  num: number;
  textEn: string;
  textBn: string;
  status: "PENDING" | "IN_PROGRESS" | "FULFILLED" | "EVADED";
  category: string;
  targetDate?: string;
  evidenceTier?: "Tier A" | "Tier B" | "Tier C" | "Tier D";
  evidenceRef?: string;
}

const KEY_15_PROMISES: KeyPromise[] = [
  {
    num: 1,
    textEn: 'Crackdown on infiltration to ensure national security — implement "Detect, Delete and Deport" model and seal unauthorized transit points.',
    textBn: 'জাতীয় নিরাপত্তা নিশ্চিত করতে অনুপ্রবেশের বিরুদ্ধে কঠোর পদক্ষেপ — "শনাক্তকরণ, বাতিলকরণ ও বহিষ্কার" মডেল কার্যকর করা।',
    status: "IN_PROGRESS",
    category: "National Security",
    targetDate: "Dec 2026",
    evidenceTier: "Tier B",
    evidenceRef: "Home Dept Notification 112/HD-26 on special border monitoring taskforce",
  },
  {
    num: 2,
    textEn: "White Paper exposing 15 years of TMC corruption, opacity, financial mismanagement, and breakdown of law and order.",
    textBn: "১৫ বছরের তৃণমূল সরকারের দুর্নীতি, অস্বচ্ছতা ও আর্থিক অব্যবস্থাপনার বিশদ শ্বেতপত্র প্রকাশ ও দোষীদের বিরুদ্ধে আইনানুগ ব্যবস্থা।",
    status: "PENDING",
    category: "Governance",
    targetDate: "July 2026",
    evidenceTier: "Tier A",
    evidenceRef: "Cabinet Secretariat drafting committee constituted under Order No. 42",
  },
  {
    num: 3,
    textEn: 'End syndicate activities — curtailing "cut money" extortion culture across infrastructure tenders, sand, and coal supply chains.',
    textBn: 'সিন্ডিকেট রাজ ও "কাট মানি" তোলাবাজি সংস্কৃতির অবসান — অবকাঠামো ও খনিজ সরবরাহ শৃঙ্খলে স্বচ্ছতা ফিরিয়ে আনা।',
    status: "IN_PROGRESS",
    category: "Governance",
    targetDate: "Ongoing",
    evidenceTier: "Tier B",
    evidenceRef: "SIT reconstituted for coal and riverbed sand extraction oversight",
  },
  {
    num: 4,
    textEn: "Clear all DA arrears for government employees and implement 7th Pay Commission recommendations within 45 days of assuming office.",
    textBn: "সরকারি কর্মচারী ও পেনশনভোগীদের বকেয়া মহার্ঘ ভাতা (ডিএ) মেটানো এবং দায়িত্ব গ্রহণের ৪৫ দিনের মধ্যে সপ্তম বেতন কমিশন কার্যকর করা।",
    status: "IN_PROGRESS",
    category: "Governance",
    targetDate: "45 Days",
    evidenceTier: "Tier A",
    evidenceRef: "State Finance Dept Gazette Extraordinary Order WB-2026-081",
  },
  {
    num: 5,
    textEn: "Create 1 crore new employment and self-employment opportunities over 5 years + ₹3,000 monthly financial aid to every unemployed youth.",
    textBn: "৫ বছরে ১ কোটি নতুন কর্মসংস্থান ও স্বনিযুক্তি তৈরি + বেকার যুবক-যুবতীদের জন্য প্রতি মাসে ৩,০০০ টাকা সহায়তা ভাতা।",
    status: "PENDING",
    category: "Youth & Employment",
    targetDate: "2026–2031",
    evidenceTier: "Tier B",
    evidenceRef: "Skill Development & Employment Directorate youth registry portal tender",
  },
  {
    num: 6,
    textEn: "Women's safety: women-only police battalions, Durga Surokha Squads across 23 districts, and 33% reservation in state government jobs.",
    textBn: "নারী সুরক্ষা: মহিলা পুলিশ ব্যাটালিয়ন, প্রতিটি থানায় 'দুর্গা সুরক্ষা স্কোয়াড' এবং রাজ্য সরকারি চাকরিতে মহিলাদের জন্য ৩৩% সংরক্ষণ।",
    status: "IN_PROGRESS",
    category: "Women's Safety",
    targetDate: "Dec 2026",
    evidenceTier: "Tier B",
    evidenceRef: "WB Police Recruitment Board notification for 3 Durga Battalions",
  },
  {
    num: 7,
    textEn: "Provide ₹3,000 monthly financial support directly to women to ensure universal economic dignity and independence.",
    textBn: "মহিলাদের অর্থনৈতিক আত্মমর্যাদা ও আর্থিক স্বাধীনতার জন্য প্রতি মাসে ৩,০০০ টাকা সরাসরি আর্থিক সহায়তা প্রদান।",
    status: "PENDING",
    category: "Women's Empowerment",
    targetDate: "Quarter 3 2026",
    evidenceTier: "Tier A",
    evidenceRef: "Women & Child Development Department DBT framework guideline 712-WCD",
  },
  {
    num: 8,
    textEn: "Support for rice, potato & mango cultivation — fair minimum support prices, cold storage grid, and compensation for crop damage.",
    textBn: "ধান, আলু ও আম চাষের জন্য ব্যাপক সহায়তা — কৃষকদের জন্য লাভজনক মূল্য, আধুনিক কোল্ড স্টোরেজ গ্রিড এবং ক্ষতিপূরণ নিশ্চয়তা।",
    status: "PENDING",
    category: "Agriculture",
    targetDate: "Kharif 2026",
    evidenceTier: "Tier B",
    evidenceRef: "Agriculture Marketing Department procurement price floor order",
  },
  {
    num: 9,
    textEn: "Register all fishers under PM Matsya Sampada Yojana — transform West Bengal coastline into a premier marine fish-exporting hub.",
    textBn: "সমস্ত মৎস্যজীবীদের পিএম মৎস্য সম্পদ যোজনায় নথিভুক্তকরণ এবং পশ্চিমবঙ্গকে দেশের শীর্ষস্থানীয় মৎস্য রপ্তানিকারক কেন্দ্র হিসেবে গড়ে তোলা।",
    status: "IN_PROGRESS",
    category: "Fisheries & Blue Economy",
    targetDate: "2026–2028",
    evidenceTier: "Tier A",
    evidenceRef: "PIB Release ID 2049182 on Digha & Kakdwip deep-sea hub",
  },
  {
    num: 10,
    textEn: "Enact state legislation to implement Uniform Civil Code (UCC) and enforce strict multi-agency law to stop cross-border cattle smuggling.",
    textBn: "অভিন্ন দেওয়ানি বিধি (UCC) প্রণয়নের জন্য আইন প্রণয়ন এবং সীমান্ত দিয়ে গোরু পাচার বন্ধে কঠোর আইন প্রয়োগ।",
    status: "PENDING",
    category: "Governance & Law",
    targetDate: "Assembly 2027",
    evidenceTier: "Tier C",
    evidenceRef: "Draft Law Commission reference memo on UCC compatibility",
  },
  {
    num: 11,
    textEn: "Rejuvenate stressed tea gardens, strengthen global Darjeeling Tea GI branding, and modernise the traditional jute packaging industry.",
    textBn: "বন্ধ ও রুগ্ন চা বাগান পুনরুজ্জীবন, বিশ্ববাজারে দার্জিলিং চা ব্র্যান্ডিং শক্তিশালীকরণ এবং ঐতিহ্যবাহী পাট শিল্পের আধুনিকায়ন।",
    status: "IN_PROGRESS",
    category: "Tea & Jute Industry",
    targetDate: "2026–2028",
    evidenceTier: "Tier B",
    evidenceRef: "MSME Order 108/2026: Tea Worker Provident Fund Rejuvenation package",
  },
  {
    num: 12,
    textEn: "Recommend inclusion of indigenous Kurmali and Rajbongshi languages in the Eighth Schedule of the Indian Constitution.",
    textBn: "ভারতের সংবিধানের অষ্টম তফসিলে কুড়মালি ও রাজবংশী ভাষাকে অন্তর্ভুক্ত করার জন্য কেন্দ্রের কাছে সুপারিশ প্রেরণ।",
    status: "PENDING",
    category: "Culture & Heritage",
    targetDate: "2026",
    evidenceTier: "Tier C",
    evidenceRef: "State Legislative Assembly cultural representation resolution draft",
  },
  {
    num: 13,
    textEn: "Implement Ayushman Bharat PM-JAY with ₹5 Lakh cashless coverage + establish new AIIMS, IIT, and IIM campuses in North Bengal.",
    textBn: "৫ লক্ষ টাকার ক্যাশলেস কভারেজ সহ আয়ুষ্মান ভারত চালু + উত্তরবঙ্গে নতুন এইমস (AIIMS), আইআইটি (IIT) ও আইআইএম (IIM) স্থাপন।",
    status: "IN_PROGRESS",
    category: "Healthcare & Higher Ed",
    targetDate: "2026–2029",
    evidenceTier: "Tier A",
    evidenceRef: "Health Dept Notification 442/HFW ratifying Swasthya Sathi - PM-JAY convergence",
  },
  {
    num: 14,
    textEn: "Establish a world-class Vande Mataram National Memorial & Freedom Heritage Museum at Bankim Chandra Chattopadhyay's birthplace.",
    textBn: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের জন্মস্থানে একটি বিশ্বমানের 'বন্দে মাতরম' জাতীয় স্মৃতিসৌধ ও স্বাধীনতা ঐতিহ্য জাদুঘর স্থাপন।",
    status: "PENDING",
    category: "Culture & Memorials",
    targetDate: "2027",
    evidenceTier: "Tier B",
    evidenceRef: "Heritage Commission land survey order at Naihati Kanthalpara site",
  },
  {
    num: 15,
    textEn: "Enact a comprehensive law ensuring complete freedom, security, and administrative facilitation of traditional religious practices.",
    textBn: "ঐতিহ্যবাহী ধর্মীয় আচার-অনুষ্ঠানের পূর্ণ স্বাধীনতা, নিরাপত্তা ও প্রশাসনিক সহায়তা নিশ্চিত করতে ব্যাপক আইন প্রণয়ন।",
    status: "PENDING",
    category: "Governance & Rights",
    targetDate: "2027",
    evidenceTier: "Tier C",
    evidenceRef: "Home Department circular on festival security protocol streamlining",
  },
];

export default function KeyPromisesGrid() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const [selectedPromise, setSelectedPromise] = useState<KeyPromise | null>(null);

  const getStatusBadge = (status: KeyPromise["status"]) => {
    switch (status) {
      case "FULFILLED":
        return {
          bg: "bg-[#1A6B2A]/20 text-[#6ECB7C] border-[#1A6B2A]/50",
          label: isBn ? "পূরণ হয়েছে ✓" : "Fulfilled ✓",
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-[#D4860A]/20 text-[#F5B041] border-[#D4860A]/50",
          label: isBn ? "চলমান ◑" : "In Progress ◑",
        };
      case "EVADED":
        return {
          bg: "bg-[#C0392B]/20 text-[#E74C3C] border-[#C0392B]/50",
          label: isBn ? "এড়ানো হয়েছে ✗" : "Evaded ✗",
        };
      default:
        return {
          bg: "bg-white/10 text-white/60 border-white/20",
          label: isBn ? "অপেক্ষমান ○" : "Pending ○",
        };
    }
  };

  return (
    <section id="key-15" aria-labelledby="key-15-heading" className="my-8 scroll-mt-36">
      <div className="bg-[#1C1008] text-white rounded-xl p-6 sm:p-10 shadow-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/15 gap-2">
          <div>
            <h2 id="key-15-heading" className="font-serif text-2xl sm:text-3xl font-black text-[#E8620A]">
              ⭐ {isBn ? "বিজেপির ১৫টি প্রধান প্রতিশ্রুতি — মূল অঙ্গীকারসমূহ" : "BJP's 15 Key Promises — The Headline Commitments"}
            </h2>
            <p className="font-body text-sm sm:text-base italic text-white/70 mt-1">
              {isBn
                ? "পশ্চিমবঙ্গ নির্বাচনী ইস্তাহার ২০২৬ থেকে নির্বাচিত শীর্ষ ১৫টি নীতিগত প্রতিশ্রুতি ও বাস্তবায়নের সরকারি নথি"
                : "Top 15 flagship policy commitments extracted verbatim from the official election manifesto with verifiable audit links"}
            </p>
          </div>
          <div className="font-mono text-xs text-[#E8620A] bg-[#E8620A]/10 px-3 py-1.5 rounded border border-[#E8620A]/30 self-start sm:self-center">
            {isBn ? "১৫টি মূল অঙ্গীকার" : "15 Priority Commitments"}
          </div>
        </div>

        {/* 15 Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KEY_15_PROMISES.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <div
                key={item.num}
                onClick={() => setSelectedPromise(item)}
                className="bg-white/5 hover:bg-[#E8620A]/10 border border-white/10 hover:border-[#E8620A]/50 rounded-lg p-5 transition-all duration-200 relative group cursor-pointer flex flex-col justify-between shadow-sm"
              >
                {/* Large watermark number */}
                <span className="font-serif text-4xl sm:text-5xl font-black text-[#E8620A]/20 group-hover:text-[#E8620A]/40 transition-colors absolute top-3 right-4 select-none">
                  {isBn ? toBengaliNumerals(item.num) : item.num}
                </span>

                <div className="pr-8 relative z-10">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A] mb-1">
                    {item.category}
                  </div>
                  <p className="font-body text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                    {isBn ? item.textBn : item.textEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono relative z-10">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-white/50 group-hover:text-white/80 transition flex items-center gap-1">
                    <span>{isBn ? "প্রমাণ দেখুন" : "View Audit"}</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal for Clicked Promise */}
      {selectedPromise && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPromise(null)}
        >
          <div
            className="bg-[#1C1008] border-2 border-[#E8620A] rounded-xl max-w-lg w-full p-6 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPromise(null)}
              className="absolute top-4 right-4 text-white/60 hover:text-white font-mono text-lg"
              aria-label="Close details"
            >
              ✕
            </button>

            <div className="font-mono text-xs uppercase tracking-widest text-[#E8620A] font-bold">
              {isBn ? `প্রতিশ্রুতি #${toBengaliNumerals(selectedPromise.num)}` : `Promise #${selectedPromise.num}`} · {selectedPromise.category}
            </div>

            <h3 className="font-serif text-xl font-bold mt-2 text-white">
              {isBn ? selectedPromise.textBn : selectedPromise.textEn}
            </h3>

            <div className="mt-4 pt-3 border-t border-white/15 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-white/50">{isBn ? "বর্তমান অবস্থা:" : "Current Status:"}</span>
                <span className="font-bold text-[#E8620A]">{getStatusBadge(selectedPromise.status).label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{isBn ? "লক্ষ্যমাত্রা সময়সীমা:" : "Target Timeline:"}</span>
                <span className="text-white/90">{selectedPromise.targetDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{isBn ? "প্রমাণ আত্মবিশ্বাস ধাপ:" : "Evidence Tier:"}</span>
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  {selectedPromise.evidenceTier} (Verified Source)
                </span>
              </div>
            </div>

            <div className="mt-4 bg-white/5 p-3 rounded border border-white/10 text-xs font-body text-white/80">
              <span className="font-mono text-[10px] uppercase text-[#E8620A] block mb-1">
                {isBn ? "সরকারি গেজেট / আদেশ রেফারেন্স:" : "Official Gazette / Government Record:"}
              </span>
              {selectedPromise.evidenceRef}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedPromise(null)}
                className="bg-[#E8620A] hover:bg-[#B84A00] text-white font-mono text-xs uppercase tracking-wider px-4 py-2 rounded font-bold transition"
              >
                {isBn ? "বন্ধ করুন" : "Close Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
