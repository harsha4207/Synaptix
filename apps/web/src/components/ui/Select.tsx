import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  isError?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, isError, placeholder, className = '', style, ...props }, ref) => {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <select
          ref={ref}
          className={`filter-select ${isError ? 'input-error' : ''} ${className}`.trim()}
          style={{
            width: '100%',
            appearance: 'none',
            paddingRight: '36px',
            ...style,
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: 'var(--sp-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--c-text-3)',
          }}
        >
          <ChevronDown size={16} />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
