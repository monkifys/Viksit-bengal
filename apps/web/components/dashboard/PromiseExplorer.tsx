"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import PromiseCard, { PromiseItem, PromiseStatus } from "./PromiseCard";
import PromiseTimeline from "./PromiseTimeline";

const SAMPLE_PROMISES: PromiseItem[] = [
  {
    id: "p1",
    code: "INFRA-01",
    categoryId: "infra",
    categoryNameEn: "Infrastructure & Ports",
    categoryNameBn: "অবকাঠামো ও বন্দর",
    titleEn: "Tajpur Deep-Draft Green Port Development",
    titleBn: "তাজপুর গভীর ড্রাফট পরিবেশবান্ধব বন্দর নির্মাণ",
    descriptionEn: "Development of deep-sea port handling container and bulk maritime logistics.",
    descriptionBn: "কনটেইনার ও বাল্ক মেরিটাইম লজিস্টিকসের জন্য গভীর সমুদ্র বন্দর উন্নয়ন।",
    responsibleDepartment: "Commerce & Industries / Syama Prasad Port",
    status: "UNDER_IMPLEMENTATION",
    confidence: "A",
    evidenceCount: 4,
  },
  {
    id: "p2",
    code: "AGRI-01",
    categoryId: "rural",
    categoryNameEn: "Farmers & Rural Economy",
    categoryNameBn: "কৃষক ও গ্রামীণ অর্থনীতি",
    titleEn: "Block-Level Solar Cold Storage & Procurement Grid",
    titleBn: "ব্লক স্তরে সৌরচালিত হিমঘর ও ক্রয় নেটওয়ার্ক",
    descriptionEn: "Establishing 100 decentralized solar-powered cold storages for potato and vegetable preservation.",
    descriptionBn: "আলু ও সবজি সংরক্ষণের জন্য ১০০টি বিকেন্দ্রীভূত সৌর বিদ্যুৎচালিত হিমঘর স্থাপন।",
    responsibleDepartment: "Agricultural Marketing / Power Dept",
    status: "FUNDED",
    confidence: "A",
    evidenceCount: 3,
  },
  {
    id: "p3",
    code: "WOMEN-01",
    categoryId: "women",
    categoryNameEn: "Women Empowerment & Safety",
    categoryNameBn: "নারী সশক্তিকরণ ও নিরাপত্তা",
    titleEn: "Annapurna Financial Security & Micro-Enterprise Fund",
    titleBn: "অন্নপূর্ণা আর্থিক নিরাপত্তা ও ক্ষুদ্র নারী উদ্যোগ তহবিল",
    descriptionEn: "Direct financial support and micro-credit facilitation for 80 lakh women entrepreneurs.",
    descriptionBn: "৮০ লক্ষ নারী উদ্যোক্তার জন্য সরাসরি আর্থিক সহায়তা ও সহজ শর্তে ঋণ সুবিধা।",
    responsibleDepartment: "Women & Child Development / Finance Dept",
    status: "LEGALLY_INITIATED",
    confidence: "B",
    evidenceCount: 2,
  },
  {
    id: "p4",
    code: "JOBS-01",
    categoryId: "jobs",
    categoryNameEn: "Jobs & Youth Employment",
    categoryNameBn: "কর্মসংস্থান ও যুব সুযোগ",
    titleEn: "One Crore Formal Job & Self-Employment Opportunities",
    titleBn: "এক কোটি সংগঠিত চাকরি ও স্ব-কর্মসংস্থানের সুযোগ সৃষ্টি",
    descriptionEn: "Multi-sectoral industrial acceleration, MSME clusters, and vocational apprenticeship stipend.",
    descriptionBn: "বহু-খাত শিল্প প্রবৃদ্ধি, এমএসএমই ক্লাস্টার এবং যুব শিক্ষানবিশী বৃত্তি।",
    responsibleDepartment: "Labour Dept / Technical Education",
    status: "UNDER_IMPLEMENTATION",
    confidence: "B",
    evidenceCount: 5,
  },
  {
    id: "p5",
    code: "TEA-01",
    categoryId: "tea",
    categoryNameEn: "Tea & Jute Industries",
    categoryNameBn: "চা ও পাট শিল্প",
    titleEn: "North Bengal Tea Garden Land Rights & Minimum Wage",
    titleBn: "উত্তরবঙ্গের চা বাগান শ্রমিকদের জমির পাট্টা ও ন্যূনতম মজুরি",
    descriptionEn: "Issuing formal land entitlement documents (Patta) and implementing unified minimum wage guidelines.",
    descriptionBn: "আইনি জমির অধিকার (পাট্টা) প্রদান এবং অভিন্ন ন্যূনতম মজুরি কাঠামোর রূপায়ণ।",
    responsibleDepartment: "Land & Land Reforms / Labour Dept",
    status: "PARTIALLY_DELIVERED",
    confidence: "A",
    evidenceCount: 4,
  },
  {
    id: "p6",
    code: "HEALTH-01",
    categoryId: "health",
    categoryNameEn: "Healthcare & Social Protection",
    categoryNameBn: "স্বাস্থ্যসেবা ও সামাজিক সুরক্ষা",
    titleEn: "Universal Health Insurance & Sub-Divisional Super-Specialty",
    titleBn: "সর্বজনীন স্বাস্থ্য বীমা ও মহকুমা স্তরে সুপার-স্পেশালিটি হাসপাতাল",
    descriptionEn: "Upgrading all sub-divisional hospitals with trauma care, ICU beds, and oncology wards.",
    descriptionBn: "সকল মহকুমা হাসপাতালে ট্রমা কেয়ার, আইসিইউ এবং ক্যান্সার কেয়ার বিভাগ স্থাপন।",
    responsibleDepartment: "Health & Family Welfare Dept",
    status: "UNDER_IMPLEMENTATION",
    confidence: "A",
    evidenceCount: 6,
  },
];

