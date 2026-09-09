import * as React from 'react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

const MARK_COLORS = {
  amber: '#C98A2C',
  ink: '#14171F',
} as const;

export type MarkTone = keyof typeof MARK_COLORS;

export interface TrueMileMarkProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
  tone?: MarkTone;
  label?: string;
}

export function TrueMileMark({
  className,
  tone = 'amber',
  label = 'TrueMile verified vehicle history',
  ...props
}: TrueMileMarkProps) {
  const color = MARK_COLORS[tone];
  const textPathId = useId();

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={label}
      fill="none"
      {...props}
    >
      <defs>
        <path
          id={textPathId}
          d="M25.7 50.8 A35.5 35.5 0 0 1 94.3 50.8"
          fill="none"
        />
      </defs>

      <g transform="rotate(42 60 60)">
        <circle
          cx="60"
          cy="60"
          r="55"
          stroke={color}
          strokeWidth="4.5"
          strokeDasharray="340.1 5.5"
        />
      </g>
      <circle
        cx="60.9"
        cy="59.3"
        r="55.2"
        stroke={color}
        strokeWidth="1.1"
        opacity="0.28"
      />
      <circle
        cx="60"
        cy="60"
        r="47.5"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="2.6 3.6"
        opacity="0.55"
      />

      <text
        fill={color}
        fontSize="11"
        fontWeight="700"
        style={{ fontFamily: 'var(--font-inter-tight), sans-serif' }}
      >
        <textPath href={`#${textPathId}`} textLength="93" lengthAdjust="spacing">
          TRUEMILE
        </textPath>
      </text>

      <path
        d="M33 62 A27 27 0 0 1 87 62"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="60"
        y1="62"
        x2="81.4"
        y2="51.1"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="60" cy="62" r="3" fill={color} />

      <path
        d="M60 80.5 l1.2 2.6 2.9 .42 -2.1 2.05 .5 2.9 -2.5 -1.3 -2.5 1.3 .5 -2.9 -2.1 -2.05 2.9 -.42 z"
        fill={color}
      />
    </svg>
  );
}

export interface TrueMileLogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  markClassName?: string;
  variant?: 'default' | 'on-ink';
}

export function TrueMileLogo({
  className,
  markClassName,
  variant = 'default',
  ...props
}: TrueMileLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} {...props}>
      <TrueMileMark
        className={cn('h-8 w-8', markClassName)}
        aria-hidden="true"
        label=""
      />
      <span
        className={cn(
          'text-xl font-bold tracking-tight',
          variant === 'default' ? 'text-ink' : 'text-paper'
        )}
      >
        TrueMile
      </span>
    </span>
  );
}
