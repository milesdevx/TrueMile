import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CtaLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'signal' | 'seal' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const base =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-ground';

const variants = {
  signal: 'bg-signal text-onaccent hover:bg-signal/90',
  seal: 'bg-seal text-onaccent hover:bg-seal/90',
  outline: 'border border-line bg-transparent text-bone hover:border-dim hover:bg-panel2/60',
  ghost: 'bg-transparent text-dim hover:text-bone',
};

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-12 px-8 text-base',
};

export function CtaLink({
  href,
  variant = 'signal',
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
