'use client';

import { useEffect, useState } from 'react';
import { getRegistryStats, type RegistryStats } from '@/lib/midnight-client';
import { Odometer } from '@/components/site/odometer';
import { cn } from '@/lib/utils';

/**
 * Aggregate counts from the public registry — pure totals, nothing tied to an
 * individual record. Static and matter-of-fact: no count-up animation, because
 * a real ledger stat shouldn't feel like a marketing flourish.
 */
export function RegistryStatsBar({ className }: { className?: string }) {
  const [stats, setStats] = useState<RegistryStats | null>(null);

  useEffect(() => {
    const load = () => setStats(getRegistryStats());
    load();
    window.addEventListener('truemile:claim-issued', load);
    return () => window.removeEventListener('truemile:claim-issued', load);
  }, []);

  const counts = [
    { label: 'Claims issued', value: stats?.total ?? 0, digits: 4 },
    { label: 'Verified', value: stats?.verified ?? 0, digits: 4 },
    { label: 'Vehicles', value: stats?.vehicles ?? 0, digits: 3 },
  ];

  const labelClass =
    'font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-faint';

  return (
    <section
      aria-label="Registry statistics"
      className={cn('border-y border-line/80 bg-panel/40', className)}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-5 px-5 py-6 sm:px-8">
        {counts.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5">
            <Odometer value={item.value} digits={item.digits} size="sm" />
            <span className={labelClass}>{item.label}</span>
          </div>
        ))}

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-lg leading-7 tabular-nums text-bone">
            {stats ? `${stats.accidentFreePercent}%` : '—'}
          </span>
          <span className={labelClass}>Accident-free</span>
        </div>
      </div>
    </section>
  );
}
