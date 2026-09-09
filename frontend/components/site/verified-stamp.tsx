import * as React from 'react';
import { cn } from '@/lib/utils';

interface VerifiedStampProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
}

export function VerifiedStamp({ className, animate = true, ...props }: VerifiedStampProps) {
  return (
    <div
      className={cn('relative shrink-0 select-none', className)}
      role="img"
      aria-label="Verified"
      {...props}
    >
      <div className={cn('h-full w-full', animate && 'stamp-anim')}>
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r="47.5" fill="hsl(var(--ink))" stroke="#C98A2C" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r="39.5"
            fill="none"
            stroke="#C98A2C"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.7"
          />
          <path
            d="M50 28.5l1.2 2.6 2.9 0.42 -2.1 2.05 0.5 2.9 -2.5-1.3 -2.5 1.3 0.5 -2.9 -2.1-2.05 2.9-0.42z"
            fill="#C98A2C"
          />
          <text
            x="50"
            y="49"
            textAnchor="middle"
            fontSize="7.5"
            letterSpacing="2.8"
            fill="#EDE7D9"
            opacity="0.85"
            style={{ fontFamily: 'var(--font-inter-tight), sans-serif' }}
          >
            TRUEMILE
          </text>
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fontSize="13.5"
            fontWeight="800"
            letterSpacing="1.6"
            fill="#C98A2C"
            style={{ fontFamily: 'var(--font-inter-tight), sans-serif' }}
          >
            VERIFIED
          </text>
          <circle cx="46" cy="72.5" r="1.1" fill="#C98A2C" opacity="0.9" />
          <circle cx="54" cy="72.5" r="1.1" fill="#C98A2C" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}
