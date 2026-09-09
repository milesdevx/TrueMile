'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VerifiedStamp } from '@/components/site/verified-stamp';
import { verifyClaim, isValidCommitment } from '@/lib/midnight-client';

export default function BuyerPage() {
  const [commitment, setCommitment] = useState('');
  const [result, setResult] = useState<{ commitment: string; verified: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const normalized = commitment.trim();
    if (!isValidCommitment(normalized)) {
      setError('Please enter a valid 64-character hex commitment.');
      return;
    }

    setLoading(true);
    try {
      const claimResult = await verifyClaim(normalized);
      setResult(claimResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify claim');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
      <Link
        href="/"
        className="text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-ink"
      >
        Back to TrueMile
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] text-graphite sm:text-4xl">
        Verify a claim
      </h1>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        Paste the seller&apos;s public commitment to confirm the claim result
        on-chain. The underlying vehicle history stays sealed.
      </p>

      <form onSubmit={handleVerify} className="mt-8">
        <section className="overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <label htmlFor="commitment" className="mb-1.5 block text-sm font-medium text-foreground">
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
            <p className="mt-2 text-xs text-muted-foreground">
              A 64-character hash the seller received after generating their proof.
            </p>
          </div>
        </section>

        <Button type="submit" size="lg" className="mt-5 w-full" isLoading={loading}>
          Verify commitment
        </Button>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-300/80 bg-red-50/70 px-3 py-2.5 text-sm text-red-800"
          >
            {error}
          </p>
        )}
      </form>

      <div aria-live="polite" className="mt-8">
        {result &&
          (result.verified ? (
            <div className="overflow-hidden rounded-lg border border-amber/60 bg-ink text-paper">
              <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <VerifiedStamp className="h-14 w-14 rotate-3" />
                <div>
                  <p className="font-semibold">Claim verified</p>
                  <p className="mt-0.5 text-xs text-paper/70">
                    The commitment matched a claim issued in this session
                  </p>
                </div>
              </div>
              <div className="border-t border-paper/15 px-5 py-4 sm:px-6">
                <p className="text-xs text-paper/60">Commitment</p>
                <code className="mt-2 block break-all font-mono text-[13px] leading-relaxed text-amber">
                  {result.commitment}
                </code>
                <p className="mt-3 text-xs leading-relaxed text-paper/60">
                  To unlock the full history, commit a deposit to the contract. The
                  deposit returns if the claim does not hold.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-300/80 bg-card px-5 py-4 sm:px-6">
              <p className="font-semibold text-red-800">No valid claim found</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                This commitment did not match a claim issued in this browser session.
                Double-check the hash with the seller.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
