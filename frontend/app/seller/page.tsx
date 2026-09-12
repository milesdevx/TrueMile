'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Odometer } from '@/components/site/odometer';
import { ProofSeal, type ProofSealState } from '@/components/site/proof-seal';
import { StatusChip } from '@/components/site/status-chip';
import {
  submitClaim,
  vehicleIdentity,
  type VehicleHistory,
  type ClaimCriteria,
  type ClaimResult,
  type SubmitStage,
} from '@/lib/midnight-client';
import { cn, formatCommitment, parseBoundedInt } from '@/lib/utils';
import { buildVerificationBadgeSvg, downloadVerificationBadgeJpg } from '@/lib/badge';
import { useWallet } from '@/lib/useWallet';

const numberInputCls =
  'font-mono text-[15px] tracking-[-0.01em] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const textInputCls = 'font-mono text-[15px] uppercase tracking-[0.04em]';

const SUBMIT_STAGE_LABEL: Record<SubmitStage, string> = {
  evaluating: 'Reading sealed history…',
  hashing: 'Generating the commitment…',
  committing: 'Sealing the claim…',
};

function SectionHeader({
  title,
  note,
  chip,
  tone,
}: {
  title: string;
  note: string;
  chip?: string;
  tone: 'sealed' | 'faint';
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 px-5 py-4 sm:px-6">
      <div>
        <h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-bone">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-dim">{note}</p>
      </div>
      {chip && <StatusChip tone={tone} label={chip} />}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  suffix?: string;
  hint?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.14em] text-faint"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          className={numberInputCls}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-faint">
            {suffix}
          </span>
        )}
      </div>
      {hint && <div className="mt-2.5">{hint}</div>}
    </div>
  );
}

