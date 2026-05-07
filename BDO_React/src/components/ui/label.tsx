'use client';
import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import type * as React from 'react';

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  ref?: React.Ref<React.ElementRef<typeof LabelPrimitive.Root>>;
}

function Label({ className, ref, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'text-xs font-medium leading-none text-[var(--text-primary)] mb-1 block',
        className,
      )}
      {...props}
    />
  );
}
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
