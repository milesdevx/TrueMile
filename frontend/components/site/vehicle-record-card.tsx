import * as React from 'react';
import { cn } from '@/lib/utils';
import { Odometer } from '@/components/site/odometer';
import { VerifiedStamp } from '@/components/site/verified-stamp';

function RedactionBar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('redacted inline-block h-[1.05em] select-none rounded-[2px] align-middle', className)}
    />
  );
}

function PadlockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 text-faint"
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

function RecordField({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-x-6 border-b border-line/60 px-5 py-4 last:border-b-0 sm:grid-cols-[128px_1fr] sm:px-6">
      <dt className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-faint">
        {label}
      </dt>
      <dd className="flex min-w-0 items-center justify-between gap-3">
        <span className="min-w-0">{children}</span>
        {trailing}
      </dd>
    </div>
  );
}

interface VehicleRecordCardProps {
  className?: string;
  recordNo?: string;
  /** The hero card shows a muted embossed mark; a live proof can pass 'verified'. */
  sealState?: 'muted' | 'verified';
}

/**
 * The product's hero asset: a vehicle title certificate with fields sealed.
 * Note the deliberate contrast — VIN/odometer/accidents are held secret while
 * Service discloses a coarse category, so the card demonstrates that privacy
 * here is not an all-or-nothing switch.
 */
export function VehicleRecordCard({
  className,
  recordNo = 'No. TM-000041',
  sealState = 'muted',
}: VehicleRecordCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-dashed border-line bg-panel shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_30px_70px_-40px_rgba(0,0,0,0.95)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-faint">
            Vehicle record
          </p>
          <p className="font-mono text-[11px] tracking-tight text-dim">{recordNo}</p>
        </div>
        {sealState === 'verified' ? (
          <VerifiedStamp state="verified" animate className="h-16 w-16 -rotate-6 sm:h-20 sm:w-20" />
        ) : (
          <VerifiedStamp muted className="h-14 w-14 sm:h-16 sm:w-16" />
        )}
      </div>

      <dl>
        <RecordField label="VIN" trailing={<PadlockIcon />}>
          <RedactionBar className="w-[104px] sm:w-[132px]" />
        </RecordField>
        <RecordField label="Odometer">
          <Odometer redacted rollIn digits={6} size="md" />
        </RecordField>
        <RecordField label="Accidents" trailing={<PadlockIcon />}>
          <RedactionBar className="w-[44px] sm:w-[52px]" />
        </RecordField>
        <RecordField label="Service">
          <span
            title="Categories like this reveal no specific values."
            className="inline-flex items-center gap-1.5 rounded-full border border-seal/40 bg-seal/10 px-2.5 py-0.5 text-xs font-medium text-seal"
          >
            Dealer-serviced
          </span>
        </RecordField>
      </dl>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line/70 bg-panel2/50 px-5 py-3 text-xs text-dim sm:px-6">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sealed" />
          Sealed fields
        </span>
        <span className="font-mono text-[11px] tracking-tight text-faint">
          Proof carries no raw values
        </span>
      </div>
    </div>
  );
}
