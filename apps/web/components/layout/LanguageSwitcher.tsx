'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    if (segments[1] === 'en' || segments[1] === 'bn') {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <nav
      aria-label="Language Selector"
      className={cn(
        "inline-flex items-center rounded-lg bg-emerald-950/40 p-1 border border-emerald-800",
        className
      )}
    >
      <button
        type="button"
        onClick={() => switchLocale('en')}
        aria-pressed={locale === 'en'}
        aria-label="Switch language to English"
        className={cn(
          "min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary",
          locale === 'en'
            ? "bg-white text-primary shadow font-bold"
            : "text-white/90 hover:text-white hover:bg-emerald-800/60"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale('bn')}
        aria-pressed={locale === 'bn'}
        aria-label="Switch language to Bengali (বাংলা)"
        className={cn(
          "min-h-[44px] min-w-[44px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary",
          locale === 'bn'
            ? "bg-white text-primary shadow font-bold"
            : "text-white/90 hover:text-white hover:bg-emerald-800/60"
        )}
      >
        বাংলা
      </button>
    </nav>
  );
}