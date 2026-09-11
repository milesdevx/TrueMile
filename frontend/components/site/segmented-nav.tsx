'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SegmentedNavItem {
  href: string;
  label: string;
}

interface SegmentedNavProps {
  items: SegmentedNavItem[];
  className?: string;
}

/**
 * A two-stop segmented pill with a single sliding highlight — one motion for
 * the whole control, not per-link hover effects.
 */
export function SegmentedNav({ items, className }: SegmentedNavProps) {
  const pathname = usePathname();
  const activeIndex = items.findIndex(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'relative inline-flex rounded-full border border-line bg-ground/70 p-1',
        className
      )}
    >
      {activeIndex >= 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-full bg-panel2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
      )}

      {items.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative z-10 w-20 rounded-full px-3 py-1.5 text-center text-sm font-medium transition-colors sm:w-24',
              active ? 'text-bone' : 'text-dim hover:text-bone'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
