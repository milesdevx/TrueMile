import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'amber' | 'ink' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const base =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper';

const variants = {
  amber: 'bg-amber text-ink hover:bg-amber/90',
  ink: 'bg-ink text-paper hover:bg-ink/90',
  outline:
    'border border-ink/60 bg-transparent text-ink hover:border-ink hover:bg-paper/60',
};

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-12 px-8 text-base',
};

export function CtaLink({
  href,
  variant = 'amber',
  size = 'md',
  className,
  ...props
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
