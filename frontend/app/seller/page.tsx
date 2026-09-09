'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VerifiedStamp } from '@/components/site/verified-stamp';
import { submitClaim, type VehicleHistory, type ClaimCriteria } from '@/lib/midnight-client';
import { parseBoundedInt } from '@/lib/utils';

const numberInputCls =
  'font-mono text-[15px] tracking-[-0.01em] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

function SectionHeader({
  title,
  note,
  chip,
}: {
  title: string;
  note: string;
  chip?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
      </div>
      {chip && (
        <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal" />
          {chip}
        </span>
      )}
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
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
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SellerPage() {
  const [mileage, setMileage] = useState('54000');
  const [majorAccidents, setMajorAccidents] = useState('0');
  const [dealerServices, setDealerServices] = useState('3');
  const [totalServices, setTotalServices] = useState('4');

  const [criteria, setCriteria] = useState<ClaimCriteria>({
    maxMajorAccidents: 0,
    maxMileage: 60000,
    minDealerServiceRatio: 50,
  });

  const [result, setResult] = useState<{ commitment: string; verified: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

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

      const claimResult = await submitClaim(history, criteria);
      setResult(claimResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
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
        Submit a private claim
      </h1>
      <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        Enter your vehicle history and the claim you want to prove. Only the result
        is made public; the raw data stays on this device.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground">
          <SectionHeader
            title="Private vehicle history"
            note="Numbers typed here are used only to build your proof"
            chip="Sealed"
          />
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
            <NumberField
              id="seller-mileage"
              label="Mileage"
              value={mileage}
              onChange={setMileage}
              min={0}
              suffix="mi"
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

        <section className="overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground">
          <SectionHeader
            title="What you are proving"
            note="The claim states your history stays within these bounds"
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

        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Generate verified claim
        </Button>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-300/80 bg-red-50/70 px-3 py-2.5 text-sm text-red-800"
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
                  <p className="font-semibold">Claim issued</p>
                  <p className="mt-0.5 text-xs text-paper/70">
                    This Wave 1 demo evaluates claims in your browser
                  </p>
                </div>
              </div>
              <div className="border-t border-paper/15 px-5 py-4 sm:px-6">
                <p className="text-xs text-paper/60">Public commitment</p>
                <code className="mt-2 block break-all font-mono text-[13px] leading-relaxed text-amber">
                  {result.commitment}
                </code>
                <p className="mt-3 text-xs leading-relaxed text-paper/60">
                  Share this commitment with buyers. They can verify the claim result
                  without ever seeing your history. In this demo the registry lives in
                  the current browser session.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-300/80 bg-card px-5 py-4 sm:px-6">
              <p className="font-semibold text-red-800">Claim not issued</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Your history does not satisfy the claim criteria. Adjust the bounds
                above and try again.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
