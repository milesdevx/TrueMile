'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { listClaims, type ClaimRecord } from '@/lib/midnight-client';
import { cn } from '@/lib/utils';

function shortHash(value: string): string {
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Verdict({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
        verified ? 'border-seal/50 text-seal' : 'border-danger/50 text-danger'
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6">
        {verified ? (
          <path d="M5 12.5 10 17.5 19 7" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7 7l10 10M17 7L7 17" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}

interface ClaimsRegistryProps {
  limit?: number;
  showLink?: boolean;
  className?: string;
}

/**
 * The public claims registry — read-only claim commitments, verdicts, and
 * timestamps. In Wave 1 this reads the local registry that stands in for the
 * on-chain `claimCommitments` map. Static by default; only rows that arrive
 * after first paint animate in, so the initial batch reads as a settled record.
 */
export function ClaimsRegistry({ limit, showLink = false, className }: ClaimsRegistryProps) {
  const [records, setRecords] = useState<ClaimRecord[] | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const initialised = useRef(false);

  useEffect(() => {
    const load = () => {
      const all = listClaims();
      setRecords(all);
      if (!initialised.current) {
        all.forEach((record) => seen.current.add(record.commitment));
        initialised.current = true;
      }
    };

    load();
    window.addEventListener('truemile:claim-issued', load);
    return () => window.removeEventListener('truemile:claim-issued', load);
  }, []);

  // Mark animated rows seen after they render so they animate only once.
  useEffect(() => {
    records?.forEach((record) => seen.current.add(record.commitment));
  }, [records]);

  const rows = limit && records ? records.slice(0, limit) : records;

  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-panel', className)}>
      <div className="flex items-center justify-between gap-4 border-b border-line/60 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-bone">
            Claims registry
          </h3>
          <p className="mt-0.5 text-xs text-dim">
            Public commitments and verdicts — no raw history, by design
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
          {records ? `${records.length} record${records.length === 1 ? '' : 's'}` : '—'}
        </span>
      </div>

      {rows === null ? (
        <p className="px-5 py-6 text-sm text-dim sm:px-6">Reading the registry…</p>
      ) : rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-dim sm:px-6">
          No claims issued yet in this browser.
        </p>
      ) : (
        <ul>
          {rows.map((record) => {
            const isNew = initialised.current && !seen.current.has(record.commitment);
            return (
              <li
                key={record.commitment}
                className={cn(
                  'flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line/60 px-5 py-3.5 last:border-b-0 sm:px-6',
                  isNew && 'fade-up'
                )}
              >
                <Verdict verified={record.verified} />

                <code
                  className="min-w-0 flex-1 truncate font-mono text-[13px] text-bone"
                  title={record.commitment}
                >
                  {shortHash(record.commitment)}
                </code>

                <span className="font-mono text-[11px] text-faint" title={record.vehicleId}>
                  VIN {shortHash(record.vehicleId).slice(0, 14)}
                </span>

                <span className="rounded-[3px] border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">
                  {record.schemaVersion}
                </span>

                <time
                  dateTime={new Date(record.timestamp).toISOString()}
                  className="font-mono text-[11px] text-dim"
                >
                  {formatTimestamp(record.timestamp)}
                </time>
              </li>
            );
          })}
        </ul>
      )}

      {showLink && (
        <div className="border-t border-line/60 px-5 py-3 text-right sm:px-6">
          <Link
            href="/registry"
            className="text-sm text-dim transition-colors hover:text-bone"
          >
            View full registry →
          </Link>
        </div>
      )}
    </div>
  );
}
