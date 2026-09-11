import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusTone = 'seal' | 'sealed' | 'signal' | 'danger' | 'faint';

interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  label: string;
  /** Single confirmation pulse — use only on a real state change. */
  pulse?: boolean;
  showBorder?: boolean;
  children?: React.ReactNode;
}

const toneStyles: Record<StatusTone, { dot: string; text: string; border: string }> = {
  seal: { dot: 'bg-seal', text: 'text-seal', border: 'border-seal/40' },
  sealed: { dot: 'bg-sealed', text: 'text-sealed', border: 'border-sealed/40' },
  signal: { dot: 'bg-signal', text: 'text-signal', border: 'border-signal/40' },
  danger: { dot: 'bg-danger', text: 'text-danger', border: 'border-danger/40' },
  faint: { dot: 'bg-faint', text: 'text-dim', border: 'border-line' },
};

export function StatusChip({
  tone = 'faint',
  label,
  pulse = false,
  showBorder = true,
  className,
  children,
  ...props
}: StatusChipProps) {
  const styles = toneStyles[tone];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium',
        showBorder && `border ${styles.border}`,
        styles.text,
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 shrink-0 rounded-full', styles.dot, pulse && 'dot-confirm')}
      />
      <span className="whitespace-nowrap">{label}</span>
      {children}
    </span>
  );
}
