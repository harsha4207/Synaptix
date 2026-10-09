import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isError, leftIcon, rightIcon, style, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text-1)] shadow-xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-semibold placeholder:text-[var(--c-text-3)] focus-visible:outline-none focus-visible:border-[var(--c-blue)] focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] disabled:cursor-not-allowed disabled:opacity-50',
          leftIcon ? 'pl-10 pr-3.5' : rightIcon ? 'pl-3.5 pr-10' : 'px-3.5',
          'py-2',
          isError && 'border-[var(--c-danger)] focus-visible:ring-[var(--c-danger)]',
          className
        )}
        style={{
          boxSizing: 'border-box',
          ...(leftIcon ? { paddingLeft: '38px' } : {}),
          ...(rightIcon ? { paddingRight: '38px' } : {}),
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--c-text-3)] pointer-events-none z-10">
              {leftIcon}
            </span>
          )}
          {inputElement}
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--c-text-3)] z-10">
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    return inputElement;
  }
);
Input.displayName = 'Input';

export { Input };
