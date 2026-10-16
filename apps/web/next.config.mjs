import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/latest.html',
        destination: '/en#ai-scraper-stream',
        permanent: false,
      },
      {
        source: '/latest',
        destination: '/en#ai-scraper-stream',
        permanent: false,
      },
      {
        source: '/initiatives.html',
        destination: '/en/promises',
        permanent: false,
      },
      {
        source: '/initiatives',
        destination: '/en/promises',
        permanent: false,
      },
      {
        source: '/manifesto.html',
        destination: '/en/manifesto',
        permanent: false,
      },
      {
        source: '/tracker.html',
        destination: '/en',
        permanent: false,
      },
      {
        source: '/tracker',
        destination: '/en',
        permanent: false,
      },
      {
        source: '/index.html',
        destination: '/en',
        permanent: false,
      },
      {
        source: '/faq.html',
        destination: '/en#methodology',
        permanent: false,
      },
      {
        source: '/help.html',
        destination: '/en#methodology',
        permanent: false,
      },
      {
        source: '/promises.html',
        destination: '/en/promises',
        permanent: false,
      },
      {
        source: '/districts.html',
        destination: '/en/districts',
        permanent: false,
      },
      {
        source: '/indicators.html',
        destination: '/en/indicators',
        permanent: false,
      },
      {
        source: '/admin.html',
        destination: '/en/admin',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);