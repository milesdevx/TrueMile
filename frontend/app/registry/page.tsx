import Link from 'next/link';
import { ClaimsRegistry } from '@/components/site/claims-registry';
import { StatusChip } from '@/components/site/status-chip';

export const metadata = {
  title: 'Claims registry — TrueMile',
  description: 'Public claim commitments and verdicts. Raw vehicle history stays sealed.',
};

export default function RegistryPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
      <Link
        href="/"
        className="text-sm text-dim underline decoration-line underline-offset-4 transition-colors hover:text-bone"
      >
        Back to TrueMile
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-semibold uppercase leading-none tracking-[0.02em] text-bone sm:text-5xl">
          Claims registry
        </h1>
        <StatusChip tone="faint" label="Local registry · Wave 1" />
      </div>

      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-dim">
        Every claim commitment and its verdict is public by design. Timestamps and
        vehicle-identity commitments are shown; the raw history never is.
      </p>

      <ClaimsRegistry className="mt-8" />

      <p className="mt-4 text-xs leading-relaxed text-faint">
        Wave 1 reads the browser-local registry that stands in for the on-chain
        <span className="font-mono"> claimCommitments </span> map until the Midnight SDK wiring lands.
      </p>
    </div>
  );
}
