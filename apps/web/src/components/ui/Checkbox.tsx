import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'onChange'> {
  label?: React.ReactNode;
  description?: string;
  onChange?: (e: { target: { checked: boolean } }) => void;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, checked, onCheckedChange, onChange, disabled, id, ...props }, ref) => {
  const inputId = id || (label ? `cb-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const handleCheckedChange = (val: boolean) => {
    if (onCheckedChange) onCheckedChange(val);
    if (onChange) onChange({ target: { checked: val } });
  };

  const checkboxNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={inputId}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-[var(--r-sm)] border border-[var(--c-border-2)] bg-[var(--c-surface)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--c-blue)] data-[state=checked]:border-[var(--c-blue)] data-[state=checked]:text-white transition-colors',
        className
      )}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (label || description) {
    return (
      <div className="flex items-start gap-2 select-none">
        <div className={description ? 'mt-0.5' : ''}>{checkboxNode}</div>
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'text-xs font-medium text-[var(--c-text-1)] cursor-pointer',
                disabled && 'opacity-60 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-[var(--c-text-2)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return checkboxNode;
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
