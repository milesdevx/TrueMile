import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-line bg-ground/70 px-3 py-2 text-sm text-bone shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-faint focus-visible:border-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export { Input };
