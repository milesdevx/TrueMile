import { TrueMileLogo } from '@/components/site/truemile-logo';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <TrueMileLogo variant="on-ink" aria-label="TrueMile" />
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper/70">
              Private vehicle history, verified on the Midnight network.
            </p>
          </div>

          <div aria-hidden="true" className="flex items-center gap-1.5 pt-1 sm:pt-3">
            <span className="h-2.5 w-14 rounded-[2px] bg-paper/25" />
            <span className="h-2.5 w-20 rounded-[2px] bg-paper/25" />
            <span className="h-2.5 w-10 rounded-[2px] bg-paper/25" />
            <span className="ml-3 h-1.5 w-1.5 rounded-full bg-teal" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-paper/15 pt-5 text-xs text-paper/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TrueMile</p>
          <p>Only the claim result is ever published. Raw history stays private.</p>
        </div>
      </div>
    </footer>
  );
}
