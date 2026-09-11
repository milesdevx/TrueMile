import * as React from 'react';
import { cn } from '@/lib/utils';

export type SealState = 'verified' | 'pending' | 'failed';

interface VerifiedStampProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: SealState;
  /** Press the seal once when it resolves — use only on a real state change. */
  animate?: boolean;
  /** A quiet, monochrome outline mark — a signature, not a claim result. */
  muted?: boolean;
}

const PALETTE = {
  seal: '#c9a24a',
  sealEdge: '#8a6d2f',
  ground: '#15171c',
  panel: '#1b1e26',
  panel2: '#22262f',
  line: '#31363f',
  faint: '#5c6270',
  danger: '#d3654f',
  dangerEdge: '#8a3b2c',
  bone: '#ece8df',
} as const;

const STATE_COPY: Record<SealState, string> = {
  verified: 'Verified',
  pending: 'Proof generating',
  failed: 'Claim not verified',
};

const STATE_WORD: Record<SealState, string> = {
  verified: 'VERIFIED',
  pending: 'SEALING',
  failed: 'FAILED',
};

/**
 * A wax-seal badge. `seal` (gold) marks a verified public result, `sealed`
 * (chrome-teal) marks hidden data — this component only ever speaks the former,
 * plus its pending/failed variants.
 */
export function VerifiedStamp({
  className,
  state = 'verified',
  animate = false,
  muted = false,
  ...props
}: VerifiedStampProps) {
  if (muted) {
    return (
      <div
        className={cn('relative shrink-0 select-none', className)}
        role="img"
        aria-label="TrueMile seal"
        style={{ color: 'rgb(var(--faint))' }}
        {...props}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="9"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="38.5" stroke="currentColor" strokeWidth="1.5" />
          <circle
            cx="50"
            cy="50"
            r="31"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2.5 3.5"
          />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill="currentColor"
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            TM
          </text>
        </svg>
      </div>
    );
  }

  const isVerified = state === 'verified';
  const isFailed = state === 'failed';

  const wax = isFailed ? PALETTE.danger : isVerified ? PALETTE.seal : PALETTE.panel;
  const edge = isFailed ? PALETTE.dangerEdge : isVerified ? PALETTE.sealEdge : PALETTE.line;
  const ink = isVerified || isFailed ? PALETTE.ground : PALETTE.faint;
  const bump = isVerified ? PALETTE.seal : isFailed ? PALETTE.danger : PALETTE.panel2;
  const ring = isVerified || isFailed ? 'rgba(21,23,28,0.35)' : PALETTE.line;

  return (
    <div
      className={cn('relative shrink-0 select-none', className)}
      role="img"
      aria-label={STATE_COPY[state]}
      {...props}
    >
      <div className={cn('h-full w-full', animate && isVerified && 'seal-press')}>
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          {/* Scalloped wax edge */}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={i}
              cx="50"
              cy="9"
              r="6.5"
              fill={bump}
              stroke={edge}
              strokeWidth="0.75"
              transform={`rotate(${i * 30} 50 50)`}
            />
          ))}

          {/* Wax disc */}
          <circle cx="50" cy="50" r="38.5" fill={wax} stroke={edge} strokeWidth="1.5" />

          {/* Embossed inner ring */}
          <circle
            cx="50"
            cy="50"
            r="31"
            fill="none"
            stroke={ring}
            strokeWidth="1"
            strokeDasharray={isVerified || isFailed ? 'none' : '2.5 3.5'}
          />
          <circle cx="50" cy="50" r="28.5" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.25" />

          <text
            x="50"
            y="42"
            textAnchor="middle"
            fontSize="7.5"
            letterSpacing="2.4"
            fill={ink}
            opacity={isVerified || isFailed ? 0.75 : 0.9}
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontWeight: 600 }}
          >
            TRUEMILE
          </text>

          <text
            x="50"
            y="60"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            letterSpacing="1.2"
            fill={ink}
            style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
          >
            {STATE_WORD[state]}
          </text>

          {isVerified && (
            <path
              d="M43 70.5 l4.5 4.5 l9.5 -10.5"
              fill="none"
              stroke={ink}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {isFailed && (
            <path
              d="M44 69 l12 12 M56 69 l-12 12"
              fill="none"
              stroke={ink}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}
          {!isVerified && !isFailed && (
            <>
              <circle cx="44" cy="72" r="1.6" fill={ink} />
              <circle cx="50" cy="72" r="1.6" fill={ink} />
              <circle cx="56" cy="72" r="1.6" fill={ink} />
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
