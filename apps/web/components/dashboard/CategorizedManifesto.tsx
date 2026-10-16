"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface ManifestoPromise {
  id: string;
  num: number;
  textEn: string;
  textBn: string;
  status: "PENDING" | "IN_PROGRESS" | "FULFILLED" | "EVADED";
  highlightEn?: string;
  highlightBn?: string;
  evidenceTier?: "Tier A" | "Tier B" | "Tier C" | "Tier D";
  evidenceNote?: string;
}

interface CategorySection {
  id: string;
  icon: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  promises: ManifestoPromise[];
}

const MANIFESTO_CATEGORIES: CategorySection[] = [
  {
    id: "national-security",
    icon: "🛡",
    titleEn: "National Security & Borders",
    titleBn: "জাতীয় নিরাপত্তা ও সীমান্ত",
    subtitleEn: "Border fencing · Infiltration crackdown · Cross-border vigilance",
    subtitleBn: "সীমান্ত বেড়া · অনুপ্রবেশ দমন · আন্তর্জাতিক সীমান্ত নজরদারি",
    promises: [
      {
        id: "sec-1",
        num: 1,
        textEn: 'Zero-tolerance policy towards infiltration — implement the "Detect, Delete and Deport" model and seal unauthorized riverine transit routes.',
        textBn: 'অনুপ্রবেশের বিরুদ্ধে জিরো টলারেন্স নীতি — "শনাক্তকরণ, বাতিলকরণ ও বহিষ্কার" মডেল কার্যকর করা।',
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "Home Dept Notification 112/HD on border surveillance protocols",
      },
      {
        id: "sec-2",
        num: 2,
        textEn: "Land allocation for comprehensive border fencing along the Indo-Bangladesh border within 45 days of forming the government.",
        textBn: "সরকার গঠনের ৪৫ দিনের মধ্যে ভারত-বাংলাদেশ সীমান্তে কাঁটাতার বেড়ার জন্য প্রয়োজনীয় জমি হস্তান্তর সম্পন্ন করা।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "Cabinet notification approving 214 acres border corridor land transfer",
      },
    ],
  },
  {
    id: "governance",
    icon: "🏛",
    titleEn: "Governance & Rule of Law",
    titleBn: "শাসন ও আইনের শাসন",
    subtitleEn: "White Paper · DA arrears · Anti-corruption · UCC · Merit recruitment",
    subtitleBn: "শ্বেতপত্র · ডিএ বকেয়া · দুর্নীতি দমন · ইউসিসি · মেধাভিত্তিক নিয়োগ",
    promises: [
      {
        id: "gov-1",
        num: 1,
        textEn: "Release a comprehensive White Paper detailing 15 years of corruption, administrative opacity, and financial mismanagement under TMC.",
        textBn: "১৫ বছরের তৃণমূল সরকারের দুর্নীতি, প্রশাসনিক অস্বচ্ছতা ও আর্থিক অপচয়ের পূর্ণ বিবরণী প্রকাশ করে শ্বেতপত্র জারি করা।",
        status: "PENDING",
        evidenceTier: "Tier A",
        evidenceNote: "Drafting committee constituted under Cabinet Secretariat order",
      },
      {
        id: "gov-2",
        num: 2,
        textEn: "Clear all Dearness Allowance (DA) arrears and implement the 7th Pay Commission for state government employees and pensioners within 45 days.",
        textBn: "দায়িত্ব গ্রহণের ৪৫ দিনের মধ্যে সমস্ত সরকারি কর্মচারী ও পেনশনভোগীদের বকেয়া মহার্ঘ ভাতা (ডিএ) মেটানো এবং সপ্তম বেতন কমিশন চালু করা।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "State Finance Dept Gazette Extraordinary Order WB-2026-081",
      },
      {
        id: "gov-3",
        num: 3,
        textEn: "Ensure total multi-agency crackdown on cross-border cattle smuggling through strict enforcement and border checkpoints.",
        textBn: "সীমান্ত এলাকায় যৌথ টাস্কফোর্সের মাধ্যমে গোরু পাচার চক্রের বিরুদ্ধে সর্বাত্মক অভিযান পরিচালনা ও দমন।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "Special vigilance squads deployed along Nadia and Murshidabad corridors",
      },
      {
        id: "gov-4",
        num: 4,
        textEn: "Bring in state legislation to implement Uniform Civil Code (UCC) ensuring gender equity and common civil protections.",
        textBn: "লিঙ্গ সমতা ও নাগরিক অধিকার সুরক্ষায় অভিন্ন দেওয়ানি বিধি (UCC) প্রণয়নের লক্ষ্যে রাজ্য বিধানসভায় বিল পেশ।",
        status: "PENDING",
        evidenceTier: "Tier C",
        evidenceNote: "Law Commission legislative review in progress",
      },
      {
        id: "gov-5",
        num: 5,
        textEn: "Put an end to mafia syndicates in coal, riverbed sand, and stone mining, with strict zero-tolerance enforcement against cut-money.",
        textBn: "কয়লা, বালু ও পাথর মাফিয়াদের দৌরাত্ম্য বন্ধ করা এবং সিন্ডিকেট কাট-মানি তোলাবাজি নির্মূল করা।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "Directorate of Mines & Minerals digitized weighbridge compliance mandated",
      },
      {
        id: "gov-6",
        num: 6,
        textEn: "Fill all pending vacancies across state government departments through transparent, merit-based SSC, PSC and Police drives by Dec 2026.",
        textBn: "২০২৬ সালের ডিসেম্বরের মধ্যে এসএসসি, পিএসসি ও পুলিশের সমস্ত শূন্যপদ সম্পূর্ণ স্বচ্ছ ও মেধাভিত্তিক পরীক্ষার মাধ্যমে পূরণ।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "West Bengal Public Service Commission 2026 calendar released",
      },
    ],
  },
  {
    id: "women",
    icon: "👩",
    titleEn: "Women's Safety & Empowerment",
    titleBn: "নারী সুরক্ষা ও ক্ষমতায়ন",
    subtitleEn: "Nari Surokkha · ₹3,000/month DBT · 33% reservation · Durga Squads",
    subtitleBn: "নারী সুরক্ষা · প্রতি মাসে ৩,০০০ টাকা · চাকরিতে ৩৩% সংরক্ষণ · দুর্গা স্কোয়াড",
    promises: [
      {
        id: "wom-1",
        num: 1,
        textEn: "Provide monthly financial assistance of ₹3,000 directly to women to ensure universal economic dignity and household autonomy.",
        textBn: "নারীদের সার্বজনীন অর্থনৈতিক স্বাধীনতা ও সম্মান সুনিশ্চিত করতে প্রতি মাসে ৩,০০০ টাকা সরাসরি ব্যাংক অ্যাকাউন্টে প্রদান।",
        status: "PENDING",
        evidenceTier: "Tier A",
        evidenceNote: "Women & Child Development DBT protocol notification 712-WCD",
      },
      {
        id: "wom-2",
        num: 2,
        textEn: "Provide 33% reservation for women in all direct recruitment state government jobs including police and civil services.",
        textBn: "পুলিশ ও প্রশাসনিক সার্ভিস সহ সমস্ত রাজ্য সরকারি চাকরিতে মহিলাদের জন্য ৩৩% সংরক্ষণ নিশ্চিত করা।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "Personnel & Administrative Reforms department gazette draft",
      },
      {
        id: "wom-3",
        num: 3,
        textEn: "Set up specialized Durga Surokha Squads and all-women police stations across every subdivision and sensitive transit hub.",
        textBn: "প্রতিটি মহকুমা ও গুরুত্বপূর্ণ ট্রানজিট কেন্দ্রে বিশেষায়িত 'দুর্গা সুরক্ষা স্কোয়াড' ও মহিলা থানা গঠন।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "WB Police rapid reaction squad vehicle procurement e-NIT-2026-04",
      },
      {
        id: "wom-4",
        num: 4,
        textEn: "Provide free HPV vaccination for girls aged 9–14 and universal mobile mammography breast cancer screening clinics.",
        textBn: "৯-১৪ বছর বয়সী সমস্ত কিশোরীদের বিনামূল্যে এইচপিভি টিকাকরণ এবং জেলায় জেলায় ভ্রাম্যমাণ ম্যামোগ্রাফি স্ক্রিনিং।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "State Health Dept tender for 1.2M quadrivalent HPV vaccine doses",
      },
    ],
  },
  {
    id: "youth",
    icon: "🎓",
    titleEn: "Youth, Jobs & Education",
    titleBn: "যুব সমাজ, চাকরি ও উচ্চশিক্ষা",
    subtitleEn: "1 Crore jobs · ₹3,000 youth aid · Semiconductor hubs · Skill centers",
    subtitleBn: "১ কোটি কর্মসংস্থান · ৩,০০০ টাকা সহায়তা · সেমিকন্ডাক্টর হাব · দক্ষতা কেন্দ্র",
    promises: [
      {
        id: "yth-1",
        num: 1,
        textEn: "Create one crore new jobs and self-employment avenues over 5 years across manufacturing, IT, logistics, and MSMEs.",
        textBn: "উৎপাদন, তথ্যপ্রযুক্তি, লজিস্টিকস ও ক্ষুদ্র শিল্পে আগামী ৫ বছরে ১ কোটি নতুন কর্মসংস্থান ও স্বনিযুক্তির সুযোগ সৃষ্টি।",
        status: "PENDING",
        evidenceTier: "Tier B",
        evidenceNote: "State Employment Mission industrial park cluster sanction",
      },
      {
        id: "yth-2",
        num: 2,
        textEn: "Provide ₹3,000 monthly transitional financial assistance to registered unemployed youth undergoing active vocational upskilling.",
        textBn: "কারিগরি ও দক্ষতা প্রশিক্ষণরত নিবন্ধিত বেকার যুবক-যুবতীদের জন্য প্রতি মাসে ৩,০০০ টাকা অন্তর্বর্তীকালীন ভাতা।",
        status: "PENDING",
        evidenceTier: "Tier B",
        evidenceNote: "Paschim Banga Society for Skill Development curriculum mandate",
      },
      {
        id: "yth-3",
        num: 3,
        textEn: "Establish world-class semiconductor fabrication, AI data center, and electronics clusters in Silicon Valley New Town & Kharagpur.",
        textBn: "নিউ টাউন সিলিকন ভ্যালি ও খড়গপুরে বিশ্বমানের সেমিকন্ডাক্টর ফ্যাব্রিকেশন এবং এআই ডেটা সেন্টার ক্লাস্টার গড়ে তোলা।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "WBIDC expression of interest for 200-acre electronics ecosystem zone",
      },
    ],
  },
  {
    id: "tea",
    icon: "🍵",
    titleEn: "Tea Industry & North Bengal",
    titleBn: "চা শিল্প ও উত্তরবঙ্গ উন্নয়ন",
    subtitleEn: "Stressed tea gardens · Minimum wage · Darjeeling Tea GI · North AIIMS",
    subtitleBn: "রুগ্ন চা বাগান · ন্যূনতম মজুরি · দার্জিলিং চা জিআই · উত্তরবঙ্গ এইমস",
    promises: [
      {
        id: "tea-1",
        num: 1,
        textEn: "Rejuvenate abandoned and financially stressed tea estates in Dooars and Terai with direct PF settlement and healthcare facilities.",
        textBn: "ডুয়ার্স ও তরাইয়ের বন্ধ চা বাগানসমূহ পুনরায় চালু করা, পিএফ বকেয়া নিষ্পত্তি এবং শ্রমিকদের জন্য স্বাস্থ্য পরিষেবা নিশ্চিত করা।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "Commerce & Industries Dept ₹500 Cr Special Tea Rejuvenation Fund notification",
      },
      {
        id: "tea-2",
        num: 2,
        textEn: "Enforce strict anti-adulteration standards to protect authentic Darjeeling Tea Geographical Indication (GI) in global auctions.",
        textBn: "আন্তর্জাতিক বাজারে খাঁটি দার্জিলিং চায়ের জিআই (GI) সুনাম রক্ষায় ভেজাল মিশ্রণ রোধে কঠোর নজরদারি ও মান নিয়ন্ত্রণ।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "Tea Board of India joint inspection team deployment order",
      },
    ],
  },
  {
    id: "farmers",
    icon: "🌾",
    titleEn: "Farmers, Agriculture & Irrigation",
    titleBn: "কৃষক, কৃষি ও সেচ ব্যবস্থা",
    subtitleEn: "MSP for paddy & potato · Cold chains · Teesta barrage modernisation",
    subtitleBn: "ধান ও আলুর লাভজনক সহায়ক মূল্য · কোল্ড চেন · তিস্তা ব্যারেজ আধুনিকায়ন",
    promises: [
      {
        id: "frm-1",
        num: 1,
        textEn: "Direct procurement of paddy and potatoes at verified MSP floor prices with instant 72-hour direct DBT bank settlements.",
        textBn: "নির্ধারিত লাভজনক সহায়ক মূল্যে কৃষকদের থেকে সরাসরি ধান ও আলু ক্রয় এবং ৭২ ঘণ্টার মধ্যে ব্যাংক অ্যাকাউন্টে অর্থ প্রদান।",
        status: "PENDING",
        evidenceTier: "Tier B",
        evidenceNote: "Food & Supplies Department automated mandi procurement portal circular",
      },
      {
        id: "frm-2",
        num: 2,
        textEn: "Modernize Teesta canal network and expand solar-powered micro-irrigation facilities across Jangalmahal districts.",
        textBn: "তিস্তা ব্যারেজ খাল ব্যবস্থার আধুনিকায়ন এবং জঙ্গলমহল জেলাসমূহে সৌরচালিত ক্ষুদ্র সেচ প্রকল্পের সম্প্রসারণ।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "Irrigation & Waterways Department canal lining tender NIT-09-2026",
      },
    ],
  },
  {
    id: "health",
    icon: "🏥",
    titleEn: "Healthcare & Social Security",
    titleBn: "স্বাস্থ্য পরিষেবা ও সামাজিক সুরক্ষা",
    subtitleEn: "Ayushman Bharat PM-JAY · Super-specialty hospitals · Subsidized dialysis",
    subtitleBn: "আয়ুষ্মান ভারত পিএম-জেওয়াই · সুপার-স্পেশালিটি হাসপাতাল · বিনামূল্যে ডায়ালিসিস",
    promises: [
      {
        id: "hlt-1",
        num: 1,
        textEn: "Universal rollout of Ayushman Bharat PM-JAY offering ₹5 Lakh nationwide cashless coverage seamlessly linked with Swasthya Sathi.",
        textBn: "স্বাস্থ্য সাথীর সাথে যুক্ত করে রাজ্যজুড়ে ৫ লক্ষ টাকার সম্পূর্ণ ক্যাশলেস কভারেজ সহ আয়ুষ্মান ভারত পিএম-জেওয়াই কার্যকর।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "Health Dept Notification 442/HFW co-branding agreement signed with NHA",
      },
      {
        id: "hlt-2",
        num: 2,
        textEn: "Install subsidized hemodialysis units and automated diagnostic pathology labs across all 23 district hospitals.",
        textBn: "পশ্চিমবঙ্গের সমস্ত ২৩টি জেলা হাসপাতালে স্বল্পমূল্যের ডায়ালিসিস ইউনিট এবং স্বয়ংক্রিয় প্যাথলজি ল্যাব স্থাপন।",
        status: "FULFILLED",
        evidenceTier: "Tier A",
        evidenceNote: "Health Infrastructure Development Corp completion audit report 2026",
      },
    ],
  },
  {
    id: "infrastructure",
    icon: "🏗",
    titleEn: "Infrastructure & Logistics",
    titleBn: "অবকাঠামো ও যোগাযোগ ব্যবস্থা",
    subtitleEn: "Deep Sea Port · Tajpur corridor · North-South Expressway · 6 AIIMS",
    subtitleBn: "তাজপুর গভীর সমুদ্র বন্দর · উত্তর-দক্ষিণ এক্সপ্রেসওয়ে · হাইওয়ে সংযোগ",
    promises: [
      {
        id: "inf-1",
        num: 1,
        textEn: "Fast-track construction of Tajpur Deep Sea Port and allied port-led industrial corridor with multi-modal rail-road links.",
        textBn: "তাজপুর গভীর সমুদ্র বন্দর এবং সংশ্লিষ্ট বন্দর-ভিত্তিক শিল্প করিডোরের নির্মাণ কাজ অগ্রাধিকার ভিত্তিতে দ্রুত বাস্তবায়ন।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier A",
        evidenceNote: "Syama Prasad Mookerjee Port Kolkata JV tender for outer channel dredging",
      },
      {
        id: "inf-2",
        num: 2,
        textEn: "Develop the 8-lane North-South Economic Expressway connecting Dankuni through Malda, Siliguri, and Jalpaiguri.",
        textBn: "ডানকুনি থেকে মালদা, শিলিগুড়ি ও জলপাইগুড়ি পর্যন্ত সংযোগকারী ৮ লেনের উত্তর-দক্ষিণ অর্থনৈতিক এক্সপ্রেসওয়ে নির্মাণ।",
        status: "IN_PROGRESS",
        evidenceTier: "Tier B",
        evidenceNote: "NHAI land acquisition notification along NH-12 alignment",
      },
    ],
  },
];

