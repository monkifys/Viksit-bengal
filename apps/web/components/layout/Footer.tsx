import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <footer
      role="contentinfo"
      className="bg-stone-900 text-stone-100 border-t border-stone-800 mt-auto py-10 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Platform Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">
                {t("brand")}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 font-semibold border border-emerald-700">
                WCAG 2.2 AA
              </span>
            </div>
            <p className="text-sm text-stone-300 max-w-md leading-relaxed">
              {locale === "bn"
                ? "পশ্চিমবঙ্গকে ২০৩০ সালের মধ্যে ১ ট্রিলিয়ন ডলার অর্থনীতিতে রূপান্তরের অগ্রগতির উন্মুক্ত ও স্বচ্ছ ডেটা পর্যবেক্ষণ প্ল্যাটফর্ম।"
                : "Transparent tracking platform for West Bengal's economic trajectory towards a $1 Trillion GSDP economy by 2030."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {locale === "bn" ? "দ্রুত লিংক" : "Navigation"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/promises`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("promises")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/districts`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("districts")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/indicators`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("indicators")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Accountability Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {locale === "bn" ? "দায়বদ্ধতার মূল নীতিসমূহ" : "Accountability Rules"}
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li className="flex items-start gap-1.5">
                <span className="text-[#E8620A] font-bold">১.</span>
                <span>{locale === "bn" ? "জনসম্মুখে করা সরকারি প্রতিশ্রুতি যাচাই" : "Track promises made publicly in manifesto"}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E8620A] font-bold">২.</span>
                <span>{locale === "bn" ? "গেজেট ও দরপত্র প্রাথমিক প্রমাণ হিসেবে গণ্য" : "Primary evidence: gazettes, orders, tenders"}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E8620A] font-bold">৩.</span>
                <span>{locale === "bn" ? "ঘোষণা ও বাস্তবায়নের মধ্যে সুনির্দিষ্ট পার্থক্য" : "Distinguish announced vs actual delivery"}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#E8620A] font-bold">৪.</span>
                <span>{locale === "bn" ? "নাগরিক যাচাই ও উন্মুক্ত সংশোধনের সুযোগ" : "Open for public correction and citizen audits"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            &copy; {new Date().getFullYear()} Viksit Bengal Project. Open Data Initiative.
          </p>
          <p>
            {locale === "bn"
              ? "সর্বজনীন ব্যবহারের জন্য উন্মুক্ত তথ্য পোর্টাল"
              : "Public economic research and transparency portal"}
          </p>
        </div>
      </div>
    </footer>
  );
}