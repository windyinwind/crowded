import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Sans } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ['400', '500', '700', '900'],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ['400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: "CrowdCompass - Train Congestion Monitoring",
  description: "Real-time train congestion status using LLM technology",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'ja')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${notoSans.variable} ${notoSansJP.variable} antialiased`}
        style={{ fontFamily: locale === 'ja' ? 'var(--font-noto-sans-jp)' : 'var(--font-noto-sans)' }}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
