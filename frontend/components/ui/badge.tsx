import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'sealed';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-signal text-onaccent',
    secondary: 'bg-panel2 text-bone',
    outline: 'border border-line bg-transparent text-bone',
    destructive: 'bg-danger text-bone',
    success: 'border border-seal/50 bg-seal/15 text-seal',
    sealed: 'border border-sealed/50 bg-sealed/15 text-sealed',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
