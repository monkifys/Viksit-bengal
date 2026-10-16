"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toBengaliNumerals } from "@viksit/shared";

interface DistrictItem {
  code: string;
  nameEn: string;
  nameBn: string;
  region: "North Bengal" | "South Bengal" | "Delta" | "Western Rarh";
  regionBn: string;
  population: string;
  gsdpShare: number;
  activePromises: number;
  deliveredPromises: number;
  keyProjects: string[];
  lat: number;
  lng: number;
}

const DISTRICTS_DATA: DistrictItem[] = [
  { code: "APD", nameEn: "Alipurduar", nameBn: "আলিপুরদুয়ার", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "1.7M", gsdpShare: 1.8, activePromises: 4, deliveredPromises: 1, keyProjects: ["Dooars Eco-Tourism Corridor", "Tea Garden Minimum Wage Enforcement"], lat: 26.4919, lng: 89.5271 },
  { code: "BNK", nameEn: "Bankura", nameBn: "বাঁকুড়া", region: "Western Rarh", regionBn: "পশ্চিমাঞ্চল রাঢ়", population: "3.6M", gsdpShare: 2.8, activePromises: 5, deliveredPromises: 1, keyProjects: ["Mukutmanipur Irrigation Revival", "Terracotta & Handloom Export Hub"], lat: 23.2324, lng: 87.0715 },
  { code: "BIR", nameEn: "Birbhum", nameBn: "বীরভূম", region: "Western Rarh", regionBn: "পশ্চিমাঞ্চল রাঢ়", population: "3.5M", gsdpShare: 2.9, activePromises: 6, deliveredPromises: 2, keyProjects: ["Deocha Pachami Coal Compliance", "Bolpur Heritage Tourism Network"], lat: 23.9167, lng: 87.5333 },
  { code: "COB", nameEn: "Cooch Behar", nameBn: "কোচবিহার", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "2.8M", gsdpShare: 2.2, activePromises: 4, deliveredPromises: 1, keyProjects: ["Border Trade Facility Changrabandha", "Royal Palace Heritage Tourism"], lat: 26.3239, lng: 89.4511 },
  { code: "DDN", nameEn: "Dakshin Dinajpur", nameBn: "দক্ষিণ দিনাজপুর", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "1.7M", gsdpShare: 1.7, activePromises: 3, deliveredPromises: 1, keyProjects: ["Hili Land Customs Station Upgradation", "Tulaipanji Aromatic Rice GI Cluster"], lat: 25.2285, lng: 88.7667 },
  { code: "DAR", nameEn: "Darjeeling", nameBn: "দার্জিলিং", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "1.8M", gsdpShare: 3.4, activePromises: 7, deliveredPromises: 2, keyProjects: ["Darjeeling Hill Tea Brand Protection", "Toy Train & High-Altitude Tourism"], lat: 27.041, lng: 88.2663 },
  { code: "HOG", nameEn: "Hooghly", nameBn: "হুগলি", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "5.5M", gsdpShare: 6.8, activePromises: 9, deliveredPromises: 3, keyProjects: ["Dankuni Logistics Freight Terminal", "Jute Modernization Cluster"], lat: 22.9031, lng: 88.3968 },
  { code: "HOW", nameEn: "Howrah", nameBn: "হাওড়া", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "4.8M", gsdpShare: 7.2, activePromises: 10, deliveredPromises: 4, keyProjects: ["Howrah Light Engineering Hub", "Foundry Cluster Environmental Upgradation"], lat: 22.5958, lng: 88.2636 },
  { code: "JAL", nameEn: "Jalpaiguri", nameBn: "জলপাইগুড়ি", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "2.4M", gsdpShare: 2.9, activePromises: 5, deliveredPromises: 1, keyProjects: ["Tea Auction Centre Digitalization", "Teesta Canal Water Management"], lat: 26.5411, lng: 88.7196 },
  { code: "JHR", nameEn: "Jhargram", nameBn: "ঝাড়গ্রাম", region: "Western Rarh", regionBn: "পশ্চিমাঞ্চল রাঢ়", population: "1.1M", gsdpShare: 1.2, activePromises: 4, deliveredPromises: 1, keyProjects: ["Jangalmahal Sabai Grass Cooperative", "Tribal Livelihood Value Addition"], lat: 22.4506, lng: 86.9925 },
  { code: "KAL", nameEn: "Kalimpong", nameBn: "কালিম্পং", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "0.5M", gsdpShare: 0.8, activePromises: 3, deliveredPromises: 1, keyProjects: ["Sikkim-Bengal Rail Link Teesta Bridge", "Horticulture & Floriculture Hub"], lat: 27.0594, lng: 88.4695 },
  { code: "KOL", nameEn: "Kolkata", nameBn: "কলকাতা", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "4.5M", gsdpShare: 15.6, activePromises: 14, deliveredPromises: 5, keyProjects: ["Silicon Valley Salt Lake Phase II", "Metro Expansion E-W & Purple Lines"], lat: 22.5726, lng: 88.3639 },
  { code: "MLD", nameEn: "Malda", nameBn: "মালদা", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "4.0M", gsdpShare: 3.5, activePromises: 6, deliveredPromises: 2, keyProjects: ["Fazli Mango Processing Park", "Ganga-Fulhar Flood Mitigation"], lat: 25.0108, lng: 88.1411 },
  { code: "MSD", nameEn: "Murshidabad", nameBn: "মুর্শিদাবাদ", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "7.1M", gsdpShare: 5.4, activePromises: 8, deliveredPromises: 2, keyProjects: ["Silk & Handloom Cluster Jiaganj", "Hazarduari Tourism Revitalization"], lat: 24.1759, lng: 88.2802 },
  { code: "NAD", nameEn: "Nadia", nameBn: "নদিয়া", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "5.2M", gsdpShare: 4.8, activePromises: 7, deliveredPromises: 2, keyProjects: ["AIIMS Kalyani Clinical Expansion", "Kalyani Industrial Growth Centre"], lat: 23.471, lng: 88.5565 },
  { code: "N24", nameEn: "North 24 Parganas", nameBn: "উত্তর ২৪ পরগনা", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "10.0M", gsdpShare: 12.4, activePromises: 12, deliveredPromises: 4, keyProjects: ["New Town IT & FinTech Hub", "Petrapole ICP Cargo Automation"], lat: 22.7214, lng: 88.4815 },
  { code: "PBD", nameEn: "Paschim Bardhaman", nameBn: "পশ্চিম বর্ধমান", region: "Western Rarh", regionBn: "পশ্চিমাঞ্চল রাঢ়", population: "2.9M", gsdpShare: 6.9, activePromises: 8, deliveredPromises: 3, keyProjects: ["Asansol-Durgapur Steel Modernization", "Andal Airport Industrial City"], lat: 23.6835, lng: 86.9833 },
  { code: "PMD", nameEn: "Paschim Medinipur", nameBn: "পশ্চিম মেদিনীপুর", region: "Western Rarh", regionBn: "পশ্চিমাঞ্চল রাঢ়", population: "5.9M", gsdpShare: 4.6, activePromises: 7, deliveredPromises: 2, keyProjects: ["Kharagpur Industrial Park II", "Vidyasagar Industrial City"], lat: 22.4257, lng: 87.3199 },
  { code: "EBD", nameEn: "Purba Bardhaman", nameBn: "পূর্ব বর্ধমান", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "4.8M", gsdpShare: 5.5, activePromises: 8, deliveredPromises: 3, keyProjects: ["Block-Level Solar Cold Storage Grid", "Rice Milling Technological Modernization"], lat: 23.2324, lng: 87.8615 },
  { code: "EMD", nameEn: "Purba Medinipur", nameBn: "পূর্ব মেদিনীপুর", region: "South Bengal", regionBn: "দক্ষিণবঙ্গ", population: "5.1M", gsdpShare: 7.8, activePromises: 11, deliveredPromises: 4, keyProjects: ["Tajpur Deep Sea Green Port", "Haldia Petrochemical Expansion & Coastal Zone"], lat: 21.9366, lng: 87.7774 },
  { code: "PUR", nameEn: "Purulia", nameBn: "পুরুলিয়া", region: "Western Rarh", regionBn: "পশ্চিমাঞ্চল রাঢ়", population: "2.9M", gsdpShare: 2.1, activePromises: 5, deliveredPromises: 1, keyProjects: ["Ayodhya Hills Eco-Circuit", "Minor Forest Produce MSP Procurement"], lat: 23.3321, lng: 86.3652 },
  { code: "S24", nameEn: "South 24 Parganas", nameBn: "দক্ষিণ ২৪ পরগনা", region: "Delta", regionBn: "উপকূলীয় বদ্বীপ", population: "8.2M", gsdpShare: 7.4, activePromises: 9, deliveredPromises: 2, keyProjects: ["Sundarbans Climate-Resilient Embankments", "Diamond Harbour Fishing Harbor"], lat: 22.1352, lng: 88.4016 },
  { code: "UDN", nameEn: "Uttar Dinajpur", nameBn: "উত্তর দিনাজপুর", region: "North Bengal", regionBn: "উত্তরবঙ্গ", population: "3.0M", gsdpShare: 2.1, activePromises: 4, deliveredPromises: 1, keyProjects: ["Raiganj Kulik Bird Sanctuary Tourism", "Corn Processing & Maize Starch Cluster"], lat: 25.6256, lng: 88.1256 },
];

