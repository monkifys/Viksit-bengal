"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";

interface NavItem {
  id: string;
  icon: string;
  titleEn: string;
  titleBn: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "key-15", icon: "⭐", titleEn: "15 Key", titleBn: "১৫টি মূল" },
  { id: "macro-targets", icon: "📊", titleEn: "$1T Target", titleBn: "$১ ট্রিলিয়ন" },
  { id: "national-security", icon: "🛡", titleEn: "Security", titleBn: "নিরাপত্তা" },
  { id: "governance", icon: "🏛", titleEn: "Governance", titleBn: "শাসন" },
  { id: "women", icon: "👩", titleEn: "Women", titleBn: "মহিলা" },
  { id: "youth", icon: "🎓", titleEn: "Youth", titleBn: "যুব ও চাকরি" },
  { id: "economy", icon: "🏭", titleEn: "Economy", titleBn: "অর্থনীতি" },
  { id: "tea", icon: "🍵", titleEn: "Tea", titleBn: "চা শিল্প" },
  { id: "farmers", icon: "🌾", titleEn: "Farmers", titleBn: "কৃষক" },
  { id: "fishery", icon: "🐟", titleEn: "Fishery", titleBn: "মৎস্য" },
  { id: "health", icon: "🏥", titleEn: "Health", titleBn: "স্বাস্থ্য" },
  { id: "education", icon: "📚", titleEn: "Education", titleBn: "শিক্ষা" },
  { id: "culture", icon: "🎭", titleEn: "Culture", titleBn: "সংস্কৃতি" },
  { id: "inclusive", icon: "⚖", titleEn: "Inclusive", titleBn: "অন্তর্ভুক্তি" },
  { id: "infrastructure", icon: "🏗", titleEn: "Infra", titleBn: "অবকাঠামো" },
  { id: "tourism", icon: "🗺", titleEn: "Tourism", titleBn: "পর্যটন" },
  { id: "environment", icon: "🌿", titleEn: "Environment", titleBn: "পরিবেশ" },
  { id: "district-tracker", icon: "🗺️", titleEn: "23 Districts", titleBn: "২৩টি জেলা" },
  { id: "ai-scraper-stream", icon: "🤖", titleEn: "AI Evidence Feed", titleBn: "এআই প্রমাণ ফিড" },
];

export default function CategoryNav() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      aria-label="Manifesto Categories Navigation"
      className="sticky top-16 sm:top-20 z-30 bg-[#F7F0E4] border-y-2 border-[#E8620A] shadow-md backdrop-blur-md"
    >
      {/* Desktop Horizontal Scroll Bar */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none items-center py-1 gap-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="whitespace-nowrap px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[#4A3020] hover:text-[#E8620A] hover:bg-[#E8620A]/10 rounded font-semibold transition flex items-center gap-1.5"
          >
            <span>{item.icon}</span>
            <span>{isBn ? item.titleBn : item.titleEn}</span>
          </a>
        ))}
      </div>

      {/* Mobile / Tablet Dropdown Header */}
      <div className="lg:hidden px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#1C1008] font-bold py-1.5 px-3 rounded bg-white/70 border border-[#D4C4B0]"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <span>📋</span>
            <span>{isBn ? "বিভাগে লাফ দিন (তালিকা)" : "Jump to Section (16 Chapters)"}</span>
          </span>
          <span className={`transform transition-transform ${mobileOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#FDFAF5] border-t border-[#D4C4B0] px-4 py-3 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileOpen(false)}
              className="text-xs font-mono text-[#4A3020] hover:text-[#E8620A] hover:bg-[#E8620A]/10 p-2 rounded flex items-center gap-2 border border-transparent hover:border-[#D4C4B0]"
            >
              <span>{item.icon}</span>
              <span className="truncate">{isBn ? item.titleBn : item.titleEn}</span>
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
