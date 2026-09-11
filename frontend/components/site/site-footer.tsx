import Link from 'next/link';
import { TrueMileLogo } from '@/components/site/truemile-logo';
import { StatusChip } from '@/components/site/status-chip';
import { VerifiedStamp } from '@/components/site/verified-stamp';

const FOOTER_LINKS = [
  { href: '/registry', label: 'Claims registry', internal: true },
  { href: 'https://github.com/milesdevx/TrueMile', label: 'Repository', internal: false },
  { href: 'https://github.com/milesdevx/TrueMile#readme', label: 'Docs / README', internal: false },
  {
    href: 'https://youtu.be/3UtOo4ppqYg?si=PbzPMR8OD33oA6_e',
    label: 'Demo video',
    internal: false,
  },
  {
    href: 'https://docs.google.com/presentation/d/1UtGHGqnfH4wzkO1UkTrFIxAUUsS0VswF3KpOJUhMd7Y/edit?usp=sharing',
    label: 'Slide deck',
    internal: false,
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ground">
      {/* Perforated top edge — like tearing off the bottom of a title document. */}
      <div aria-hidden="true" className="perforated h-px w-full opacity-60" />

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          <div>
            <TrueMileLogo aria-label="TrueMile" />
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-faint">
              Private vehicle history, verified on the Midnight network.
            </p>
          </div>

          <nav aria-label="Footer" className="md:justify-self-center">
            <ul className="flex flex-col gap-2 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  {link.internal ? (
                    <Link
                      href={link.href}
                      className="text-dim transition-colors hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-dim transition-colors hover:text-bone"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:justify-self-end">
            <StatusChip
              tone="faint"
              label="Wave 1 · local demo"
              title="Wave 1 evaluates claims in this browser. No live proof server, network, or wallet is connected yet."
            />
          </div>
        </div>

        <p className="mt-10 text-center text-sm leading-relaxed text-sealed">
          Only the claim result is ever published. Raw history stays private.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-line/60 pt-5 text-xs text-faint sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <VerifiedStamp muted className="h-6 w-6" />
            <span>© 2026 TrueMile</span>
          </div>
          <span>Apache 2.0 · Built on Midnight</span>
        </div>
      </div>
    </footer>
  );
}
