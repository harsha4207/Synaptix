import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--r-md)] text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none gap-2 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--c-navy)] text-white hover:bg-[var(--c-navy-hover)] shadow-xs',
        navy:
          'bg-[var(--c-navy)] text-white hover:bg-[var(--c-navy-hover)] shadow-xs',
        primary:
          'bg-[var(--c-navy)] text-white hover:bg-[var(--c-navy-hover)] shadow-xs',
        blue:
          'bg-[var(--c-blue)] text-white hover:bg-[var(--c-blue-hover)] shadow-xs',
        secondary:
          'bg-[var(--c-surface)] text-[var(--c-text-1)] border border-[var(--c-border)] hover:bg-[var(--c-page)] hover:border-[var(--c-border-2)] shadow-xs',
        outline:
          'border border-[var(--c-border)] bg-transparent hover:bg-[var(--c-page)] text-[var(--c-text-1)]',
        ghost:
          'hover:bg-[var(--c-surface-2)] text-[var(--c-text-1)] hover:text-[var(--c-blue)]',
        destructive:
          'bg-[var(--c-danger)] text-white hover:bg-[#A82424] shadow-xs',
        link: 'text-[var(--c-blue)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-[var(--r-sm)] px-2.5 text-[11px]',
        md: 'h-9 px-3.5 py-2 text-xs',
        lg: 'h-11 rounded-[var(--r-lg)] px-6 text-sm',
        icon: 'h-9 w-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loading = false,
      leftIcon,
      icon,
      rightIcon,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const isActuallyLoading = isLoading || loading;
    const leadingIcon = leftIcon || icon;

    const variantStyle: React.CSSProperties = React.useMemo(() => {
      switch (variant) {
        case 'blue':
          return { backgroundColor: 'var(--c-blue)', color: '#FFFFFF' };
        case 'navy':
        case 'primary':
        case 'default':
          return { backgroundColor: 'var(--c-navy)', color: '#FFFFFF' };
        case 'secondary':
          return { backgroundColor: 'var(--c-surface)', color: 'var(--c-text-1)', border: '1px solid var(--c-border)' };
        case 'destructive':
          return { backgroundColor: 'var(--c-danger)', color: '#FFFFFF' };
        default:
          return {};
      }
    }, [variant]);

    return (
      <button
        ref={ref}
        disabled={disabled || isActuallyLoading}
        style={{ ...variantStyle, ...style }}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isActuallyLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        ) : (
          leadingIcon && <span className="inline-flex shrink-0">{leadingIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isActuallyLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
