import * as React from 'react';
import { cn } from '@/lib/utils';

type OdometerSize = 'sm' | 'md' | 'lg';

interface OdometerProps {
  /** The numeric figure to display. Ignored when `redacted` is set. */
  value?: string | number;
  /** Pad to this many digits with leading zeros. */
  digits?: number;
  /** Render a sealed recess instead of a figure. */
  redacted?: boolean;
  size?: OdometerSize;
  suffix?: string;
  label?: string;
  /** One-time roll-in of the slots on load. Use only on the hero card. */
  rollIn?: boolean;
  className?: string;
}

const cellSize: Record<OdometerSize, string> = {
  sm: 'h-7 w-5 text-sm',
  md: 'h-9 w-7 text-lg',
  lg: 'h-12 w-9 text-2xl',
};

const padSize: Record<OdometerSize, string> = {
  sm: 'h-7 w-3 text-sm',
  md: 'h-9 w-3.5 text-lg',
  lg: 'h-12 w-5 text-2xl',
};

/**
 * Dashboard-odometer digits — fixed-width, recessed, tabular. Reserved for
 * real numbers only (mileage, VIN, hashes), never headings or labels.
 */
export function Odometer({
  value = '',
  digits,
  redacted = false,
  size = 'md',
  suffix,
  label,
  rollIn = false,
  className,
}: OdometerProps) {
  const raw = typeof value === 'number' ? String(Math.max(0, Math.trunc(value))) : value;
  const padded =
    digits && raw.length < digits ? raw.padStart(digits, '0') : raw;
  const chars = padded.length > 0 ? padded.split('') : ['0'];

  const accessibleLabel = redacted
    ? 'Sealed figure'
    : `${label ? `${label}: ` : ''}${raw}${suffix ? ` ${suffix}` : ''}`;

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      role="img"
      aria-label={accessibleLabel}
    >
      <span className={cn('odometer-face inline-flex items-center gap-[3px] rounded-md p-[3px]')}>
        {redacted
          ? Array.from({ length: digits ?? 5 }).map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn(
                  'odometer-cell-redacted grid place-items-center rounded-[2px]',
                  cellSize[size],
                  rollIn && 'odometer-roll'
                )}
                style={rollIn ? { animationDelay: `${i * 40}ms` } : undefined}
              >
                <span className="h-[2px] w-3 rounded-full bg-faint/70" />
              </span>
            ))
          : chars.map((char, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn(
                  'grid place-items-center rounded-[2px] bg-ground font-mono tabular-nums text-bone ring-1 ring-inset ring-line/60',
                  cellSize[size]
                )}
              >
                {char}
              </span>
            ))}
      </span>
      {suffix && !redacted && (
        <span className={cn('font-mono text-dim', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {suffix}
        </span>
      )}
    </span>
  );
}
