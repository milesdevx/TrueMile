'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProofSeal, type ProofSealState } from '@/components/site/proof-seal';
import { StatusChip } from '@/components/site/status-chip';
import { verifyClaim, isValidCommitment, getExampleCommitment, type VerifyStage } from '@/lib/midnight-client';
import { cn } from '@/lib/utils';
import { useWallet } from '@/lib/useWallet';

const VERIFY_STAGE_LABEL: Record<VerifyStage, string> = {
  reading: 'Reading the commitment…',
  resolving: 'Resolving the claim result…',
};

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function BuyerPage() {
  const { isConnected, ensureConnected, recordActivity } = useWallet();
  const [commitment, setCommitment] = useState('');
  const [result, setResult] = useState<{ commitment: string; verified: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<VerifyStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runVerify(value: string) {
    // Restored sessions are re-authorized here, at the point of action — never
    // on page load — so refreshing does not prompt the wallet.
    const connectedApi = await ensureConnected();
    if (!connectedApi) return;

    setError(null);
    setResult(null);
    setStage('reading');

    const normalized = value.trim();
    if (!isValidCommitment(normalized)) {
      setError('Please enter a valid 64-character hex commitment.');
      return;
    }

    setLoading(true);
    try {
      const claimResult = await verifyClaim(normalized, { onStage: setStage });
      setResult(claimResult);
      if (claimResult.verified) {
        recordActivity('claim_verified', normalized);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify claim');
    } finally {
      setLoading(false);
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    void runVerify(commitment);
  }

  function handleExample() {
    const example = getExampleCommitment();
    setCommitment(example);
    void runVerify(example);
  }

  const sealState: ProofSealState = loading
    ? 'verifying'
    : result?.verified
      ? 'verified'
      : 'failed';
  const panelTone = loading
    ? 'border-line'
    : result?.verified
      ? 'border-seal/50'
      : 'border-danger/50';
  const resultTitle = loading ? 'Checking the commitment' : result?.verified ? 'Claim verified' : 'No valid claim found';
  const resultNote = loading
    ? stage
      ? VERIFY_STAGE_LABEL[stage]
      : 'Checking the claim…'
    : result?.verified
      ? 'The commitment matched a claim issued in this session'
      : 'This commitment did not match a claim issued in this browser session. Double-check the hash with the seller.';

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
      <Link
        href="/"
        className="text-sm text-dim underline decoration-line underline-offset-4 transition-colors hover:text-bone"
      >
        Back to TrueMile
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-semibold uppercase leading-none tracking-[0.02em] text-bone sm:text-5xl">
          Verify a claim
        </h1>
        <StatusChip tone="seal" label="Result out · becomes public" />
      </div>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-dim">
        Paste the seller&apos;s public commitment to confirm the claim result. The
        underlying vehicle history stays sealed.
      </p>

      <form onSubmit={handleVerify} className="mt-8">
        <section className="overflow-hidden rounded-lg border border-line/80 border-l-2 border-l-seal bg-panel">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <label
              htmlFor="commitment"
              className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.14em] text-faint"
            >
              Claim commitment
            </label>
            <Input
              id="commitment"
              placeholder="64-character hex commitment"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              className="font-mono text-[15px] tracking-[-0.01em]"
              autoComplete="off"
              spellCheck={false}
              required
            />
            <p className="mt-2 text-xs text-dim">
              A 64-character hash the seller received after generating their proof.
            </p>

            <button
              type="button"
              onClick={handleExample}
              disabled={loading}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-seal underline decoration-seal/40 underline-offset-4 transition-colors hover:decoration-seal disabled:opacity-50"
            >
              Use an example claim →
            </button>
          </div>
        </section>

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify commitment'}
        </Button>

        {!isConnected && (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            A wallet is required to run a verification. The registry below stays
            readable without one.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-danger/50 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            {error}
          </p>
        )}
      </form>

      <div aria-live="polite" className="mt-8">
        {(loading || result) && (
          <div
            className={cn(
              'overflow-hidden rounded-lg border bg-panel transition-colors duration-300',
              panelTone
            )}
          >
            <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
              <ProofSeal state={sealState} className="h-14 w-14" />
              <div>
                <p className="font-semibold text-bone">{resultTitle}</p>
                <p className="mt-0.5 text-xs text-dim">{resultNote}</p>
              </div>
            </div>

            {result?.verified && (
              <div className="border-t border-line/70 px-5 py-4 sm:px-6">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-faint">
                  Commitment
                </p>
                <code className="mt-2 block break-all font-mono text-[13px] leading-relaxed text-seal">
                  {result.commitment}
                </code>
                <p className="mt-3 text-xs leading-relaxed text-dim">
                  To unlock the full history, commit a deposit to the contract. The
                  deposit returns if the claim does not hold.
                </p>

                {/* Present now, disabled until Wave 2 — the locked-state language
                    should exist before the deposit mechanism does. */}
                <div
                  aria-disabled="true"
                  title="Coming in Wave 2 — the deposit-gated unlock lands then."
                  className="mt-4 flex items-center justify-between gap-3 rounded-md border border-dashed border-line bg-panel2/40 px-3.5 py-2.5"
                >
                  <span className="inline-flex items-center gap-2 text-sm text-faint">
                    <LockIcon />
                    Unlock full history
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
                    Coming in Wave 2
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
