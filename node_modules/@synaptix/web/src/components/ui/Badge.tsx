import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--c-blue)] focus:ring-offset-2 select-none gap-1.5',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--c-navy)] text-white hover:bg-[var(--c-navy-hover)]',
        navy:
          'border-transparent bg-[var(--c-navy)] text-white hover:bg-[var(--c-navy-hover)]',
        blue:
          'border-transparent bg-[var(--c-blue-soft)] text-[var(--c-blue)] border-[var(--c-blue-ring)]',
        secondary:
          'border-transparent bg-[var(--c-surface-2)] text-[var(--c-text-1)]',
        destructive:
          'border-transparent bg-[var(--c-danger-bg)] text-[var(--c-danger)] border-[var(--c-danger-border)]',
        success:
          'border-transparent bg-[var(--c-success-bg)] text-[var(--c-success)] border-[var(--c-success-border)]',
        warning:
          'border-transparent bg-[var(--c-warning-bg)] text-[var(--c-warning)] border-[var(--c-warning-border)]',
        outline: 'text-[var(--c-text-1)] border-[var(--c-border-2)]',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-[11px] px-2.5 py-0.5',
        lg: 'text-xs px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'blue',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  pulseDot?: boolean;
}

function Badge({
  className,
  variant = 'blue',
  size = 'md',
  dot = false,
  pulseDot = false,
  children,
  ...props
}: BadgeProps) {
  const dotColorClass = {
    default: 'bg-white',
    navy: 'bg-white',
    blue: 'bg-[var(--c-blue)]',
    secondary: 'bg-[var(--c-text-2)]',
    destructive: 'bg-[var(--c-danger)]',
    success: 'bg-[var(--c-success)]',
    warning: 'bg-[#F59E0B]',
    outline: 'bg-[var(--c-text-3)]',
  }[variant || 'blue'];

  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColorClass,
            pulseDot && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