export default function SellerPage() {
  const { isConnected, ensureConnected, recordActivity } = useWallet();
  const [mileage, setMileage] = useState('54000');
  const [majorAccidents, setMajorAccidents] = useState('0');
  const [dealerServices, setDealerServices] = useState('3');
  const [totalServices, setTotalServices] = useState('4');
  const [vin, setVin] = useState('1HGBH41JXMN109186');

  const [criteria, setCriteria] = useState<ClaimCriteria>({
    maxMajorAccidents: 0,
    maxMileage: 60000,
    minDealerServiceRatio: 50,
  });

  const [result, setResult] = useState<ClaimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<SubmitStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Restored sessions are re-authorized here, at the point of action — never
    // on page load — so refreshing does not prompt the wallet.
    const connectedApi = await ensureConnected();
    if (!connectedApi) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStage('evaluating');

    try {
      const mileageNum = parseBoundedInt(mileage, { min: 0 });
      const majorAccidentsNum = parseBoundedInt(majorAccidents, { min: 0 });
      const dealerServicesNum = parseBoundedInt(dealerServices, { min: 0 });
      const totalServicesNum = parseBoundedInt(totalServices, { min: 0 });

      if (dealerServicesNum > totalServicesNum) {
        setError('Dealer services cannot be more than total services.');
        return;
      }

      const history: VehicleHistory = {
        accidents: Array.from({ length: majorAccidentsNum }).map(() => ({
          severity: 'Major',
          date: 100,
        })),
        mileage: mileageNum,
        serviceEvents: [
          ...Array.from({ length: dealerServicesNum }).map(() => ({
            dealer: true,
            date: 100,
          })),
          ...Array.from({ length: totalServicesNum - dealerServicesNum }).map(() => ({
            dealer: false,
            date: 100,
          })),
        ],
      };

      const claimResult = await submitClaim(history, criteria, { vin, onStage: setStage });
      setResult(claimResult);
      recordActivity('claim_submitted', claimResult.commitment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  }

  const mileagePreview = parseBoundedInt(mileage, { min: 0 });

  async function handleDownloadBadge() {
    if (!result?.verified) return;
    const svg = buildVerificationBadgeSvg({
      commitment: result.commitment,
      vehicleId: result.vehicleId,
      verified: result.verified,
    });
    try {
      await downloadVerificationBadgeJpg(
        `truemile-badge-${result.commitment.slice(0, 8)}.jpg`,
        svg
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the badge image.');
    }
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
  const resultTitle = loading ? 'Generating proof' : result?.verified ? 'Claim issued' : 'Claim not issued';
  const resultNote = loading
    ? stage
      ? SUBMIT_STAGE_LABEL[stage]
      : 'Preparing the claim…'
    : result?.verified
      ? 'Wave 1 evaluates claims in this browser — not yet on-chain'
      : 'Your history does not satisfy the claim criteria. Adjust the bounds above and try again.';

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
          Submit a private claim
        </h1>
        <StatusChip tone="sealed" label="Data in · stays sealed" />
      </div>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-dim">
        Enter your vehicle history and the claim you want to prove. Only the result
        is made public; the raw data stays on this device.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="overflow-hidden rounded-lg border border-line/80 border-l-2 border-l-sealed bg-panel">
          <SectionHeader
            title="Private vehicle history"
            note="Numbers typed here are used only to build your proof"
            chip="Sealed"
            tone="sealed"
          />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="seller-vin"
                className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-[0.14em] text-faint"
              >
                VIN · kept private
              </label>
              <Input
                id="seller-vin"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className={textInputCls}
                maxLength={17}
                autoComplete="off"
                spellCheck={false}
              />
              <p className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-faint">
                <span>Vehicle identity commitment</span>
                <code className="font-mono text-seal">{formatCommitment(vehicleIdentity(vin))}</code>
              </p>
            </div>

            <NumberField
              id="seller-mileage"
              label="Mileage"
              value={mileage}
              onChange={setMileage}
              min={0}
              hint={<Odometer value={mileagePreview} digits={6} size="sm" label="Mileage" suffix="mi" />}
            />
            <NumberField
              id="seller-accidents"
              label="Major accidents"
              value={majorAccidents}
              onChange={setMajorAccidents}
              min={0}
            />
            <NumberField
              id="seller-dealer"
              label="Dealer services"
              value={dealerServices}
              onChange={setDealerServices}
              min={0}
            />
            <NumberField
              id="seller-total"
              label="Total services"
              value={totalServices}
              onChange={setTotalServices}
              min={0}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-line/80 bg-panel">
          <SectionHeader
            title="What you are proving"
            note="The claim states your history stays within these bounds"
            tone="faint"
          />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-3 sm:px-6 sm:py-6">
            <NumberField
              id="criteria-mileage"
              label="Max mileage"
              value={String(criteria.maxMileage)}
              onChange={(v) =>
                setCriteria({ ...criteria, maxMileage: parseBoundedInt(v, { min: 0 }) })
              }
              min={0}
              suffix="mi"
            />
            <NumberField
              id="criteria-accidents"
              label="Max major accidents"
              value={String(criteria.maxMajorAccidents)}
              onChange={(v) =>
                setCriteria({
                  ...criteria,
                  maxMajorAccidents: parseBoundedInt(v, { min: 0 }),
                })
              }
              min={0}
            />
            <NumberField
              id="criteria-dealer-ratio"
              label="Min dealer-serviced"
              value={String(criteria.minDealerServiceRatio)}
              onChange={(v) =>
                setCriteria({
                  ...criteria,
                  minDealerServiceRatio: parseBoundedInt(v, { min: 0, max: 100 }),
                })
              }
              min={0}
              max={100}
              suffix="%"
            />
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Generating proof…' : 'Generate verified claim'}
        </Button>

        {!isConnected && (
          <p className="text-xs leading-relaxed text-faint">
            A wallet is required to submit a claim&apos;s proof. Your vehicle data never
            leaves this device.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger/50 bg-danger/10 px-3 py-2.5 text-sm text-danger"
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
                  Public commitment
                </p>
                <code className="mt-2 block break-all font-mono text-[13px] leading-relaxed text-seal">
                  {result.commitment}
                </code>
                <p className="mt-2 font-mono text-[11px] text-faint">
                  Vehicle ID {formatCommitment(result.vehicleId)}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-dim">
                  Share this commitment with buyers. They can verify the claim result
                  without ever seeing your history. In this demo the registry lives in
                  the current browser session.
                </p>
                <div className="mt-4">
                  <Button type="button" variant="outline" size="sm" onClick={handleDownloadBadge}>
                    Download embeddable badge (JPG)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