export default function DistrictMap() {
  const t = useTranslations("DistrictMap");
  const locale = useLocale();
  const [selectedCode, setSelectedCode] = useState<string>("EMD"); // Default to Purba Medinipur (Tajpur/Haldia)
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"visual" | "table">("visual");

  const format = (val: string | number) => {
    return locale === "bn" ? toBengaliNumerals(val) : val.toString();
  };

  const filteredDistricts = DISTRICTS_DATA.filter(
    (d) => regionFilter === "ALL" || d.region === regionFilter
  );

  const selectedDistrict = DISTRICTS_DATA.find((d) => d.code === selectedCode) || DISTRICTS_DATA[0];

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-950/10 my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            📍 {locale === "bn" ? "২৩টি জেলা পর্যবেক্ষণ" : "23 West Bengal Districts"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {locale === "bn" ? "জেলা কর্মক্ষমতা ও আঞ্চলিক রূপান্তর" : "District Performance & Regional Transformation"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === "bn"
              ? "উত্তরবঙ্গ থেকে জঙ্গলমহল—প্রতিটি জেলার অর্থনৈতিক অবদান, প্রতিশ্রুতি ও বাস্তবায়ন অগ্রগতি।"
              : "Regional tracking of GSDP contribution, local infrastructure projects, and promise delivery."}
          </p>
        </div>

        {/* View Toggle and Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            aria-label="Filter by region"
          >
            <option value="ALL">{locale === "bn" ? "সকল অঞ্চল (২৩ জেলা)" : "All Regions (23 Districts)"}</option>
            <option value="North Bengal">{locale === "bn" ? "উত্তরবঙ্গ" : "North Bengal"}</option>
            <option value="South Bengal">{locale === "bn" ? "দক্ষিণবঙ্গ" : "South Bengal"}</option>
            <option value="Western Rarh">{locale === "bn" ? "পশ্চিমাঞ্চল রাঢ়" : "Western Rarh"}</option>
            <option value="Delta">{locale === "bn" ? "সুন্দরবন বদ্বীপ" : "Delta Sundarbans"}</option>
          </select>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("visual")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md min-h-[36px] transition-all ${
                viewMode === "visual" ? "bg-white text-ink shadow-sm font-bold" : "text-gray-600 hover:text-ink"
              }`}
            >
              {locale === "bn" ? "গ্রিড মানচিত্র" : "Visual Grid"}
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md min-h-[36px] transition-all ${
                viewMode === "table" ? "bg-white text-ink shadow-sm font-bold" : "text-gray-600 hover:text-ink"
              }`}
            >
              {locale === "bn" ? "সারণী ভিউ (AA)" : "Accessible Table"}
            </button>
          </div>
        </div>
      </div>

      {viewMode === "visual" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
          {/* District Grid Selector */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[480px] overflow-y-auto pr-2">
            {filteredDistricts.map((d) => (
              <button
                key={d.code}
                onClick={() => setSelectedCode(d.code)}
                className={`p-3 rounded-xl border text-left transition-all min-h-[72px] flex flex-col justify-between ${
                  selectedCode === d.code
                    ? "bg-primary text-white border-primary shadow-md ring-2 ring-primary ring-offset-1"
                    : "bg-gray-50/70 border-gray-200 hover:bg-white hover:border-emerald-600/50 hover:shadow-sm"
                }`}
                aria-pressed={selectedCode === d.code}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    selectedCode === d.code ? "bg-emerald-800 text-white" : "bg-gray-200 text-gray-700"
                  }`}>
                    {d.code}
                  </span>
                  <span className={`text-[11px] ${selectedCode === d.code ? "text-emerald-100" : "text-gray-500"}`}>
                    {format(d.gsdpShare)}% GSDP
                  </span>
                </div>
                <div className="font-bold text-xs sm:text-sm truncate w-full mt-1">
                  {locale === "bn" ? d.nameBn : d.nameEn}
                </div>
              </button>
            ))}
          </div>

          {/* Selected District Detail Card */}
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-900/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  {locale === "bn" ? selectedDistrict.regionBn : selectedDistrict.region}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {selectedDistrict.code}
                </span>
              </div>

              <h3 className="text-2xl font-black text-ink mt-2 mb-4">
                {locale === "bn" ? selectedDistrict.nameBn : selectedDistrict.nameEn}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[11px] text-gray-500 block">
                    {locale === "bn" ? "জনসংখ্যা" : "Population"}
                  </span>
                  <span className="text-lg font-bold text-ink">{format(selectedDistrict.population)}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[11px] text-gray-500 block">
                    {locale === "bn" ? "রাজ্যের জিএসডিপিতে অংশ" : "GSDP Share"}
                  </span>
                  <span className="text-lg font-bold text-emerald-800">
                    {format(selectedDistrict.gsdpShare)}%
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[11px] text-gray-500 block">
                    {locale === "bn" ? "ট্র্যাক করা প্রতিশ্রুতি" : "Active Promises"}
                  </span>
                  <span className="text-lg font-bold text-ink">{format(selectedDistrict.activePromises)}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[11px] text-gray-500 block">
                    {locale === "bn" ? "বাস্তবায়িত মাইলফলক" : "Delivered"}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {format(selectedDistrict.deliveredPromises)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  {locale === "bn" ? "প্রধান আঞ্চলিক প্রকল্পসমূহ:" : "Key Regional Projects:"}
                </h4>
                <ul className="space-y-2">
                  {selectedDistrict.keyProjects.map((p, i) => (
                    <li key={i} className="text-xs text-gray-800 flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-emerald-50">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
              🗺️ Coordinates: {selectedDistrict.lat.toFixed(2)}°N, {selectedDistrict.lng.toFixed(2)}°E
            </div>
          </div>
        </div>
      ) : (
        /* Accessible Table Alternative (WCAG 2.2 AA compliant fallback) */
        <div className="my-6 overflow-x-auto rounded-xl border border-gray-200">
          <table
            className="min-w-full divide-y divide-gray-200 text-left text-xs"
            role="table"
            aria-label="West Bengal 23 Districts Development Data"
          >
            <thead className="bg-gray-100 font-bold text-ink">
              <tr>
                <th scope="col" className="px-4 py-3">Code</th>
                <th scope="col" className="px-4 py-3">{locale === "bn" ? "জেলার নাম" : "District Name"}</th>
                <th scope="col" className="px-4 py-3">{locale === "bn" ? "অঞ্চল" : "Region"}</th>
                <th scope="col" className="px-4 py-3">{locale === "bn" ? "জনসংখ্যা" : "Population"}</th>
                <th scope="col" className="px-4 py-3">{locale === "bn" ? "জিএসডিপি অংশ (%)" : "GSDP Share (%)"}</th>
                <th scope="col" className="px-4 py-3">{locale === "bn" ? "প্রতিশ্রুতি" : "Active Promises"}</th>
                <th scope="col" className="px-4 py-3">{locale === "bn" ? "বাস্তবায়িত" : "Delivered"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredDistricts.map((d) => (
                <tr key={d.code} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono font-bold text-emerald-800">{d.code}</td>
                  <td className="px-4 py-2.5 font-bold text-ink">
                    {locale === "bn" ? d.nameBn : d.nameEn}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {locale === "bn" ? d.regionBn : d.region}
                  </td>
                  <td className="px-4 py-2.5">{format(d.population)}</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-800">{format(d.gsdpShare)}%</td>
                  <td className="px-4 py-2.5">{format(d.activePromises)}</td>
                  <td className="px-4 py-2.5 text-primary font-bold">{format(d.deliveredPromises)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}