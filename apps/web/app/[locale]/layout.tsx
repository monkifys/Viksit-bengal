import '@/globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { locales, type Locale } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the requested locale is supported
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const skipText = locale === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to content';

  return (
    <html lang={locale}>
      <body className="bg-lightBg text-ink flex flex-col min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* High-visibility skip-to-content navigation link for keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:font-bold focus:rounded-md focus:shadow-2xl focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {skipText}
          </a>
          <Header />
          <main
            id="main-content"
            role="main"
            tabIndex={-1}
            className="flex-1 outline-none"
          >
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}