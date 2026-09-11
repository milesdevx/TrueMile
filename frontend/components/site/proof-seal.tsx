import * as React from 'react';
import { cn } from '@/lib/utils';

export type ProofSealState = 'verifying' | 'verified' | 'failed';

interface ProofSealProps {
  state: ProofSealState;
  className?: string;
}

const SEAL = '#c9a24a';
const SEAL_EDGE = '#8a6d2f';
const DANGER = '#d3654f';
const DANGER_EDGE = '#8a3b2c';
const LINE = '#31363f';
const FAINT = '#5c6270';

const STATE_LABEL: Record<ProofSealState, string> = {
  verifying: 'Generating proof',
  verified: 'Proof verified',
  failed: 'Proof not verified',
};

/**
 * The proof-generation indicator — one persistent element across the whole
 * submit → verify → result cycle, so the fill can actually transition as real
 * work completes (rather than swapping badges).
 *
 *   verifying: outline traces in (600ms), then a calm pulse while waiting
 *   verified:  outline fills solid gold (300ms) + a single settle
 *   failed:    outline shifts to danger (200ms) — no shake
 */
export function ProofSeal({ state, className }: ProofSealProps) {
  const isVerified = state === 'verified';
  const isFailed = state === 'failed';
  const isVerifying = state === 'verifying';

  const wax = isVerified ? SEAL : isFailed ? DANGER : 'transparent';
  const edge = isVerified ? SEAL_EDGE : isFailed ? DANGER_EDGE : LINE;
  const ink = isVerified || isFailed ? '#15171c' : FAINT;
  const bump = isVerified ? SEAL : isFailed ? DANGER : 'transparent';

  const fillTransition = 'fill 300ms var(--ease-out), stroke 200ms var(--ease-out)';

  return (
    <div
      className={cn(
        'relative shrink-0 select-none',
        isVerified && 'proof-seal-settle',
        className
      )}
      role="img"
      aria-label={STATE_LABEL[state]}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <g
          className={cn(isVerifying && 'proof-seal-wait')}
          style={{ transformOrigin: 'center', transition: 'opacity 200ms var(--ease-out)' }}
        >
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
              style={{ transition: fillTransition }}
            />
          ))}

          {/* Traced outline — circumference of r=41 is ~258. */}
          <circle
            cx="50"
            cy="50"
            r="41"
            fill={wax}
            stroke={edge}
            strokeWidth="2"
            className="proof-seal-outline"
            style={{ transition: fillTransition }}
          />
        </g>

        <circle cx="50" cy="50" r="31" fill="none" stroke={ink} strokeWidth="1" opacity="0.5" />
        <circle
          cx="50"
          cy="50"
          r="28.5"
          fill="none"
          stroke={ink}
          strokeWidth="0.5"
          opacity="0.25"
        />

        <text
          x="50"
          y="42"
          textAnchor="middle"
          fontSize="7.5"
          letterSpacing="2.4"
          fill={ink}
          opacity={isVerifying ? 0.7 : 0.85}
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif', fontWeight: 600 }}
        >
          TRUEMILE
        </text>
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="700"
          letterSpacing="1.1"
          fill={ink}
          style={{ fontFamily: 'var(--font-barlow-condensed), sans-serif' }}
        >
          {isVerified ? 'VERIFIED' : isFailed ? 'FAILED' : 'SEALING'}
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
        {isVerifying && (
          <>
            <circle cx="44" cy="72" r="1.6" fill={ink} />
            <circle cx="50" cy="72" r="1.6" fill={ink} />
            <circle cx="56" cy="72" r="1.6" fill={ink} />
          </>
        )}
      </svg>
    </div>
  );
}
