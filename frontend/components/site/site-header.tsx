import Link from 'next/link';
import { TrueMileLogo } from '@/components/site/truemile-logo';
import { CtaLink } from '@/components/site/cta-link';

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-paper">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <TrueMileLogo aria-label="TrueMile home" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 sm:flex">
          <Link
            href="/seller"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Sellers
          </Link>
          <Link
            href="/buyer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Buyers
          </Link>
        </nav>

        <CtaLink href="/seller" variant="amber" size="sm">
          Submit a claim
        </CtaLink>
      </div>
    </header>
  );
}
