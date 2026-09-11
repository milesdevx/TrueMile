'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrueMileLogo } from '@/components/site/truemile-logo';
import { SegmentedNav, type SegmentedNavItem } from '@/components/site/segmented-nav';
import { NavVerify } from '@/components/site/nav-verify';
import { StatusChip } from '@/components/site/status-chip';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { WalletButton } from '@/components/site/wallet-connect';
import { cn } from '@/lib/utils';

const NAV_ITEMS: SegmentedNavItem[] = [
  { href: '/seller', label: 'Sellers' },
  { href: '/buyer', label: 'Buyers' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300 motion-reduce:transition-none',
        scrolled ? 'border-line/80 bg-ground/90' : 'border-transparent bg-ground/40'
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
          >
            <TrueMileLogo aria-label="TrueMile home" wordmarkClassName="hidden sm:inline" />
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-6 border-l border-dashed border-line lg:block"
          />
          <NavVerify className="hidden lg:flex" />
        </div>

        <SegmentedNav items={NAV_ITEMS} />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <StatusChip
            tone="faint"
            label="WAVE 1"
            className="hidden rounded-[4px] border-dashed px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] md:inline-flex"
            title="Local demo — Wave 1 evaluates claims in this browser. No live proof server, network, or wallet is connected yet."
          />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
