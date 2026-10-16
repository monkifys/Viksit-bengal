"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { toBengaliNumerals } from "@viksit/shared";

export default function MastheadTracker() {
  const locale = useLocale();
  const isBn = locale === "bn";

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  const [daysInOffice, setDaysInOffice] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    // Oath date: 9 May 2026
    const oathDate = new Date("2026-05-09T10:00:00+05:30");
    // Term end: 9 May 2031
    const termEnd = new Date("2031-05-09T23:59:59+05:30");

    const updateTimer = () => {
      const now = new Date();

      // Today's Date String
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      setCurrentDateStr(now.toLocaleDateString(isBn ? "bn-IN" : "en-IN", options));

      // Days in office calculation
      const diffSinceOath = now.getTime() - oathDate.getTime();
      const inOffice = Math.max(0, Math.floor(diffSinceOath / (1000 * 60 * 60 * 24)));
      setDaysInOffice(inOffice);

      // Remaining time calculation
      const diffToTerm = termEnd.getTime() - now.getTime();
      const totalRemainingDays = Math.max(0, Math.floor(diffToTerm / (1000 * 60 * 60 * 24)));
      setDaysRemaining(totalRemainingDays);

      if (diffToTerm > 0) {
        const years = Math.floor(totalRemainingDays / 365);
        const remainingAfterYears = totalRemainingDays % 365;
        const months = Math.floor(remainingAfterYears / 30);
        const days = remainingAfterYears % 30;
        const hours = Math.floor((diffToTerm / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diffToTerm / (1000 * 60)) % 60);
        const secs = Math.floor((diffToTerm / 1000) % 60);

        setTimeLeft({ years, months, days, hours, mins, secs });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isBn]);

  const fmt = (num: number) => {
    const padded = num.toString().padStart(2, "0");
    return isBn ? toBengaliNumerals(padded) : padded;
  };

  const fmtSingle = (num: number) => {
    return isBn ? toBengaliNumerals(num) : num.toString();
  };

  return (
    <div className="w-full bg-[#1C1008] text-white shadow-2xl rounded-xl overflow-hidden border border-[#D4C4B0]/20">
      {/* Top Banner Bar */}
      <div className="bg-[#E8620A] px-4 sm:px-8 py-2.5 flex flex-wrap justify-between items-center gap-2 text-xs font-mono tracking-wider text-white">
        <div className="flex items-center gap-2">
          <span className="bg-white text-[#B84A00] px-2 py-0.5 rounded font-bold tracking-widest text-[10px] uppercase animate-pulse">
            LIVE
          </span>
          <span className="font-semibold text-white/95">
            {isBn
              ? "বিজেপি সরকার প্রতিশ্রুতি ট্র্যাকার — পশ্চিমবঙ্গ জনদায়বদ্ধতা খতিয়ান | বিধানসভা নির্বাচন ২০২৬"
              : "BJP Sarkar Promises — West Bengal Accountability Tracker | Assembly Election 2026"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <span>{currentDateStr || "16 Oct 2026"}</span>
          <Link
            href={isBn ? "/en" : "/bn"}
            className="bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-0.5 rounded transition text-[11px]"
          >
            {isBn ? "English" : "বাংলা"}
          </Link>
        </div>
      </div>

      {/* Main Masthead Header */}
      <div className="p-6 sm:p-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-center">
        {/* BJP Lotus SVG & Insignia */}
        <div className="flex md:flex-col items-center gap-3">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="BJP Lotus Insignia"
          >
            <circle cx="28" cy="28" r="28" fill="#E8620A" />
            <ellipse cx="28" cy="33" rx="10" ry="6" fill="white" opacity="0.9" />
            <ellipse cx="28" cy="30" rx="6" ry="9" fill="white" opacity="0.95" />
            <ellipse cx="21" cy="31" rx="5" ry="8" fill="white" opacity="0.8" transform="rotate(-20 21 31)" />
            <ellipse cx="35" cy="31" rx="5" ry="8" fill="white" opacity="0.8" transform="rotate(20 35 31)" />
            <ellipse cx="17" cy="32" rx="4" ry="6" fill="white" opacity="0.65" transform="rotate(-40 17 32)" />
            <ellipse cx="39" cy="32" rx="4" ry="6" fill="white" opacity="0.65" transform="rotate(40 39 32)" />
          </svg>
          <div className="text-left md:text-center">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#E8620A] font-bold block">
              {isBn ? "বিজেপি পশ্চিমবঙ্গ" : "BJP West Bengal"}
            </span>
            <span className="text-[10px] text-white/50 font-mono">
              {isBn ? "সবাই ফাউন্ডেশন খতিয়ান" : "Sabai Civic Ledger"}
            </span>
          </div>
        </div>

        {/* Title, Subtitle, & Executive Governance Metadata */}
        <div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            {isBn ? (
              <>
                বিজেপি সরকার <span className="text-[#E8620A]">প্রতিশ্রুতি ট্র্যাকার</span>
              </>
            ) : (
              <>
                BJP Sarkar <span className="text-[#E8620A]">Promises</span>
              </>
            )}
          </h1>
          <p className="mt-2.5 font-body text-base sm:text-lg italic text-white/80 max-w-4xl">
            {isBn
              ? "পশ্চিমবঙ্গের সার্বজনীন ডিজিটাল খতিয়ান — ২০২৬-২০৩১ পর্যন্ত জনগণের প্রতি করা প্রতিটি প্রতিশ্রুতির অগ্রগতি পরিবীক্ষণ · রাজ্যপাল আর.এন. রবি কর্তৃক শপথবাক্য পাঠ"
              : "West Bengal's public ledger — tracking every commitment made to the people, 2026–2031 · Oath administered by Governor RN Ravi"}
          </p>

          {/* Key Administration Meta Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-white/10">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A]">
                {isBn ? "মুখ্যমন্ত্রী" : "Chief Minister"}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold text-white">
                {isBn ? "শুভেন্দু অধিকারী" : "Suvendu Adhikari"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A]">
                {isBn ? "শপথ গ্রহণ" : "Oath Ceremony"}
              </span>
              <span className="font-serif text-xs sm:text-sm font-semibold text-white/90">
                {isBn ? "৯ মে ২০২৬, ব্রিগেড" : "9 May 2026, Brigade"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A]">
                {isBn ? "আসন জয়" : "Seats Won"}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold text-white">
                {isBn ? "২০৭ / ২৯৪" : "207 / 294"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A]">
                {isBn ? "মেয়াদ শেষ" : "Term Ends"}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold text-white">
                {isBn ? "মে ২০৩১" : "May 2031"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A]">
                {isBn ? "কার্যকাল (দিন)" : "Days in Office"}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold text-white">
                {fmtSingle(daysInOffice)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#E8620A]">
                {isBn ? "বাকি দিন" : "Days Remaining"}
              </span>
              <span className="font-serif text-sm sm:text-base font-bold text-[#E8620A]">
                {fmtSingle(daysRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Countdown Clock Banner */}
      <div className="bg-[#120B05] border-t border-b border-[#D4C4B0]/15 py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-6 flex-wrap font-mono">
          <div className="text-center min-w-[50px]">
            <span className="font-serif text-2xl sm:text-4xl font-black text-[#E8620A] block leading-none">
              {fmt(timeLeft.years)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              {isBn ? "বছর" : "Years"}
            </span>
          </div>
          <span className="font-serif text-xl sm:text-3xl text-[#B84A00] pb-2">:</span>

          <div className="text-center min-w-[50px]">
            <span className="font-serif text-2xl sm:text-4xl font-black text-[#E8620A] block leading-none">
              {fmt(timeLeft.months)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              {isBn ? "মাস" : "Months"}
            </span>
          </div>
          <span className="font-serif text-xl sm:text-3xl text-[#B84A00] pb-2">:</span>

          <div className="text-center min-w-[50px]">
            <span className="font-serif text-2xl sm:text-4xl font-black text-[#E8620A] block leading-none">
              {fmt(timeLeft.days)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              {isBn ? "দিন" : "Days"}
            </span>
          </div>
          <span className="font-serif text-xl sm:text-3xl text-[#B84A00] pb-2">:</span>

          <div className="text-center min-w-[50px]">
            <span className="font-serif text-2xl sm:text-4xl font-black text-[#E8620A] block leading-none">
              {fmt(timeLeft.hours)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              {isBn ? "ঘণ্টা" : "Hours"}
            </span>
          </div>
          <span className="font-serif text-xl sm:text-3xl text-[#B84A00] pb-2">:</span>

          <div className="text-center min-w-[50px]">
            <span className="font-serif text-2xl sm:text-4xl font-black text-[#E8620A] block leading-none">
              {fmt(timeLeft.mins)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              {isBn ? "মিনিট" : "Minutes"}
            </span>
          </div>
          <span className="font-serif text-xl sm:text-3xl text-[#B84A00] pb-2">:</span>

          <div className="text-center min-w-[50px]">
            <span className="font-serif text-2xl sm:text-4xl font-black text-[#E8620A] block leading-none">
              {fmt(timeLeft.secs)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-white/50">
              {isBn ? "সেকেন্ড" : "Seconds"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