const CATEGORIES = [
  { id: "ALL", nameEn: "All Sectors", nameBn: "সকল খাত" },
  { id: "infra", nameEn: "Infrastructure & Ports", nameBn: "অবকাঠামো ও বন্দর" },
  { id: "rural", nameEn: "Farmers & Rural", nameBn: "কৃষক ও গ্রামীণ" },
  { id: "women", nameEn: "Women & Safety", nameBn: "নারী ও নিরাপত্তা" },
  { id: "jobs", nameEn: "Jobs & Youth", nameBn: "কর্মসংস্থান ও যুব" },
  { id: "tea", nameEn: "Tea & Jute", nameBn: "চা ও পাট" },
  { id: "health", nameEn: "Healthcare", nameBn: "স্বাস্থ্যসেবা" },
];

export default function PromiseExplorer() {
  const t = useTranslations("PromiseExplorer");
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [activePromise, setActivePromise] = useState<PromiseItem | null>(null);

  const filteredPromises = SAMPLE_PROMISES.filter((p) => {
    const matchesCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.code.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.titleBn.includes(q) ||
      (p.descriptionEn && p.descriptionEn.toLowerCase().includes(q));

    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-950/10 my-8">
      <div className="pb-6 border-b border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-ink">
          {locale === "bn" ? "প্রতিশ্রুতি ও বাস্তবায়ন ট্র্যাকার" : "Public Commitments & Delivery Tracker"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "bn"
            ? "প্রতিটি প্রতিশ্রুতির আইনি বিজ্ঞপ্তি, বাজেট মঞ্জুরি, বাস্তবায়ন অগ্রগতি ও প্রমাণের পূর্ণাঙ্গ রেকর্ড।"
            : "Transparent audit of manifesto commitments, government orders, and measurable ground deliverables."}
        </p>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {/* Search Input */}
          <div className="sm:col-span-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "bn" ? "কীওয়ার্ড দিয়ে খুঁজুন..." : "Search commitments..."}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            />
          </div>

          {/* Sector Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === "bn" ? c.nameBn : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              <option value="ALL">{locale === "bn" ? "সকল স্থিতি (All Statuses)" : "All Statuses"}</option>
              <option value="DELIVERED">{locale === "bn" ? "বাস্তবায়িত (Delivered)" : "Delivered"}</option>
              <option value="UNDER_IMPLEMENTATION">{locale === "bn" ? "বাস্তবায়নাধীন (Under Implementation)" : "Under Implementation"}</option>
              <option value="FUNDED">{locale === "bn" ? "অর্থ বরাদ্দকৃত (Funded)" : "Funded"}</option>
              <option value="LEGALLY_INITIATED">{locale === "bn" ? "আইনত সূচিত (Legally Initiated)" : "Legally Initiated"}</option>
              <option value="ANNOUNCED">{locale === "bn" ? "ঘোষিত (Announced)" : "Announced"}</option>
              <option value="DELAYED">{locale === "bn" ? "বিলম্বিত (Delayed)" : "Delayed"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Promise Timeline Detail */}
      {activePromise && (
        <PromiseTimeline
          promise={activePromise}
          onClose={() => setActivePromise(null)}
        />
      )}

      {/* Promises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-6">
        {filteredPromises.length > 0 ? (
          filteredPromises.map((promise) => (
            <PromiseCard
              key={promise.id}
              promise={promise}
              isSelected={activePromise?.id === promise.id}
              onSelect={(p) => setActivePromise(p)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm font-medium">
              {locale === "bn" ? "কোনো প্রতিশ্রুতি মেলেনি।" : "No commitments found matching the criteria."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}