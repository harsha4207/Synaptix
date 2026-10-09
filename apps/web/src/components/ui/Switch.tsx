import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '../../lib/utils';

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, checked, onCheckedChange, onChange, label, description, id, disabled, ...props }, ref) => {
  const handleCheckedChange = (val: boolean) => {
    if (onCheckedChange) onCheckedChange(val);
    if (onChange) onChange(val);
  };

  const switchElement = (
    <SwitchPrimitives.Root
      id={id}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--c-blue)] data-[state=unchecked]:bg-[var(--c-border-2)]',
        className
      )}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      ref={ref}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  );

  if (label || description) {
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={id}
              className="text-xs font-semibold text-[var(--c-text-1)] cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-[11px] text-[var(--c-text-2)] mt-0.5">{description}</p>
          )}
        </div>
        {switchElement}
      </div>
    );
  }

  return switchElement;
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