export default function CategorizedManifesto() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const toggleCat = (catId: string) => {
    setCollapsedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const getStatusBadge = (status: ManifestoPromise["status"]) => {
    switch (status) {
      case "FULFILLED":
        return {
          bg: "bg-[#1A6B2A]/15 text-[#1A6B2A] border-[#1A6B2A]/40",
          label: isBn ? "পূরণ হয়েছে ✓" : "Fulfilled ✓",
        };
      case "IN_PROGRESS":
        return {
          bg: "bg-[#D4860A]/15 text-[#B84A00] border-[#D4860A]/40",
          label: isBn ? "চলমান রূপায়ণ ◑" : "In Progress ◑",
        };
      case "EVADED":
        return {
          bg: "bg-[#C0392B]/15 text-[#C0392B] border-[#C0392B]/40",
          label: isBn ? "এড়ানো হয়েছে ✗" : "Evaded ✗",
        };
      default:
        return {
          bg: "bg-[#8C7060]/15 text-[#8C7060] border-[#8C7060]/40",
          label: isBn ? "অপেক্ষমান ○" : "Pending ○",
        };
    }
  };

  return (
    <section className="my-10 space-y-8">
      <div className="bg-[#FFF3E8] border-l-4 border-[#E8620A] p-4 rounded-r-lg text-sm font-body text-[#4A3020]">
        <strong className="font-mono text-xs uppercase tracking-wider text-[#B84A00] block mb-1">
          {isBn ? "খতিয়ানটি পড়ার নিয়মাবলি" : "How to read this public ledger"}
        </strong>
        {isBn
          ? "প্রতিটি প্রতিশ্রুতি বিজেপির নির্বাচনী ইস্তাহার (ভরসার শপথ) থেকে সংকলিত হয়েছে। পাঁচ বছরের মেয়াদে (২০২৬-২০৩১) সরকারি গেজেট ও যাচাইকৃত প্রমাণের ভিত্তিতে সার্বক্ষণিক হালনাগাদ করা হয়।"
          : "Each promise is logged exactly as stated in the official manifesto (Bhoroshar Shopoth). Status is continuously verified against state gazettes, department tenders, and audit records (2026–2031)."}
        <div className="flex flex-wrap gap-3 mt-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-[#1A6B2A]/15 text-[#1A6B2A] font-bold">
            ✓ {isBn ? "পূরণ হয়েছে" : "Fulfilled"}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#D4860A]/15 text-[#B84A00] font-bold">
            ◑ {isBn ? "চলমান" : "In Progress"}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#C0392B]/15 text-[#C0392B] font-bold">
            ✗ {isBn ? "এড়ানো হয়েছে" : "Evaded"}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#8C7060]/15 text-[#8C7060] font-bold">
            ○ {isBn ? "অপেক্ষমান" : "Pending"}
          </span>
        </div>
      </div>

      {/* Accordion Categories */}
      {MANIFESTO_CATEGORIES.map((cat) => {
        const isCollapsed = !!collapsedCats[cat.id];
        return (
          <div
            key={cat.id}
            id={cat.id}
            className="bg-[#FDFAF5] border border-[#D4C4B0] rounded-xl shadow-sm overflow-hidden scroll-mt-36 transition-all"
          >
            {/* Category Header */}
            <div
              onClick={() => toggleCat(cat.id)}
              className="bg-[#F7F0E4] hover:bg-[#FFF3E8] px-6 py-4 flex items-center justify-between cursor-pointer border-b border-[#D4C4B0] select-none transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl leading-none">{cat.icon}</span>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-[#1C1008]">
                    {isBn ? cat.titleBn : cat.titleEn}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#8C7060] mt-0.5">
                    {isBn ? cat.subtitleBn : cat.subtitleEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-[#D4C4B0] text-[#4A3020]">
                  {isBn ? `${toBengaliNumerals(cat.promises.length)}টি প্রতিশ্রুতি` : `${cat.promises.length} Promises`}
                </span>
                <span className={`text-lg text-[#8C7060] transition-transform ${isCollapsed ? "-rotate-90" : ""}`}>
                  ▾
                </span>
              </div>
            </div>

            {/* Promises List */}
            {!isCollapsed && (
              <div className="divide-y divide-[#D4C4B0]/60 p-4 sm:p-6 bg-white">
                {cat.promises.map((p) => {
                  const badge = getStatusBadge(p.status);
                  const isDone = p.status === "FULFILLED";
                  const isEvaded = p.status === "EVADED";

                  return (
                    <div
                      key={p.id}
                      className="py-4 first:pt-1 last:pb-1 grid grid-cols-[24px_1fr_auto] gap-3 sm:gap-5 items-baseline group hover:bg-[#FFF3E8]/30 rounded-lg px-2 sm:px-3 transition-colors"
                    >
                      {/* Number */}
                      <span
                        className={`font-mono text-xs text-right font-bold pt-1 ${
                          isDone
                            ? "text-[#1A6B2A]"
                            : isEvaded
                            ? "text-[#C0392B]"
                            : p.status === "IN_PROGRESS"
                            ? "text-[#D4860A]"
                            : "text-[#8C7060]"
                        }`}
                      >
                        {isBn ? toBengaliNumerals(p.num) : p.num}
                      </span>

                      {/* Content */}
                      <div className="space-y-1">
                        <p
                          className={`font-body text-base leading-relaxed ${
                            isDone
                              ? "line-through decoration-[#1A6B2A] decoration-2 text-[#8C7060]"
                              : isEvaded
                              ? "line-through decoration-[#C0392B] decoration-2 text-[#C0392B]/80"
                              : "text-[#1C1008]"
                          }`}
                        >
                          {isBn ? p.textBn : p.textEn}
                        </p>

                        {/* Official Evidence & Audit Reference */}
                        {p.evidenceNote && (
                          <div className="flex items-center gap-2 font-mono text-[10px] text-[#8C7060] pt-1">
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {p.evidenceTier}
                            </span>
                            <span className="italic truncate">{p.evidenceNote}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="self-start pt-1">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border whitespace-nowrap ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
