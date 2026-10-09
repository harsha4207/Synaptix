import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isError, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[var(--r-md)] border border-[var(--c-border)] bg-[var(--c-surface)] px-3 py-2 text-xs text-[var(--c-text-1)] shadow-xs placeholder:text-[var(--c-text-3)] focus-visible:outline-none focus-visible:border-[var(--c-blue)] focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          isError && 'border-[var(--c-danger)] focus-visible:ring-[var(--c-danger)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
