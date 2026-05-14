import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_rgba(13,77,155,0.20)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [transition:color_150ms_cubic-bezier(0.16,1,0.3,1),background-color_150ms_cubic-bezier(0.16,1,0.3,1),border-color_150ms_cubic-bezier(0.16,1,0.3,1),box-shadow_150ms_cubic-bezier(0.16,1,0.3,1),transform_150ms_cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--corp-mid)] text-white hover:bg-[#0b4489]',
        destructive: 'bg-[var(--idu-red)] text-white hover:bg-[var(--idu-red)]/90',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--muted)] hover:shadow-sm',
        secondary:
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80',
        ghost:
          'text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text-primary)] hover:shadow-sm',
        link: 'text-[var(--corp-primary)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
}

export { Button };
