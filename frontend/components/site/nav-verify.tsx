'use client';

import { useState } from 'react';
import { verifyClaim, isValidCommitment } from '@/lib/midnight-client';
import { cn } from '@/lib/utils';

type NavVerifyState = 'idle' | 'checking' | 'verified' | 'failed' | 'invalid';

/**
 * Inline commitment verification, available from any page. `verifyClaim` only
 * needs a commitment, so this is a real feature rather than a shortcut — it
 * makes the nav functional instead of just a menu.
 */
export function NavVerify({ className }: { className?: string }) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<NavVerifyState>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = value.trim();
    if (!isValidCommitment(normalized)) {
      setState('invalid');
      return;
    }
    setState('checking');
    try {
      const result = await verifyClaim(normalized, {});
      setState(result.verified ? 'verified' : 'failed');
    } catch {
      setState('failed');
    }
  }

  const invalid = state === 'failed' || state === 'invalid';
  const buttonLabel =
    state === 'checking' ? '…' : state === 'verified' ? '✓' : state === 'failed' ? '✗' : state === 'invalid' ? '!' : 'Verify';

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn('relative flex items-center', className)}
    >
      <label htmlFor="nav-verify" className="sr-only">
        Verify a claim commitment
      </label>
      <input
        id="nav-verify"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (state !== 'idle') setState('idle');
        }}
        placeholder="Verify a commitment…"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'h-8 w-44 rounded-md border bg-ground/70 pl-3 pr-16 font-mono text-[11px] uppercase tracking-[0.06em] text-bone placeholder:normal-case placeholder:tracking-normal placeholder:text-faint focus-visible:outline-none focus-visible:ring-1 lg:w-52',
          state === 'verified'
            ? 'border-seal/60 focus-visible:ring-seal/50'
            : invalid
              ? 'border-danger/60 focus-visible:ring-danger/50'
              : 'border-line focus-visible:border-signal focus-visible:ring-signal/40'
        )}
      />
      <button
        type="submit"
        className={cn(
          'absolute right-1 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
          state === 'verified'
            ? 'text-seal'
            : invalid
              ? 'text-danger'
              : 'text-dim hover:text-bone'
        )}
      >
        {buttonLabel}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'verified'
          ? 'Commitment verified'
          : state === 'failed'
            ? 'No matching claim found'
            : state === 'invalid'
              ? 'Invalid commitment'
              : ''}
      </span>
    </form>
  );
}
