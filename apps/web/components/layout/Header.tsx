import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <header
      role="banner"
      className="bg-primary text-white border-b border-emerald-900 shadow-md sticky top-0 z-40 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo and Title */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 rounded-lg py-1 px-2 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary"
              aria-label="Viksit Bengal Dashboard - Home"
            >
              <div
                className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0"
                aria-hidden="true"
              >
                VB
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight leading-tight text-white">
                  {t("brand")}
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-100 font-medium">
                  {locale === "bn" ? "২০৩০ লক্ষ্যমাত্রা" : "Vision 2030 ($1T)"}
                </span>
              </div>
            </Link>
          </div>

          {/* Primary Navigation Landmark */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            <Link
              href={`/${locale}`}
              className="min-h-[44px] px-3.5 py-2 rounded-md text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary"
            >
              {t("home")}
            </Link>
            <Link
              href={`/${locale}/promises`}
              className="min-h-[44px] px-3.5 py-2 rounded-md text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary"
            >
              {t("promises")}
            </Link>
            <Link
              href={`/${locale}/districts`}
              className="min-h-[44px] px-3.5 py-2 rounded-md text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary"
            >
              {t("districts")}
            </Link>
            <Link
              href={`/${locale}/indicators`}
              className="min-h-[44px] px-3.5 py-2 rounded-md text-sm font-medium text-white hover:bg-emerald-800 transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary"
            >
              {t("indicators")}
            </Link>
            <Link
              href={`/${locale}/admin`}
              className="min-h-[44px] px-3.5 py-2 rounded-md text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary"
            >
              {t("admin")}
            </Link>
          </nav>

          {/* Action / Language Switcher */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}