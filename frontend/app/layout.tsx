import type { Metadata } from 'next';
import Script from 'next/script';
import { Barlow_Condensed, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import './globals.css';

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TrueMile — Private Vehicle History Verification',
  description:
    'Prove a vehicle history claim without exposing the full report. Built on Midnight.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${interTight.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-ground text-bone" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var d=document.documentElement;var s=localStorage.getItem('truemile-theme');if(s!=='light'&&s!=='dark'){s=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}d.setAttribute('data-theme',s);}catch(e){}})();`}
        </Script>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-signal focus:px-4 focus:py-2 focus:text-sm focus:text-onaccent focus:ring-2 focus:ring-seal"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="grow">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
