import { cn } from '@/lib/utils';
import type * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, type, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'focus-ring flex h-9 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-1 text-sm placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Input };
